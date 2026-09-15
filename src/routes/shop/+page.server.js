import { getProducts, getHomepageSettings, getSiteSettings } from '$lib/utils/content.js';

export async function load({ url }) {
  const category = url.searchParams.get('category') || '';
  const [products, homepage, site] = await Promise.all([
    getProducts({ category: category || undefined }),
    getHomepageSettings(),
    getSiteSettings()
  ]);
  return { products, activeCategory: category, homepage, site };
}
