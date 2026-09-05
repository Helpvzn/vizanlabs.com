import { getProducts } from '$lib/utils/content.js';
export async function load({ url }) {
  const q = url.searchParams.get('q') || '';
  if (!q.trim()) return { q:'', results:[] };
  const all = await getProducts();
  const results = all.filter(p =>
    p.title?.toLowerCase().includes(q.toLowerCase()) ||
    p.shortDescription?.toLowerCase().includes(q.toLowerCase()) ||
    p.category?.toLowerCase().includes(q.toLowerCase())
  );
  return { q, results };
}
