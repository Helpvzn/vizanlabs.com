<script>
  let open = null;
  const faqs = [
    ['How do I download after purchase?','After payment you get an email with a download link from Lemon Squeezy. Downloads are instant.'],
    ['What file formats?','DOCX + PDF for resumes, XLSX for Excel templates, PDF for planners. Check each product page.'],
    ['Can I use commercially?','Standard license is personal use only. Contact us for commercial licensing.'],
    ['Do I need special software?','Word 2016+ or Google Docs for DOCX. Excel 2016+ or Google Sheets for XLSX. Any PDF reader for PDFs.'],
    ['What is your refund policy?','30-day money-back guarantee, no questions asked. Email support@freeresumebuilder.co'],
    ['Will I get updates?','Yes! All purchases include lifetime access and free updates.'],
    ['Are resumes ATS-friendly?','Yes, tested against Workday, Greenhouse, Lever, Taleo and more.'],
    ['What payment methods?','Cards, UPI, PayPal and more via Lemon Squeezy. All payments secure and encrypted.'],
  ];
</script>
<svelte:head><title>FAQ – Premium Templates</title></svelte:head>
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
  <div class="text-center mb-16">
    <div class="tag mb-4">❓ FAQ</div>
    <h1 style="font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:700" class="mb-4">Frequently Asked Questions</h1>
    <p style="color:var(--text-2)">Everything you need to know.</p>
  </div>
  <div class="space-y-3">
    {#each faqs as [q,a], i}
      <div class="card overflow-hidden">
        <button class="w-full flex items-center justify-between p-5 text-left hover:bg-[#1a1a1a] transition-colors"
          on:click={() => open = open===i ? null : i}>
          <span class="font-medium pr-4 text-sm">{q}</span>
          <svg class="w-5 h-5 flex-shrink-0 transition-transform" class:rotate-180={open===i} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {#if open===i}
          <div class="px-5 pb-5 text-sm leading-relaxed" style="color:var(--text-2)">{a}</div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="mt-16 card p-8 text-center">
    <h3 style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700" class="mb-3">Still have questions?</h3>
    <a href="mailto:support@freeresumebuilder.co" class="btn btn-gold">📧 Email Support</a>
  </div>
</div>
