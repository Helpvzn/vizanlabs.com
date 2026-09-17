/**
 * GET /api/download-status?order_id=xxx
 *
 * Polled by the /download page every 2 seconds.
 * Once Cashfree webhook fires and KV is populated,
 * this returns the download token so the page can
 * show the Download button.
 *
 * Required bindings: env.PDF_ORDERS (KV)
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url     = new URL(request.url);
  const orderId = url.searchParams.get('order_id');

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (!orderId) {
    return new Response(
      JSON.stringify({ verified: false, error: 'Missing order_id' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const raw = await env.PDF_ORDERS.get(`order:${orderId}`);

    if (!raw) {
      // Webhook hasn't arrived yet — keep polling
      return new Response(
        JSON.stringify({ verified: false }),
        { status: 200, headers: corsHeaders }
      );
    }

    const record = JSON.parse(raw);

    // Safety: double-check expiry
    if (Date.now() > record.expiresAt) {
      return new Response(
        JSON.stringify({ verified: false, error: 'expired' }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        verified: true,
        token:     record.token,
        productId: record.productId
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error('download-status error:', err);
    return new Response(
      JSON.stringify({ verified: false, error: 'server_error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
