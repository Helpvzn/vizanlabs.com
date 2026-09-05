<script>
  import { onMount } from 'svelte';
  import { cartItems } from '$lib/stores/cart.js';
  import { page } from '$app/stores';
  onMount(() => cartItems.clear());
  $: orderId = $page.url.searchParams.get('order_id') || '';
</script>
<svelte:head><title>Order Confirmed!</title></svelte:head>
<div class="min-h-screen flex items-center justify-center px-4">
  <div class="text-center max-w-lg">
    <div class="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-8"
      style="background:rgba(34,197,94,0.1);border:2px solid rgba(34,197,94,0.3)">✅</div>
    <h1 class="mb-3" style="font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:700">Order Confirmed!</h1>
    <p class="mb-2 text-lg" style="color:var(--text-2)">Thank you for your purchase</p>
    {#if orderId}
      <p class="text-sm mb-8" style="color:var(--text-3)">Order: <span class="text-white font-mono">{orderId}</span></p>
    {:else}
      <div class="mb-8"></div>
    {/if}
    <div class="card p-6 text-left mb-8 space-y-4">
      <h3 class="font-semibold mb-2">What happens next?</h3>
      {#each [['📧','Check your email','Download link sent to your email address'],['⬇️','Download your files','Click the link to access your templates'],['🎨','Customize & use','Open in your preferred software']] as [icon,title,desc]}
        <div class="flex items-start gap-3">
          <span class="text-xl">{icon}</span>
          <div>
            <div class="font-medium text-sm">{title}</div>
            <div class="text-xs mt-0.5" style="color:var(--text-3)">{desc}</div>
          </div>
        </div>
      {/each}
    </div>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a href="/shop" class="btn btn-gold">Browse More Templates</a>
      <a href="/blog" class="btn btn-outline">Read Our Blog</a>
    </div>
  </div>
</div>
