/**
 * GET /api/download?token=xxx
 *
 * Validates the download token and streams the PDF from
 * the private R2 bucket. PDF URL is NEVER exposed to the browser.
 *
 * Required Cloudflare bindings:
 *   - env.PDF_ORDERS   → KV namespace
 *   - env.PDF_BUCKET   → R2 bucket (private)
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url   = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Missing token', { status: 400 });
  }

  try {
    // ── 1. Validate token from KV ────────────────────────────────────────
    const raw = await env.PDF_ORDERS.get(`token:${token}`);

    if (!raw) {
      return htmlError(404, 'Link not found or already expired.', 'Download link is invalid.');
    }

    const record = JSON.parse(raw);

    // Expiry check
    if (Date.now() > record.expiresAt) {
      return htmlError(410, 'Link Expired', 'This download link has expired (24 hour limit). Please contact support.');
    }

    // ── 2. Fetch PDF from private R2 bucket ───────────────────────────────
    if (!env.PDF_BUCKET) {
      console.error('PDF_BUCKET R2 binding not configured');
      return htmlError(500, 'Server Error', 'Storage not configured. Please contact support.');
    }

    const object = await env.PDF_BUCKET.get(record.pdfR2Key);

    if (!object) {
      console.error(`PDF not found in R2: ${record.pdfR2Key}`);
      return htmlError(404, 'File Not Found', 'PDF could not be found. Please contact support.');
    }

    // ── 3. Stream PDF to customer ─────────────────────────────────────────
    const filename = record.pdfR2Key.split('/').pop(); // Just the filename

    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      object.size?.toString() || '',
        'Cache-Control':       'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (err) {
    console.error('Download error:', err);
    return htmlError(500, 'Server Error', 'Something went wrong. Please try again or contact support.');
  }
}

function htmlError(status, title, message) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#fff}
    .box{text-align:center;padding:2rem}h1{color:#ef4444;font-size:1.5rem}p{color:#999;margin-top:1rem}
    a{color:#d4891a;text-decoration:none;font-weight:bold}</style></head>
    <body><div class="box"><h1>❌ ${title}</h1><p>${message}</p>
    <p style="margin-top:2rem"><a href="/shop">← Back to Shop</a></p></div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html' } }
  );
}
