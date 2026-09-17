import { getProducts } from '$lib/utils/content.js';
import { json } from '@sveltejs/kit';

/**
 * GET /api/products-catalog
 * Returns only the fields needed for webhook product lookup.
 * This is called by the Cashfree webhook to find which PDF
 * corresponds to which payment link — fully CMS-driven.
 */
export async function GET() {
  const products = await getProducts();

  const catalog = products
    .filter(p => p.cashfreePaymentLink && p.pdfR2Key)
    .map(p => ({
      slug: p.slug,
      title: p.title,
      cashfreePaymentLink: p.cashfreePaymentLink,
      pdfR2Key: p.pdfR2Key
    }));

  return json(catalog, {
    headers: {
      // Cache for 5 min on CDN, revalidate on deploy
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
    }
  });
}
