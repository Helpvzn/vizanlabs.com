import { getProducts, getPosts } from '$lib/utils/content.js';

export async function load() {
  const [featured, recentPosts] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getPosts({ limit: 3 })
  ]);
  return { featured, recentPosts };
}
