/**
 * GET /api/download?token=xxx
 * Validates token from KV and streams PDF from private R2 bucket.
 * PDF URL is NEVER exposed to the browser.
 */
export async function GET({ url, platform }) {
  const token = url.searchParams.get('token');
  const env   = platform?.env;

  if (!token) {
    return errorPage(400, 'Missing token', 'No download token provided.');
  }

  if (!env?.PDF_ORDERS) {
    return errorPage(500, 'Server Error', 'Storage not configured. Contact support.');
  }

  try {
    // ── Validate token ───────────────────────────────────────────────────
    const raw = await env.PDF_ORDERS.get(`token:${token}`);

    if (!raw) {
      return errorPage(404, 'Link Not Found', 'This download link is invalid or has already been used.');
    }

    const record = JSON.parse(raw);

    if (Date.now() > record.expiresAt) {
      return errorPage(410, 'Link Expired',
        `This download link has expired (24 hour limit). 
        Please contact support with your Order ID: ${record.orderId}`
      );
    }

    // ── Fetch PDF from private R2 ────────────────────────────────────────
    if (!env.PDF_BUCKET) {
      return errorPage(500, 'Server Error', 'PDF storage not configured. Contact support.');
    }

    const pdfKey = record.pdfR2Key || record.pdfKey || '';
    console.log('Fetching from R2:', pdfKey);
    const object = await env.PDF_BUCKET.get(pdfKey);

    if (!object) {
      console.error(`PDF not found in R2: ${record.pdfR2Key}`);
      return errorPage(404, 'File Not Found',
        'PDF could not be located. Please contact support.'
      );
    }

    // ── Stream PDF to customer ───────────────────────────────────────────
    const filename = record.pdfR2Key.split('/').pop();

    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type':           'application/pdf',
        'Content-Disposition':    `attachment; filename="${filename}"`,
        'Cache-Control':          'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (err) {
    console.error('Download error:', err);
    return errorPage(500, 'Server Error', 'Something went wrong. Please try again or contact support.');
  }
}

function errorPage(status, title, message) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
    <title>${title}</title>
    <style>
      body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;
        min-height:100vh;margin:0;background:#0a0a0a;color:#fff}
      .box{text-align:center;padding:2rem;max-width:480px}
      h1{color:#ef4444;font-size:1.5rem;margin-bottom:1rem}
      p{color:#999;line-height:1.6}
      a{color:#d4891a;text-decoration:none;font-weight:bold;display:inline-block;margin-top:1.5rem}
    </style></head>
    <body><div class="box">
      <h1>❌ ${title}</h1>
      <p>${message}</p>
      <a href="/shop">← Back to Shop</a>
    </div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
