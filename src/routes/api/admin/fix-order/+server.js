/**
 * GET /api/admin/fix-order?order_id=xxx&pdf=shiv-puran.pdf&secret=ADMIN_SECRET
 * Manually creates a download token for an order that webhook missed.
 * Protected by ADMIN_SECRET env var.
 */
export async function GET({ url, platform }) {
  const env       = platform?.env;
  const orderId   = url.searchParams.get('order_id') || '';
  const pdfKey    = url.searchParams.get('pdf') || 'shiv-puran.pdf';
  const secret    = url.searchParams.get('secret') || '';

  // Basic protection
  const adminSecret = env?.ADMIN_SECRET || 'vizanlabs-admin-2024';
  if (secret !== adminSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'order_id required' }), { status: 400 });
  }

  if (!env?.PDF_ORDERS) {
    return new Response(JSON.stringify({ error: 'KV not bound — go to Cloudflare Pages → Settings → Bindings and add PDF_ORDERS KV namespace' }), { status: 500 });
  }

  // Generate token
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = btoa(String.fromCharCode(...tokenBytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const record = JSON.stringify({
    token, orderId, customerEmail: '', productId: 'shiv-puran', pdfKey, expiresAt
  });

  await Promise.all([
    env.PDF_ORDERS.put(`order:${orderId}`, record, { expirationTtl: 86400 }),
    env.PDF_ORDERS.put(`token:${token}`, record, { expirationTtl: 86400 })
  ]);

  const downloadUrl = `/api/download?token=${token}`;

  return new Response(JSON.stringify({
    success: true,
    orderId,
    token,
    downloadUrl,
    message: `Go to: https://vizanlabs.com${downloadUrl}`
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
