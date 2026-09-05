import { getPosts } from '$lib/utils/content.js';
import { error } from '@sveltejs/kit';
export async function load({ params }) {
  const post = await getPosts({ slug: params.slug });
  if (!post) throw error(404, 'Post not found');
  return { post };
}
