/**
 * GET /api/download-status?order_id=xxx
 * Polled by the /download page every 2 seconds.
 * Tries multiple KV key patterns to find the record.
 */
export async function GET({ url, platform }) {
  const orderId = url.searchParams.get('order_id') || '';
  const env = platform?.env;

  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

  if (!orderId) {
    return new Response(JSON.stringify({ verified: false, error: 'Missing order_id' }), { status: 400, headers });
  }

  if (!env?.PDF_ORDERS) {
    console.error('PDF_ORDERS KV not bound');
    return new Response(JSON.stringify({ verified: false }), { status: 200, headers });
  }

  try {
    // Try multiple key patterns (webhook stores all of these)
    let raw = await env.PDF_ORDERS.get(`order:${orderId}`);

    // If not found, try extracting link code from CFPay_xxx format
    if (!raw && orderId.startsWith('CFPay_')) {
      const parts = orderId.replace('CFPay_', '').split('_0c');
      const linkCode = parts[0] || '';
      if (linkCode) {
        raw = await env.PDF_ORDERS.get(`order:${linkCode}`);
        console.log(`Fallback lookup by linkCode=${linkCode}: ${raw ? 'found' : 'not found'}`);
      }
    }

    if (!raw) {
      return new Response(JSON.stringify({ verified: false }), { status: 200, headers });
    }

    const record = JSON.parse(raw);

    if (Date.now() > record.expiresAt) {
      return new Response(JSON.stringify({ verified: false, error: 'expired' }), { status: 200, headers });
    }

    return new Response(
      JSON.stringify({ verified: true, token: record.token, productId: record.productId }),
      { status: 200, headers }
    );

  } catch (err) {
    console.error('download-status error:', err);
    return new Response(JSON.stringify({ verified: false }), { status: 200, headers });
  }
}
