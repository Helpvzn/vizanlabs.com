<script>
  export let product;
  const fmt = p => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(p);
</script>

<a href="/shop/{product.slug}"
  class="card group block overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-300">

  <!-- Image -->
  <div class="relative overflow-hidden" 
    style="background:var(--border); aspect-ratio:{product.imageAspectRatio || '3/4'}">
    {#if product.thumbnail}
      <img src={product.thumbnail} alt={product.title}
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy" />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-5xl">
        {product.category === 'Resume Templates' ? '📄' :
         product.category === 'Excel Templates'  ? '📊' :
         product.category === 'Eco Planners'     ? '🌿' :
         product.category === 'Habit Trackers'   ? '✅' : '💼'}
      </div>
    {/if}

    <!-- Badge -->
    {#if product.badge}
      <div class="absolute top-3 left-3">
        {#if product.badge === 'new'}
          <span class="px-2 py-0.5 rounded-full text-xs font-bold text-black" style="background:var(--gold)">NEW</span>
        {:else if product.badge === 'sale'}
          <span class="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-red-500">SALE</span>
        {:else if product.badge === 'bestseller'}
          <span class="px-2 py-0.5 rounded-full text-xs font-bold text-black" style="background:var(--gold)">⭐ BEST</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Info -->
  <div class="p-4">
    <span class="tag text-xs mb-2 inline-block">{product.category}</span>
    <h3 class="font-medium text-sm mb-1 line-clamp-2 group-hover:text-[var(--gold)] transition-colors leading-snug">
      {product.title}
    </h3>
    {#if product.shortDescription}
      <p class="text-xs mb-3 line-clamp-2" style="color:var(--text-3)">{product.shortDescription}</p>
    {/if}
    <div class="flex items-center justify-between">
      <div class="flex items-baseline gap-1.5">
        {#if product.originalPrice && product.originalPrice > product.price}
          <span class="text-xs line-through" style="color:var(--text-3)">{fmt(product.originalPrice)}</span>
        {/if}
        <span class="font-bold" style="color:var(--gold); font-family:'Playfair Display',serif">{fmt(product.price)}</span>
      </div>
      <div class="text-[10px] uppercase tracking-widest font-bold" style="color:var(--gold)">View Details →</div>
    </div>
  </div>
</a>
