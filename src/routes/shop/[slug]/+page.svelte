<script>
  import { marked } from 'marked';

  export let data;
  $: p = data.product;
  $: html = p?.body ? marked(p.body) : '';
  
  // Safe extraction of gallery images (handles both direct strings and objects with 'image' key)
  $: imgs = [
    p?.thumbnail, 
    ...(p?.gallery || []).map(item => typeof item === 'string' ? item : item.image)
  ].filter(Boolean);

  let imgIdx = 0;
  let tab = 'description';

  const fmt = v => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v);

  function buyNow() {
    if (p.buyUrl) {
      window.open(p.buyUrl, '_blank');
    } else {
       alert("Checkout link not set in CMS.");
    }
  }
</script>

<svelte:head>
  <title>{p?.seoTitle || p?.title} – {data.site?.siteName || 'Premium Templates'}</title>
  <meta name="description" content={p?.seoDescription || p?.shortDescription || ''} />
</svelte:head>

{#if p}
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <!-- Breadcrumb -->
  <nav class="flex items-center gap-2 text-xs mb-8" style="color:var(--text-3)">
    <a href="/" class="hover:text-[var(--gold)]">Home</a> /
    <a href="/shop" class="hover:text-[var(--gold)]">Shop</a> /
    <a href="/shop?category={encodeURIComponent(p.category)}" class="hover:text-[var(--gold)]">{p.category}</a> /
    <span class="text-white truncate">{p.title}</span>
  </nav>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
    <!-- Images -->
    <div class="space-y-4">
      <div class="rounded-2xl overflow-hidden bg-[#1a1a1a]"
        style="border:1px solid var(--border); min-height: 400px; aspect-ratio:{p.imageAspectRatio === 'auto' ? 'auto' : p.imageAspectRatio || '3/4'}">
        {#if imgs[imgIdx]}
          <img src={imgs[imgIdx]} alt={p.title} class="w-full h-full object-contain block" />
        {:else}
          <div class="w-full h-[500px] flex items-center justify-center text-7xl">📄</div>
        {/if}
      </div>
      {#if imgs.length > 1}
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {#each imgs as img, i}
            <button on:click={() => imgIdx=i}
              class="flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden transition-all bg-[#1a1a1a]"
              style="border:2px solid {imgIdx===i ? 'var(--gold)' : 'var(--border)'}">
              <img src={img} alt="" class="w-full h-full object-cover" />
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Details -->
    <div class="space-y-6">
      <div>
        <span class="tag mb-3 inline-block">{p.category}</span>
        <h1 style="font-family:'Playfair Display',serif; font-size:2.2rem; font-weight:700; line-height:1.2">{p.title}</h1>
        {#if p.shortDescription}
          <p class="mt-4 text-lg" style="color:var(--text-2)">{p.shortDescription}</p>
        {/if}
      </div>

      <!-- Price -->
      <div class="flex items-baseline gap-4">
        <span style="font-family:'Playfair Display',serif; font-size:2.8rem; font-weight:700; color:var(--gold)">{fmt(p.price)}</span>
        {#if p.originalPrice > p.price}
          <span class="text-2xl line-through" style="color:var(--text-3)">{fmt(p.originalPrice)}</span>
          <span class="px-3 py-1 rounded-full text-xs font-bold text-white bg-red-500">
            {Math.round((1-p.price/p.originalPrice)*100)}% OFF
          </span>
        {/if}
      </div>

      <!-- CTA -->
      <div class="space-y-3 pt-2">
        <button on:click={buyNow} class="btn btn-gold w-full justify-center py-4 text-lg font-bold shadow-xl shadow-gold/20">
          Buy Now — {fmt(p.price)}
        </button>
        <p class="text-center text-xs" style="color:var(--text-3)">
          Instant download after successful payment.
        </p>
      </div>

      <!-- File info grid -->
      <div class="grid grid-cols-2 gap-4">
        {#each [[p.fileFormat,'📁','Format'],[p.fileSize,'💾','Size'],['Instant','⚡','Delivery'],['Personal Use','♾️','License']] as [val,icon,label]}
          {#if val}
            <div class="card p-4 flex items-center gap-4">
              <span class="text-2xl">{icon}</span>
              <div>
                <div class="text-xs" style="color:var(--text-3)">{label}</div>
                <div class="text-sm font-bold">{val}</div>
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Preview download (R2 link from CMS) -->
      {#if p.previewFileUrl}
        <a href={p.previewFileUrl} target="_blank" class="btn btn-outline w-full justify-center">
          👁️ Preview Free Sample
        </a>
      {/if}

      <!-- Trust -->
      <div class="flex flex-wrap gap-4 text-xs font-medium uppercase tracking-wider" style="color:var(--text-3)">
        <span class="flex items-center gap-1.5">Secure via Lemon Squeezy</span>
        <span class="flex items-center gap-1.5">License by email</span>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="mt-20">
    <div class="flex gap-4 border-b mb-10" style="border-color:var(--border)">
      {#each [['description','Description'],['requirements','Requirements']] as [t,label]}
        <button on:click={() => tab=t}
          class="px-6 py-4 text-base font-bold border-b-2 -mb-px transition-all"
          style="border-color:{tab===t ? 'var(--gold)' : 'transparent'}; color:{tab===t ? '#fff' : 'var(--text-3)'}">
          {label}
        </button>
      {/each}
    </div>
    {#if tab === 'description'}
      <div class="prose-custom max-w-4xl">{@html html}</div>
    {:else}
      <ul class="space-y-3 max-w-xl">
        {#each (p.requirements||['No special requirements']) as req}
          <li class="flex items-center gap-4 text-base" style="color:var(--text-2)">
            <span style="color:var(--gold); font-size:1.2rem">✓</span>{req}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
{/if}

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
