<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';

  // order_id from Cashfree return URL
  $: orderId = $page.url.searchParams.get('order_id') || '';

  // States: 'waiting' | 'verified' | 'expired' | 'error'
  let state = 'waiting';
  let downloadToken = '';
  let productId = '';
  let pollCount = 0;
  let pollInterval = null;
  const MAX_POLLS = 20; // 20 × 2s = 40 seconds

  async function checkStatus() {
    if (!orderId) {
      state = 'error';
      return;
    }

    try {
      const res = await fetch(`/api/download-status?order_id=${encodeURIComponent(orderId)}`);
      const data = await res.json();

      if (data.verified) {
        state = 'verified';
        downloadToken = data.token;
        productId = data.productId || '';
        clearInterval(pollInterval);
      } else if (data.error === 'expired') {
        state = 'expired';
        clearInterval(pollInterval);
      } else {
        pollCount++;
        if (pollCount >= MAX_POLLS) {
          state = 'error';
          clearInterval(pollInterval);
        }
      }
    } catch (e) {
      pollCount++;
      if (pollCount >= MAX_POLLS) {
        state = 'error';
        clearInterval(pollInterval);
      }
    }
  }

  onMount(() => {
    if (!orderId) {
      state = 'error';
      return;
    }
    // Check immediately, then every 2 seconds
    checkStatus();
    pollInterval = setInterval(checkStatus, 2000);
  });

  onDestroy(() => {
    if (pollInterval) clearInterval(pollInterval);
  });

  $: progressPercent = Math.min((pollCount / MAX_POLLS) * 100, 100);
</script>

<svelte:head>
  <title>Your Download – Vizan Labs</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 py-16">
  <div class="w-full max-w-md">

    <!-- ═══ WAITING: Polling for webhook ═══ -->
    {#if state === 'waiting'}
      <div class="card p-8 text-center space-y-6">
        <!-- Animated spinner -->
        <div class="relative w-24 h-24 mx-auto">
          <div class="absolute inset-0 rounded-full border-4 animate-spin"
            style="border-color:var(--gold) transparent transparent transparent"></div>
          <div class="absolute inset-3 rounded-full flex items-center justify-center text-3xl"
            style="background:var(--card)">⏳</div>
        </div>

        <div>
          <h1 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700"
            class="mb-2">Verifying Payment…</h1>
          <p style="color:var(--text-2)" class="text-sm">
            Please wait while we confirm your payment with Cashfree.
            This takes a few seconds.
          </p>
        </div>

        <!-- Progress bar -->
        <div class="w-full rounded-full h-1.5" style="background:var(--border)">
          <div class="h-1.5 rounded-full transition-all duration-300"
            style="width:{progressPercent}%; background:var(--gold)"></div>
        </div>

        <p class="text-xs" style="color:var(--text-3)">
          🔒 Do not close this tab · Verifying securely…
        </p>
      </div>

    <!-- ═══ VERIFIED: Show download button ═══ -->
    {:else if state === 'verified'}
      <div class="card p-8 text-center space-y-6">
        <!-- Success icon -->
        <div class="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto"
          style="background:rgba(34,197,94,0.1);border:2px solid rgba(34,197,94,0.3)">✅</div>

        <div>
          <h1 style="font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700"
            class="mb-2">Payment Confirmed! 🎉</h1>
          <p style="color:var(--text-2)" class="text-sm">
            Your download is ready. Click below to save your PDF.
          </p>
        </div>

        <!-- The actual download button -->
        <a
          href="/api/download?token={downloadToken}"
          class="btn btn-gold w-full justify-center py-4 text-base font-bold shadow-xl"
          style="shadow-color:var(--gold)"
          download
        >
          ⬇️ Download Your PDF
        </a>

        <div class="space-y-2 text-xs" style="color:var(--text-3)">
          <p>🔒 Secure link · Expires in 24 hours</p>
          <p>If download doesn't start, <a href="/api/download?token={downloadToken}"
            style="color:var(--gold)" class="underline">click here</a></p>
        </div>

        <div class="divider"></div>

        <a href="/shop" class="btn btn-outline w-full justify-center text-sm">
          Browse More Products →
        </a>
      </div>

    <!-- ═══ EXPIRED ═══ -->
    {:else if state === 'expired'}
      <div class="card p-8 text-center space-y-6">
        <div class="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto"
          style="background:rgba(239,68,68,0.1);border:2px solid rgba(239,68,68,0.3)">⏰</div>
        <div>
          <h1 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700"
            class="mb-2">Link Expired</h1>
          <p style="color:var(--text-2)" class="text-sm">
            This download link has expired (24 hour limit).
            Please contact support with your order ID below.
          </p>
        </div>
        {#if orderId}
          <div class="p-3 rounded-lg text-xs font-mono" style="background:var(--border)">
            Order ID: {orderId}
          </div>
        {/if}
        <a href="mailto:support@vizanlabs.com?subject=Download Link Expired - Order {orderId}"
          class="btn btn-outline w-full justify-center">
          📧 Contact Support
        </a>
      </div>

    <!-- ═══ ERROR: Timeout / no webhook ═══ -->
    {:else if state === 'error'}
      <div class="card p-8 text-center space-y-6">
        <div class="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto"
          style="background:rgba(239,68,68,0.1);border:2px solid rgba(239,68,68,0.3)">⚠️</div>
        <div>
          <h1 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700"
            class="mb-2">Verification Pending</h1>
          <p style="color:var(--text-2)" class="text-sm leading-relaxed">
            Payment verification is taking longer than expected.
            If payment was successful, your download link will be sent to your email.
            <br/><br/>
            <strong>Please do not pay again.</strong>
          </p>
        </div>
        {#if orderId}
          <div class="p-3 rounded-lg text-xs font-mono" style="background:var(--border)">
            Order ID: {orderId}
          </div>
        {/if}
        <div class="flex flex-col gap-3">
          <button on:click={() => { state='waiting'; pollCount=0; checkStatus(); pollInterval=setInterval(checkStatus,2000); }}
            class="btn btn-gold w-full justify-center">
            🔄 Try Again
          </button>
          <a href="mailto:support@vizanlabs.com?subject=Download Help - Order {orderId}"
            class="btn btn-outline w-full justify-center text-sm">
            📧 Contact Support
          </a>
        </div>
      </div>
    {/if}

  </div>
</div>

<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
