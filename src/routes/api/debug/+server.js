/**
 * GET /api/debug?order_id=xxx
 * Temporary diagnostic endpoint — shows KV status and what's stored.
 * DELETE THIS FILE after debugging is done.
 */
export async function GET({ url, platform }) {
  const orderId = url.searchParams.get('order_id') || '';
  const env = platform?.env;

  const info = {
    kvBound:      !!env?.PDF_ORDERS,
    r2Bound:      !!env?.PDF_BUCKET,
    secretSet:    !!env?.CASHFREE_WEBHOOK_SECRET,
    orderId,
    kvKeys:       {},
    timestamp:    new Date().toISOString()
  };

  if (env?.PDF_ORDERS && orderId) {
    // Try all possible key patterns
    const keysToTry = [
      `order:${orderId}`,
      `order:${orderId.replace('CFPay_', '').split('_0c')[0]}`,
    ];

    for (const key of keysToTry) {
      const val = await env.PDF_ORDERS.get(key);
      info.kvKeys[key] = val ? JSON.parse(val) : null;
    }
  }

  return new Response(JSON.stringify(info, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
