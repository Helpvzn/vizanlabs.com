<script>
  import { goto } from '$app/navigation';
  import ProductCard from '$lib/components/ProductCard.svelte';
  export let data;

  let sort = 'newest';
  let search = '';

  const cats = ['All','Resume Templates','Excel Templates','Eco Planners','Habit Trackers','Business Kits'];

  $: sel = data.activeCategory || '';

  function setCategory(c) {
    goto(c ? `/shop?category=${encodeURIComponent(c)}` : '/shop', { replaceState: true });
  }

  $: list = (data.products || [])
    .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.shortDescription?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sort === 'price-asc' ? a.price-b.price : sort === 'price-desc' ? b.price-a.price : new Date(b.createdAt||0)-new Date(a.createdAt||0));
</script>

<svelte:head>
  <title>Shop – {data.site?.siteName || 'Premium Templates'}</title>
</svelte:head>

<div class="py-16 text-center border-b" style="background:var(--card); border-color:var(--border)">
  <div class="max-w-xl mx-auto px-4">
    <h1 class="mb-4" style="font-family:'Playfair Display',serif; font-size:2.4rem; font-weight:700">All Templates</h1>
    <p class="mb-6" style="color:var(--text-2)">Instant download · Lifetime access</p>
    <div class="relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style="color:var(--text-3)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input bind:value={search} type="text" placeholder="Search templates..."
        class="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
        style="background:var(--bg); border:1px solid var(--border); color:#fff" />
    </div>
  </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
    <div class="flex flex-wrap gap-2">
      {#each cats as cat}
        <button on:click={() => setCategory(cat === 'All' ? '' : cat)}
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          style="background:{(!sel && cat==='All') || sel===cat ? 'var(--gold)' : 'var(--card)'};
                 color:{(!sel && cat==='All') || sel===cat ? '#000' : 'var(--text-2)'};
                 border:1px solid {(!sel && cat==='All') || sel===cat ? 'var(--gold)' : 'var(--border)'}">
          {cat}
        </button>
      {/each}
    </div>
    <select bind:value={sort} class="px-4 py-2 rounded-lg text-sm outline-none"
      style="background:var(--card); border:1px solid var(--border); color:#fff">
      <option value="newest">Newest First</option>
      <option value="price-asc">Price: Low → High</option>
      <option value="price-desc">Price: High → Low</option>
    </select>
  </div>

  <p class="text-sm mb-6" style="color:var(--text-3)">{list.length} products{sel ? ` in ${sel}` : ''}</p>

  {#if list.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {#each list as p (p.slug)}
        <ProductCard product={p} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-24">
      <div class="text-5xl mb-4">🔍</div>
      <h3 class="mb-2" style="font-family:'Playfair Display',serif">No products found</h3>
      <p class="text-sm mb-6" style="color:var(--text-3)">Add products via CMS at /admin</p>
      <button on:click={() => setCategory('')} class="btn btn-outline">Clear Filter</button>
    </div>
  {/if}
</div>
