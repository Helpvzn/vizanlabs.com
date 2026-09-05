import { getProducts } from '$lib/utils/content.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const product = await getProducts({ slug: params.slug });
  if (!product) throw error(404, 'Product not found');
  return { product };
}
