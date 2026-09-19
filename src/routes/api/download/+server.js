/**
 * GET /api/download?token=xxx
 * Validates token from KV and streams PDF from private R2 bucket.
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
    const raw = await env.PDF_ORDERS.get(`token:${token}`);

    if (!raw) {
      return errorPage(404, 'Link Not Found', 'This download link is invalid or has already been used.');
    }

    const record = JSON.parse(raw);

    if (Date.now() > record.expiresAt) {
      return errorPage(410, 'Link Expired',
        `This download link has expired. Contact support with Order ID: ${record.orderId}`
      );
    }

    if (!env.PDF_BUCKET) {
      return errorPage(500, 'Server Error', 'PDF storage not configured. Contact support.');
    }

    // Support both field names (webhook uses pdfR2Key, admin fix uses pdfKey)
    const pdfKey = record.pdfR2Key || record.pdfKey || '';
    console.log('Fetching from R2 key:', pdfKey);

    if (!pdfKey) {
      return errorPage(500, 'Config Error', 'PDF key not configured for this product. Contact support.');
    }

    const object = await env.PDF_BUCKET.get(pdfKey);

    if (!object) {
      console.error(`PDF not found in R2 bucket. Key tried: "${pdfKey}"`);
      return errorPage(404, 'File Not Found',
        `PDF could not be located (key: ${pdfKey}). Please contact support@vizanlabs.com`
      );
    }

    // Use pdfKey for filename (safe for both cases)
    const filename = pdfKey.split('/').pop() || 'download.pdf';

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
    return errorPage(500, 'Server Error', 'Something went wrong. Please contact support@vizanlabs.com');
  }
}

function errorPage(status, title, message) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
    <title>${title}</title>
    <style>
      body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;
        min-height:100vh;margin:0;background:#0a0a0a;color:#fff}
      .box{text-align:center;padding:2rem;max-width:500px}
      h1{color:#ef4444;font-size:1.5rem;margin-bottom:1rem}
      p{color:#999;line-height:1.6;font-size:.9rem}
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
