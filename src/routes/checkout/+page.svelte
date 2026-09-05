<script>
  import { cartItems, cartTotal } from '$lib/stores/cart.js';
  const fmt = p => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(p);
  let processing = false;
  function pay() {
    processing = true;
    const items = $cartItems;
    if (!items.length) return;
    const id = items[0].lemonsqueezyId;
    if (id) {
      window.location.href = `https://freeresumebuilder.lemonsqueezy.com/checkout/buy/${id}?checkout[success_url]=https://vizanlabs.com/success`;
    } else {
      processing = false;
      alert('No checkout link configured. Add Lemon Squeezy Variant ID in CMS.');
    }
  }
</script>

<svelte:head><title>Checkout</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-16">
  <h1 class="mb-10" style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700">Checkout</h1>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-3">
      {#each $cartItems as item (item.id)}
        <div class="card p-4 flex items-center gap-4">
          <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl"
            style="background:var(--border)">
            {#if item.thumbnail}<img src={item.thumbnail} alt={item.name} class="w-full h-full object-cover"/>{:else}📄{/if}
          </div>
          <div class="flex-1">
            <div class="font-medium text-sm">{item.name}</div>
            <div class="text-xs mt-0.5" style="color:var(--text-3)">{item.category}</div>
          </div>
          <div class="font-bold" style="color:var(--gold)">{fmt(item.price * item.quantity)}</div>
        </div>
      {/each}
      {#if !$cartItems.length}
        <div class="card p-12 text-center">
          <p style="color:var(--text-3)">Cart is empty</p>
          <a href="/shop" class="btn btn-gold mt-4 inline-flex">Browse Shop</a>
        </div>
      {/if}
    </div>
    <div class="card p-6 space-y-4 h-fit">
      <h3 class="font-semibold">Order Total</h3>
      <div class="flex justify-between text-sm">
        <span style="color:var(--text-2)">Subtotal</span>
        <span>{fmt($cartTotal)}</span>
      </div>
      <div class="divider"></div>
      <div class="flex justify-between font-bold">
        <span>Total</span>
        <span style="color:var(--gold);font-family:'Playfair Display',serif;font-size:1.3rem">{fmt($cartTotal)}</span>
      </div>
      <button on:click={pay} disabled={processing || !$cartItems.length}
        class="btn btn-gold w-full justify-center py-3.5 disabled:opacity-50">
        {processing ? 'Redirecting...' : 'Pay with Lemon Squeezy →'}
      </button>
      <p class="text-xs text-center" style="color:var(--text-3)">🔒 Secure · ⚡ Instant download after payment</p>
    </div>
  </div>
</div>
