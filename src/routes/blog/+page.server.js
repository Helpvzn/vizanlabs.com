import { getPosts } from '$lib/utils/content.js';
export async function load() {
  return { posts: await getPosts() };
}
