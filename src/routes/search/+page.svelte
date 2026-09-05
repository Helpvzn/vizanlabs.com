<script>
  import { goto } from '$app/navigation';
  import ProductCard from '$lib/components/ProductCard.svelte';
  export let data;
  let q = data.q || '';
  let timer;
  function onInput() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      goto(q.trim() ? `/search?q=${encodeURIComponent(q)}` : '/search', { replaceState:true, noScroll:true });
    }, 300);
  }
</script>
<svelte:head><title>Search – {data.site?.siteName||'Premium Templates'}</title></svelte:head>
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <h1 class="mb-8" style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700">Search Templates</h1>
  <div class="relative max-w-xl mb-12">
    <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style="color:var(--text-3)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
    <input bind:value={q} on:input={onInput} type="text" placeholder="Search for resume, excel, planner..."
      class="w-full pl-12 pr-4 py-4 rounded-xl text-base outline-none"
      style="background:var(--card); border:1px solid var(--border); color:#fff" />
  </div>
  {#if data.q}
    <p class="text-sm mb-8" style="color:var(--text-3)">{data.results?.length||0} results for "<span class="text-white">{data.q}</span>"</p>
    {#if data.results?.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each data.results as p (p.slug)}<ProductCard product={p}/>{/each}
      </div>
    {:else}
      <div class="text-center py-24">
        <div class="text-5xl mb-4">🔍</div>
        <h3 class="mb-2" style="font-family:'Playfair Display',serif">No results</h3>
        <a href="/shop" class="btn btn-gold mt-4">Browse All</a>
      </div>
    {/if}
  {:else}
    <div>
      <p class="text-sm mb-4" style="color:var(--text-3)">Popular Searches</p>
      <div class="flex flex-wrap gap-3">
        {#each ['ATS Resume','Budget Tracker','Habit Tracker','Cover Letter','Daily Planner','Invoice Template'] as term}
          <button on:click={() => { q=term; goto(`/search?q=${encodeURIComponent(term)}`); }} class="tag cursor-pointer">{term}</button>
        {/each}
      </div>
    </div>
  {/if}
</div>
