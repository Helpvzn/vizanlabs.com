/**
 * POST /api/webhooks/cashfree
 * SvelteKit server route — Cloudflare platform.env se KV access karta hai.
 */
import { json } from '@sveltejs/kit';

export async function POST({ request, platform }) {
  try {
    const rawBody = await request.text();
    const env = platform?.env;

    // ── Signature Verification ────────────────────────────────────────────
    const signature = request.headers.get('x-webhook-signature');
    const timestamp  = request.headers.get('x-webhook-timestamp');

    if (env?.CASHFREE_WEBHOOK_SECRET) {
      if (!signature || !timestamp) {
        return new Response('Missing signature headers', { status: 401 });
      }

      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(env.CASHFREE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        encoder.encode(timestamp + rawBody)
      );

      const computedSignature = btoa(
        String.fromCharCode(...new Uint8Array(signatureBuffer))
      );

      if (computedSignature !== signature) {
        console.warn('Cashfree webhook: invalid signature');
        return new Response('Invalid signature', { status: 401 });
      }
    } else {
      // Secret not configured yet — allow during initial setup/testing
      console.warn('⚠️ CASHFREE_WEBHOOK_SECRET not set — bypassing signature check');
    }

    // ── Parse payload ─────────────────────────────────────────────────────
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      // Not valid JSON — still return 200 to Cashfree
      return new Response('OK', { status: 200 });
    }

    const eventType = payload.type || '';
    const data      = payload.data || {};

    // Detect payment success (Payment Link format)
    const linkStatus    = data.link_status || '';
    const paymentStatus = data.payment?.payment_status || '';
    const isSuccess =
      linkStatus === 'PAID' ||
      linkStatus === 'PARTIALLY_PAID' || // some test events use this
      paymentStatus === 'SUCCESS' ||
      eventType.includes('PAYMENT_SUCCESS');

    if (!isSuccess) {
      return new Response('OK', { status: 200 });
    }

    // ── Extract identifiers ───────────────────────────────────────────────
    const orderId = 
      data.order?.order_id ||
      data.order_details?.order_id ||
      data.link_id ||
      String(data.cf_link_id || '') ||
      '';

    const customerEmail = data.customer_details?.customer_email || '';

    // The payment link code from the URL
    const linkId = data.link_id || String(data.cf_link_id || '');

    if (!orderId) {
      console.warn('No orderId found in webhook payload');
      return new Response('OK', { status: 200 });
    }

    // ── Find product from catalog (CMS-driven) ────────────────────────────
    let pdfR2Key  = '';
    let productId = '';

    try {
      const origin = new URL(request.url).origin;
      const catalogResp = await fetch(`${origin}/api/products-catalog`);
      if (catalogResp.ok) {
        const catalog = await catalogResp.json();
        const product = catalog.find(p =>
          p.cashfreePaymentLink && linkId &&
          p.cashfreePaymentLink.includes(linkId)
        );
        if (product) {
          pdfR2Key  = product.pdfR2Key;
          productId = product.slug;
        }
      }
    } catch (err) {
      console.error('Catalog lookup error:', err);
    }

    // ── Generate secure download token ────────────────────────────────────
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = btoa(String.fromCharCode(...tokenBytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const record = JSON.stringify({
      token, orderId, customerEmail, productId, pdfR2Key, expiresAt
    });

    // ── Store in KV ───────────────────────────────────────────────────────
    if (env?.PDF_ORDERS) {
      await Promise.all([
        env.PDF_ORDERS.put(`order:${orderId}`, record, { expirationTtl: 86400 }),
        env.PDF_ORDERS.put(`token:${token}`,   record, { expirationTtl: 86400 })
      ]);
      console.log(`✅ Token stored for orderId=${orderId}, product=${productId}`);
    } else {
      console.warn('PDF_ORDERS KV not bound — cannot store token');
    }

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('Cashfree webhook error:', err);
    return new Response('OK', { status: 200 });
  }
}
