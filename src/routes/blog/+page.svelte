<script>
  export let data;
  $: posts = data.posts || [];
  const fmt = d => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
</script>

<svelte:head>
  <title>Blog – {data.site?.siteName || 'Premium Templates'}</title>
</svelte:head>

<div class="py-20 text-center border-b" style="background:var(--card); border-color:var(--border)">
  <div class="max-w-xl mx-auto px-4">
    <div class="tag mb-4">📝 Our Blog</div>
    <h1 style="font-family:'Playfair Display',serif; font-size:2.8rem; font-weight:700" class="mb-4">
      Career & Productivity Tips
    </h1>
    <p style="color:var(--text-2)">Expert guides on resumes, productivity, and making the most of your templates</p>
  </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  {#if posts.length === 0}
    <div class="text-center py-24">
      <div class="text-5xl mb-4">📝</div>
      <h3 style="font-family:'Playfair Display',serif" class="text-xl mb-2">No posts yet</h3>
      <p class="text-sm" style="color:var(--text-3)">Add blog posts via the CMS at /admin</p>
    </div>
  {:else}
    <!-- Featured -->
    {#if posts[0]}
      {@const post = posts[0]}
      <a href="/blog/{post.slug}" class="block mb-14 group">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 card overflow-hidden">
          <div class="aspect-video lg:aspect-auto overflow-hidden" style="background:var(--border)">
            {#if post.coverImage}
              <img src={post.coverImage} alt={post.title}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {:else}
              <div class="w-full h-full flex items-center justify-center text-6xl">✍️</div>
            {/if}
          </div>
          <div class="p-8 lg:p-10 flex flex-col justify-center">
            <div class="flex gap-2 mb-4">
              <span class="px-2 py-0.5 rounded-full text-xs font-bold text-black" style="background:var(--gold)">FEATURED</span>
              {#if post.category}<span class="tag text-xs">{post.category}</span>{/if}
            </div>
            <h2 class="mb-3 group-hover:text-[var(--gold)] transition-colors"
              style="font-family:'Playfair Display',serif; font-size:1.7rem; font-weight:700">{post.title}</h2>
            {#if post.excerpt}<p class="text-sm mb-6 line-clamp-3" style="color:var(--text-2)">{post.excerpt}</p>{/if}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style="background:rgba(212,137,26,0.15); color:var(--gold)">{(post.author||'A')[0]}</div>
                <div>
                  <div class="text-sm font-medium">{post.author||'Admin'}</div>
                  <div class="text-xs" style="color:var(--text-3)">{fmt(post.date)}</div>
                </div>
              </div>
              <span class="btn btn-outline text-sm px-4 py-2">Read →</span>
            </div>
          </div>
        </div>
      </a>
    {/if}

    <!-- Rest -->
    {#if posts.length > 1}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each posts.slice(1) as post}
          <a href="/blog/{post.slug}" class="card overflow-hidden group">
            <div class="aspect-video overflow-hidden" style="background:var(--border)">
              {#if post.coverImage}
                <img src={post.coverImage} alt={post.title}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-4xl">✍️</div>
              {/if}
            </div>
            <div class="p-5">
              {#if post.category}<span class="tag text-xs mb-3 inline-block">{post.category}</span>{/if}
              <h3 class="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[var(--gold)] transition-colors"
                style="font-family:'Playfair Display',serif">{post.title}</h3>
              {#if post.excerpt}<p class="text-xs mb-3 line-clamp-2" style="color:var(--text-3)">{post.excerpt}</p>{/if}
              <p class="text-xs" style="color:var(--text-3)">{post.author||'Admin'} · {fmt(post.date)}</p>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  {/if}
</div>
