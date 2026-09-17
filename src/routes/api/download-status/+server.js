/**
 * GET /api/download-status?order_id=xxx
 * Polled by the /download page every 2 seconds.
 */
export async function GET({ url, platform }) {
  const orderId = url.searchParams.get('order_id');
  const env = platform?.env;

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (!orderId) {
    return new Response(
      JSON.stringify({ verified: false, error: 'Missing order_id' }),
      { status: 400, headers }
    );
  }

  if (!env?.PDF_ORDERS) {
    // KV not bound — during local dev return not verified
    return new Response(JSON.stringify({ verified: false }), { status: 200, headers });
  }

  try {
    const raw = await env.PDF_ORDERS.get(`order:${orderId}`);

    if (!raw) {
      return new Response(JSON.stringify({ verified: false }), { status: 200, headers });
    }

    const record = JSON.parse(raw);

    if (Date.now() > record.expiresAt) {
      return new Response(
        JSON.stringify({ verified: false, error: 'expired' }),
        { status: 200, headers }
      );
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
