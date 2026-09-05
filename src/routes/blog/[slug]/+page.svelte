<script>
  import { marked } from 'marked';
  export let data;
  $: post = data.post;
  $: html = post?.body ? marked(post.body) : '';
  const fmt = d => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
</script>

<svelte:head>
  <title>{post?.seoTitle || post?.title} – Blog</title>
  <meta name="description" content={post?.seoDescription || post?.excerpt || ''} />
</svelte:head>

{#if post}
<article class="max-w-2xl mx-auto px-4 sm:px-6 py-16">
  <a href="/blog" class="text-sm mb-10 inline-flex items-center gap-1 hover:text-[var(--gold)] transition-colors" style="color:var(--text-3)">
    ← Back to Blog
  </a>
  <header class="mb-10">
    {#if post.category}<span class="tag mb-4 inline-block">{post.category}</span>{/if}
    <h1 class="leading-tight mb-5" style="font-family:'Playfair Display',serif; font-size:clamp(1.8rem,4vw,2.6rem); font-weight:700">{post.title}</h1>
    {#if post.excerpt}<p class="text-lg mb-6" style="color:var(--text-2)">{post.excerpt}</p>{/if}
    <div class="flex items-center gap-4 pb-6 border-b" style="border-color:var(--border)">
      <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
        style="background:rgba(212,137,26,0.15); color:var(--gold)">{(post.author||'A')[0]}</div>
      <div>
        <div class="font-medium text-sm">{post.author||'Admin'}</div>
        <div class="text-xs" style="color:var(--text-3)">{fmt(post.date)}{post.readTime ? ` · ${post.readTime}` : ''}</div>
      </div>
    </div>
  </header>
  {#if post.coverImage}
    <div class="rounded-2xl overflow-hidden mb-10 aspect-video">
      <img src={post.coverImage} alt={post.title} class="w-full h-full object-cover" />
    </div>
  {/if}
  <div class="prose-custom">{@html html}</div>
  {#if post.tags?.length}
    <div class="flex flex-wrap gap-2 mt-10 pt-8 border-t" style="border-color:var(--border)">
      {#each post.tags as tag}
        <a href="/blog?tag={tag}" class="tag text-xs">{tag}</a>
      {/each}
    </div>
  {/if}
  <div class="mt-12 card p-8 text-center">
    <h3 class="mb-3" style="font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700">Ready to get started?</h3>
    <p class="mb-6 text-sm" style="color:var(--text-2)">Browse our professional templates.</p>
    <a href="/shop" class="btn btn-gold">Shop Templates →</a>
  </div>
</article>
{/if}
