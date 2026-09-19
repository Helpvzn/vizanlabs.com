/**
 * GET /api/download-status?order_id=xxx
 *
 * Two-step verification:
 * 1. Check KV (webhook may have already processed)
 * 2. If not found → call Cashfree API directly to verify order status
 *    (makes system work even if webhook fails)
 */
export async function GET({ url, platform }) {
  const orderId = url.searchParams.get('order_id') || '';
  const env     = platform?.env;
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

  if (!orderId) {
    return new Response(JSON.stringify({ verified: false, error: 'Missing order_id' }), { status: 400, headers });
  }

  if (!env?.PDF_ORDERS) {
    return new Response(JSON.stringify({ verified: false }), { status: 200, headers });
  }

  // ── Step 1: Check KV (webhook result) ───────────────────────────────────
  let raw = await env.PDF_ORDERS.get(`order:${orderId}`);

  // Also try link code extracted from CFPay_xxx format
  if (!raw && orderId.startsWith('CFPay_')) {
    const linkCode = orderId.replace('CFPay_', '').split('_0c')[0];
    if (linkCode) {
      raw = await env.PDF_ORDERS.get(`order:${linkCode}`);
    }
  }

  if (raw) {
    const record = JSON.parse(raw);
    if (Date.now() > record.expiresAt) {
      return new Response(JSON.stringify({ verified: false, error: 'expired' }), { status: 200, headers });
    }
    return new Response(
      JSON.stringify({ verified: true, token: record.token, productId: record.productId }),
      { status: 200, headers }
    );
  }

  // ── Step 2: Verify directly via Cashfree API ─────────────────────────────
  // (Webhook fallback — works even if Cashfree webhook doesn't fire)
  if (env?.CASHFREE_APP_ID && env?.CASHFREE_WEBHOOK_SECRET) {
    try {
      const cfRes = await fetch(`https://api.cashfree.com/pg/orders/${encodeURIComponent(orderId)}`, {
        headers: {
          'x-client-id':     env.CASHFREE_APP_ID,
          'x-client-secret': env.CASHFREE_WEBHOOK_SECRET,
          'x-api-version':   '2023-08-01',
          'Content-Type':    'application/json'
        }
      });

      if (cfRes.ok) {
        const order = await cfRes.json();
        console.log('Cashfree order status:', order.order_status, 'for', orderId);

        if (order.order_status === 'PAID') {
          // Extract link code from order_id: CFPay_<linkCode>_0c90_xxx
          const linkCode = orderId.replace('CFPay_', '').split('_0c')[0] || '';

          // Find product from catalog
          let pdfR2Key  = '';
          let productId = '';
          try {
            const catalogRes = await fetch(`${url.origin}/api/products-catalog`);
            if (catalogRes.ok) {
              const catalog = await catalogRes.json();
              const product = catalog.find(p =>
                p.cashfreePaymentLink && linkCode && p.cashfreePaymentLink.includes(linkCode)
              );
              if (product) {
                pdfR2Key  = product.pdfR2Key || '';
                productId = product.slug || '';
                console.log('Product matched:', productId, 'pdf:', pdfR2Key);
              }
            }
          } catch (e) {
            console.error('Catalog fetch error:', e);
          }

          // Generate secure token
          const tokenBytes = new Uint8Array(32);
          crypto.getRandomValues(tokenBytes);
          const token = btoa(String.fromCharCode(...tokenBytes))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

          const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
          const record = JSON.stringify({ token, orderId, productId, pdfR2Key, expiresAt });

          // Store in KV
          await Promise.all([
            env.PDF_ORDERS.put(`order:${orderId}`, record, { expirationTtl: 86400 }),
            env.PDF_ORDERS.put(`token:${token}`,   record, { expirationTtl: 86400 })
          ]);

          console.log('✅ Token created via API verification for', orderId);

          return new Response(
            JSON.stringify({ verified: true, token, productId }),
            { status: 200, headers }
          );
        }
      } else {
        console.warn('Cashfree API error:', cfRes.status, await cfRes.text());
      }
    } catch (err) {
      console.error('Cashfree API call failed:', err);
    }
  }

  // Payment not confirmed yet
  return new Response(JSON.stringify({ verified: false }), { status: 200, headers });
}
