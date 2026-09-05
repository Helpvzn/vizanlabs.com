<script>
  export let data;
  $: legal = data.legal || {};
</script>

<svelte:head>
  <title>Privacy Policy – {data.site?.siteName || 'Premium Templates'}</title>
  <meta name="description" content="Privacy policy for {data.site?.siteName || 'Premium Templates'}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
  <h1 style="font-family:'Playfair Display',serif; font-size:2.4rem; font-weight:700" class="mb-4">Privacy Policy</h1>
  <p class="text-sm mb-12" style="color:var(--text-3)">Last updated: January 2025</p>
  <div class="space-y-6" style="color:var(--text-2); line-height:1.8">
    {#if legal.privacyContent}
      <p>{legal.privacyContent}</p>
    {:else}
      <p>This page is being set up. Please check back soon or contact us at <a href="mailto:legal@freeresumebuilder.co" style="color:var(--gold)">legal@freeresumebuilder.co</a></p>
    {/if}
    <div class="card p-6 mt-8">
      <h2 class="font-bold mb-3">Contact</h2>
      <p>For any privacy concerns, email us at <a href="mailto:legal@freeresumebuilder.co" style="color:var(--gold)">legal@freeresumebuilder.co</a></p>
    </div>
  </div>
</div>
