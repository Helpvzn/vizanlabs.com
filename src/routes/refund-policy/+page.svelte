<script>
  export let data;
  $: legal = data.legal || {};
</script>

<svelte:head>
  <title>Refund Policy – {data.site?.siteName || 'Premium Templates'}</title>
  <meta name="description" content="Refund policy for {data.site?.siteName || 'Premium Templates'}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
  <h1 style="font-family:'Playfair Display',serif; font-size:2.4rem; font-weight:700" class="mb-4">Refund Policy</h1>
  <p class="text-sm mb-12" style="color:var(--text-3)">Last updated: January 2025</p>
  <div class="space-y-6" style="color:var(--text-2); line-height:1.8">
    <!-- Main policy -->
    <div class="card p-6 border-l-4" style="border-left-color:var(--gold)">
      <h2 class="font-bold text-lg mb-3" style="color:var(--gold)">⚠️ No Refund Policy</h2>
      <p>Since we offer non-tangible, irrevocable digital goods, we do <strong>NOT</strong> provide refunds after the product is purchased, which you acknowledge prior to purchasing any product on the website.</p>
    </div>
    {#if legal.refundContent}
      <p>{legal.refundContent}</p>
    {/if}
    <!-- Exception -->
    <div class="card p-6">
      <h2 class="font-bold mb-3">Exceptional Circumstances</h2>
      <p class="mb-4">If the file you received is corrupt or there is a technical problem with the file itself:</p>
      <ul class="space-y-2">
        <li class="flex items-start gap-3">
          <span style="color:var(--gold)">✓</span>
          <span>Email us at <a href="mailto:support@freeresumebuilder.co" style="color:var(--gold); font-weight:600">support@freeresumebuilder.co</a> within <strong>48 hours</strong> of purchase.</span>
        </li>
        <li class="flex items-start gap-3">
          <span style="color:var(--gold)">✓</span>
          <span>After verification of the issue, we will send you the correct file directly to your email address.</span>
        </li>
      </ul>
    </div>
    <div class="card p-6">
      <h2 class="font-bold mb-2">Contact Support</h2>
      <p>Email: <a href="mailto:support@freeresumebuilder.co" style="color:var(--gold)">support@freeresumebuilder.co</a></p>
    </div>
  </div>
</div>
