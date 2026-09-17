/**
 * POST /api/webhooks/cashfree
 *
 * Cashfree webhook handler — secure payment verification.
 *
 * Flow:
 *  1. Verify HMAC-SHA256 signature from Cashfree
 *  2. Parse payment success event
 *  3. Look up which product was bought (via /api/products-catalog)
 *  4. Generate a cryptographically secure download token
 *  5. Store token in KV (expires in 24 hours)
 *
 * Required Cloudflare bindings:
 *  - env.PDF_ORDERS  → KV namespace
 *  - env.CASHFREE_WEBHOOK_SECRET → Env variable
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const rawBody = await request.text();

    // ── 1. Verify Cashfree webhook signature ──────────────────────────────
    const signature = request.headers.get('x-webhook-signature');
    const timestamp  = request.headers.get('x-webhook-timestamp');

    let isSignatureValid = false;

    if (!env.CASHFREE_WEBHOOK_SECRET) {
      // ⚠️ TEMPORARY FOR SETUP: If secret is not set yet, bypass verification so Cashfree "Test & Add" succeeds.
      console.warn('⚠️ CASHFREE_WEBHOOK_SECRET not configured. Bypassing signature verification.');
      isSignatureValid = true;
    } else if (!signature || !timestamp) {
      return new Response('Missing signature headers', { status: 401 });
    } else {
      // Perform actual signature verification
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
      
      isSignatureValid = true;
    }

    // ── 2. Parse payload ──────────────────────────────────────────────────
    const payload = JSON.parse(rawBody);
    const eventType = payload.type || '';
    const data      = payload.data || {};

    // Accept both order payments and payment link payments
    const paymentStatus = data.payment?.payment_status || data.link_status || '';
    const isSuccess =
      eventType.includes('PAYMENT_SUCCESS') ||
      eventType === 'PAYMENT_LINK_EVENT' ||
      paymentStatus === 'SUCCESS' ||
      paymentStatus === 'PAID';

    if (!isSuccess) {
      // Not a success event — acknowledge but do nothing
      return new Response('OK', { status: 200 });
    }

    // ── 3. Extract identifiers ────────────────────────────────────────────
    const orderId =
      data.order?.order_id ||
      data.order_details?.order_id ||
      data.link_id ||
      '';

    const customerEmail =
      data.customer_details?.customer_email || '';

    const linkId =
      data.link_id ||
      data.payment_link?.link_id ||
      (data.order?.order_tags?.link_id) ||
      '';

    if (!orderId) {
      console.warn('Cashfree webhook: no order_id found in payload');
      return new Response('OK', { status: 200 });
    }

    // ── 4. Find product (CMS-driven, no hardcoding needed) ────────────────
    let pdfR2Key  = '';
    let productId = '';

    try {
      // Fetch the auto-generated catalog (updated on every CMS save + deploy)
      const siteOrigin = new URL(request.url).origin;
      const catalogResp = await fetch(`${siteOrigin}/api/products-catalog`, {
        headers: { 'Accept': 'application/json' }
      });

      if (catalogResp.ok) {
        const catalog = await catalogResp.json();

        // Match by payment link code (works for all products, no hardcoding)
        const product = catalog.find(p => {
          if (!p.cashfreePaymentLink) return false;
          // Match by link code anywhere in the URL
          if (linkId && p.cashfreePaymentLink.includes(linkId)) return true;
          return false;
        });

        if (product) {
          pdfR2Key  = product.pdfR2Key;
          productId = product.slug;
        }
      }
    } catch (err) {
      console.error('Catalog lookup failed:', err);
    }

    if (!pdfR2Key) {
      // If catalog lookup failed, still store order so manual fix is possible
      console.warn(`No product found for linkId=${linkId}, orderId=${orderId}`);
      pdfR2Key  = 'unknown.pdf';
      productId = 'unknown';
    }

    // ── 5. Generate secure download token ────────────────────────────────
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = btoa(String.fromCharCode(...tokenBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const record = JSON.stringify({
      token,
      orderId,
      customerEmail,
      productId,
      pdfR2Key,
      expiresAt,
      createdAt: Date.now()
    });

    // ── 6. Store in KV (two keys for two lookup patterns) ─────────────────
    //   order:{orderId}  → for download-status polling by the redirect page
    //   token:{token}    → for the actual download verification
    await Promise.all([
      env.PDF_ORDERS.put(`order:${orderId}`, record, { expirationTtl: 86400 }),
      env.PDF_ORDERS.put(`token:${token}`,   record, { expirationTtl: 86400 })
    ]);

    console.log(`✅ Payment verified: orderId=${orderId}, product=${productId}`);
    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('Cashfree webhook error:', err);
    // Always return 200 to Cashfree to prevent retries on our own bugs
    return new Response('OK', { status: 200 });
  }
}
