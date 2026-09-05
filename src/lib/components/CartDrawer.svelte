<script>
  import { fade, fly } from 'svelte/transition';
  import { cartItems, cartTotal, cartOpen } from '$lib/stores/cart.js';
  import { goto } from '$app/navigation';

  const fmt = p => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
</script>

<div transition:fade={{ duration: 150 }}
  class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
  role="presentation"
  on:click={() => $cartOpen = false} />

<div transition:fly={{ x: 420, duration: 280 }}
  class="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col shadow-2xl"
  style="background:var(--card); border-left:1px solid var(--border)">

  <div class="flex items-center justify-between p-5 border-b" style="border-color:var(--border)">
    <h2 style="font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:700">
      Cart ({$cartItems.length})
    </h2>
    <button on:click={() => $cartOpen = false}
      class="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-5 space-y-3">
    {#if $cartItems.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center py-12">
        <div class="text-5xl mb-4">🛒</div>
        <p style="font-family:'Playfair Display',serif; font-size:1.1rem" class="mb-2">Cart is empty</p>
        <p class="text-sm mb-6" style="color:var(--text-3)">Add some templates to get started</p>
        <button on:click={() => { $cartOpen=false; goto('/shop'); }} class="btn btn-gold">Browse Shop</button>
      </div>
    {:else}
      {#each $cartItems as item (item.id)}
        <div class="flex gap-3 p-3 rounded-xl" style="background:var(--bg); border:1px solid var(--border)">
          <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl"
            style="background:var(--border)">
            {#if item.thumbnail}
              <img src={item.thumbnail} alt={item.name} class="w-full h-full object-cover" />
            {:else}📄{/if}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{item.name}</p>
            <p class="text-xs mt-0.5" style="color:var(--text-3)">{item.category}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="font-bold text-sm" style="color:var(--gold)">{fmt(item.price)}</span>
              <div class="flex items-center gap-1.5">
                <button on:click={() => cartItems.updateQty(item.id, item.quantity-1)}
                  class="w-6 h-6 rounded text-sm font-bold flex items-center justify-center hover:bg-[#2a2a2a]"
                  style="background:var(--border)">−</button>
                <span class="text-sm w-4 text-center">{item.quantity}</span>
                <button on:click={() => cartItems.updateQty(item.id, item.quantity+1)}
                  class="w-6 h-6 rounded text-sm font-bold flex items-center justify-center hover:bg-[#2a2a2a]"
                  style="background:var(--border)">+</button>
              </div>
            </div>
          </div>
          <button on:click={() => cartItems.remove(item.id)}
            class="p-1 rounded transition-colors hover:text-red-400 flex-shrink-0 self-start"
            style="color:var(--text-3)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      {/each}
    {/if}
  </div>

  {#if $cartItems.length > 0}
    <div class="p-5 border-t space-y-3" style="border-color:var(--border)">
      <div class="flex justify-between">
        <span style="color:var(--text-2)">Total</span>
        <span style="font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; color:var(--gold)">{fmt($cartTotal)}</span>
      </div>
      <p class="text-xs" style="color:var(--text-3)">🔒 Secure checkout · ⚡ Instant download</p>
      <button on:click={() => { $cartOpen=false; goto('/checkout'); }}
        class="btn btn-gold w-full justify-center py-3.5 text-sm">
        Checkout →
      </button>
    </div>
  {/if}
</div>
