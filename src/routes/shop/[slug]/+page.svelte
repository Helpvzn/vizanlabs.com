<script>
  import { marked } from 'marked';

  import { onMount } from 'svelte';

  export let data;
  $: p = data.product;
  $: html = p?.body ? marked(p.body) : '';
  
  // Safe extraction of gallery images (handles string '[]' from YAML parser edge case)
  $: gallery = Array.isArray(p?.gallery) ? p.gallery : [];
  $: imgs = [
    p?.thumbnail,
    ...gallery.map(item => typeof item === 'string' ? item : item?.image)
  ].filter(Boolean);

  let imgIdx = 0;
  let tab = 'description';

  let cashfree;
  onMount(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => {
      // Use production mode for live payments
      cashfree = Cashfree({ mode: "production" });
    };
    document.head.appendChild(script);
  });

  // Use INR for Cashfree products, USD for Lemon Squeezy
  $: fmt = (v) => p?.cashfreePaymentLink
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

  // Checkout state
  let showModal = false;
  let phone = '';
  let name = '';
  let buying = false;
  let buyError = '';

  async function buyNow() {
    if (!p.cashfreePaymentLink && !p.pdfR2Key) {
      alert('Checkout not configured. Contact support.');
      return;
    }
    showModal = true;
    buyError = '';
  }

  async function submitCheckout() {
    if (!phone || phone.replace(/\D/g,'').length < 10) {
      buyError = 'Valid 10-digit phone number required.';
      return;
    }
    buying = true;
    buyError = '';
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: p.slug,
          customerPhone: phone,
          customerName: name || 'Customer'
        })
      });
      const data = await res.json();
      if (data.paymentSessionId) {
        if (!cashfree) {
          buyError = 'Payment system loading... Please try again in a second.';
          buying = false;
          return;
        }
        // Use official Cashfree SDK to open checkout
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_self"
        });
      } else {
        buyError = data.error || 'Something went wrong. Please try again.';
        buying = false;
      }
    } catch (e) {
      buyError = 'Network error. Please try again.';
      buying = false;
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
        {#if p.cashfreePaymentLink}
          <span class="flex items-center gap-1.5">🔒 Secure via Cashfree</span>
          <span class="flex items-center gap-1.5">⚡ Instant Download</span>
        {:else}
          <span class="flex items-center gap-1.5">Secure via Lemon Squeezy</span>
          <span class="flex items-center gap-1.5">License by email</span>
        {/if}
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

<!-- ═══ CHECKOUT MODAL ═══ -->
{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4"
    style="background:rgba(0,0,0,0.75);backdrop-filter:blur(4px)"
    on:click|self={() => { showModal = false; buying = false; }}>
    <div class="card p-8 w-full max-w-sm space-y-5" style="border:1px solid var(--gold)">
      <div class="flex items-center justify-between">
        <h2 style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700">Checkout</h2>
        <button on:click={() => { showModal = false; buying = false; }} class="text-2xl" style="color:var(--text-3)">×</button>
      </div>
      <div class="text-sm p-3 rounded-lg" style="background:var(--border)">
        <div class="font-bold">{p.title}</div>
        <div style="color:var(--gold);font-size:1.2rem;font-weight:700">{fmt(p.price)}</div>
      </div>
      <div class="space-y-3">
        <div>
          <label class="text-xs font-medium block mb-1" style="color:var(--text-3)">Your Name (optional)</label>
          <input bind:value={name} type="text" placeholder="Rahul Sharma"
            class="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style="background:var(--border);border:1px solid var(--border);color:inherit" />
        </div>
        <div>
          <label class="text-xs font-medium block mb-1" style="color:var(--text-3)">Mobile Number <span style="color:var(--gold)">*</span></label>
          <input bind:value={phone} type="tel" placeholder="10-digit mobile number" maxlength="10"
            class="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style="background:var(--border);border:1px solid {buyError ? '#ef4444' : 'var(--border)'};color:inherit"
            on:keydown={(e) => e.key === 'Enter' && submitCheckout()} />
          {#if buyError}<p class="text-xs mt-1" style="color:#ef4444">{buyError}</p>{/if}
        </div>
      </div>
      <button on:click={submitCheckout} disabled={buying}
        class="btn btn-gold w-full justify-center py-3.5 text-base font-bold"
        style={buying ? 'opacity:0.7;cursor:not-allowed' : ''}>
        {buying ? '⏳ Redirecting…' : `Pay ${fmt(p.price)} →`}
      </button>
      <p class="text-center text-xs" style="color:var(--text-3)">🔒 Secure payment via Cashfree · Instant PDF</p>
    </div>
  </div>
{/if}

<style>
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
