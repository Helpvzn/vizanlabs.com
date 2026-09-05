import { getProducts } from '$lib/utils/content.js';

export async function load({ url }) {
  const category = url.searchParams.get('category') || '';
  const products = await getProducts({ category: category || undefined });
  return { products, activeCategory: category };
}
