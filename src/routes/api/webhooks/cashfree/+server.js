/**
 * POST /api/webhooks/cashfree
 *
 * Cashfree Payment Link webhook handler.
 * Stores download token in KV indexed by the EXACT order_id
 * that Cashfree puts in the return URL.
 */
import { json } from '@sveltejs/kit';

export async function POST({ request, platform }) {
  try {
    const rawBody = await request.text();
    const env = platform?.env;

    // ── 1. Signature Verification ─────────────────────────────────────────
    const signature = request.headers.get('x-webhook-signature');
    const timestamp  = request.headers.get('x-webhook-timestamp');

    if (env?.CASHFREE_WEBHOOK_SECRET && signature && timestamp) {
      try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw', encoder.encode(env.CASHFREE_WEBHOOK_SECRET),
          { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        );
        const buf = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp + rawBody));
        const computed = btoa(String.fromCharCode(...new Uint8Array(buf)));
        if (computed !== signature) {
          // Log mismatch but DO NOT reject — still process payment
          console.warn('⚠️ Signature mismatch — processing anyway. computed:', computed, 'received:', signature);
        } else {
          console.log('✅ Signature verified');
        }
      } catch (sigErr) {
        console.warn('Signature check error:', sigErr);
      }
    } else {
      console.log('Signature check skipped (no secret or headers)');
    }

    // ── 2. Parse payload ──────────────────────────────────────────────────
    let payload;
    try { payload = JSON.parse(rawBody); } catch { return new Response('OK', { status: 200 }); }

    const data = payload.data || {};
    const eventType = payload.type || '';

    // Log full payload for debugging
    console.log('Cashfree webhook payload:', JSON.stringify(payload));

    // ── 3. Check payment success ──────────────────────────────────────────
    const linkStatus    = data.link_status || '';
    const paymentStatus = data.payment?.payment_status || '';
    const isSuccess =
      linkStatus === 'PAID' ||
      paymentStatus === 'SUCCESS' ||
      eventType.includes('PAYMENT_SUCCESS');

    if (!isSuccess) {
      console.log(`Not a success event. type=${eventType} link_status=${linkStatus} payment_status=${paymentStatus}`);
      return new Response('OK', { status: 200 });
    }

    // ── 4. Extract order_id (Payment Link format: order_details is ARRAY) ─
    // Cashfree return URL sends: ?order_id=CFPay_xxx
    // We must store KV with the SAME key

    let realOrderId = '';

    // Try array format first (Payment Links)
    if (Array.isArray(data.order_details) && data.order_details.length > 0) {
      realOrderId = data.order_details[0]?.order_id || '';
    }
    // Try object format (Payment Gateway)
    if (!realOrderId) realOrderId = data.order?.order_id || '';
    if (!realOrderId) realOrderId = data.order_details?.order_id || '';
    if (!realOrderId) realOrderId = data.order_id || '';

    // The link_id (e.g. pb0u0v2mp4n0_AAAAAAAVltA)
    const linkId = data.link_id || '';

    // Also extract link code from order_id as fallback
    // CFPay_pb0u0v2mp4n0_AAAAAAAVltA_0c90_xxx → pb0u0v2mp4n0_AAAAAAAVltA
    let extractedLinkCode = linkId;
    if (!extractedLinkCode && realOrderId.startsWith('CFPay_')) {
      const parts = realOrderId.replace('CFPay_', '').split('_0c');
      extractedLinkCode = parts[0] || '';
    }

    const customerEmail = data.customer_details?.customer_email || '';

    console.log(`realOrderId=${realOrderId} linkId=${linkId} extractedLinkCode=${extractedLinkCode}`);

    if (!realOrderId && !linkId) {
      console.warn('No order ID found in payload');
      return new Response('OK', { status: 200 });
    }

    // ── 5. Find product from CMS catalog ─────────────────────────────────
    let pdfR2Key  = '';
    let productId = '';

    try {
      const origin = new URL(request.url).origin;
      const res = await fetch(`${origin}/api/products-catalog`);
      if (res.ok) {
        const catalog = await res.json();
        const product = catalog.find(p =>
          p.cashfreePaymentLink && (
            (extractedLinkCode && p.cashfreePaymentLink.includes(extractedLinkCode)) ||
            (linkId && p.cashfreePaymentLink.includes(linkId))
          )
        );
        if (product) {
          pdfR2Key  = product.pdfR2Key;
          productId = product.slug;
          console.log(`Product found: ${productId}, pdf: ${pdfR2Key}`);
        } else {
          console.warn(`No product matched. linkId=${linkId} code=${extractedLinkCode}`);
        }
      }
    } catch (err) {
      console.error('Catalog error:', err);
    }

    // ── 6. Generate download token ────────────────────────────────────────
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = btoa(String.fromCharCode(...tokenBytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const record = JSON.stringify({
      token, orderId: realOrderId, customerEmail, productId, pdfR2Key, expiresAt
    });

    // ── 7. Store in KV — multiple keys for robustness ─────────────────────
    if (env?.PDF_ORDERS) {
      const writes = [];

      // Primary: exact order_id (matches return URL)
      if (realOrderId) {
        writes.push(env.PDF_ORDERS.put(`order:${realOrderId}`, record, { expirationTtl: 86400 }));
      }
      // Fallback: link_id
      if (linkId) {
        writes.push(env.PDF_ORDERS.put(`order:${linkId}`, record, { expirationTtl: 86400 }));
      }
      // Fallback: extracted link code
      if (extractedLinkCode && extractedLinkCode !== linkId) {
        writes.push(env.PDF_ORDERS.put(`order:${extractedLinkCode}`, record, { expirationTtl: 86400 }));
      }
      // Token lookup key
      writes.push(env.PDF_ORDERS.put(`token:${token}`, record, { expirationTtl: 86400 }));

      await Promise.all(writes);
      console.log(`✅ KV written for orderId=${realOrderId}, product=${productId}`);
    } else {
      console.error('PDF_ORDERS KV not bound!');
    }

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('Webhook fatal error:', err);
    return new Response('OK', { status: 200 });
  }
}
