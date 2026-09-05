<svelte:head>
  <title>Contact Us – {data?.site?.siteName || 'Premium Templates'}</title>
  <meta name="description" content="Contact our support team for any questions or issues." />
</svelte:head>

<script>
  export let data;
</script>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
  <div class="tag mb-4 inline-block">📬 Get In Touch</div>
  <h1 style="font-family:'Playfair Display',serif; font-size:2.4rem; font-weight:700" class="mb-4">Contact Us</h1>
  <p class="mb-12 text-lg" style="color:var(--text-2)">We respond within 24 hours. Send us an email and we'll get back to you.</p>

  <div class="card p-10 space-y-6">
    <div class="text-6xl">✉️</div>
    <div>
      <p class="text-sm mb-2 uppercase tracking-widest font-medium" style="color:var(--text-3)">Support Email</p>
      <a href="mailto:support@freeresumebuilder.co"
        class="text-xl font-bold hover:text-[var(--gold)] transition-colors"
        style="color:var(--gold)">
        support@freeresumebuilder.co
      </a>
    </div>
    <div class="divider"></div>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div class="card p-4">
        <div class="text-lg mb-1">⚡</div>
        <div class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-3)">Response Time</div>
        <div class="font-medium">Within 24 hours</div>
      </div>
      <div class="card p-4">
        <div class="text-lg mb-1">🕐</div>
        <div class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-3)">Working Hours</div>
        <div class="font-medium">Mon–Fri, 9am–6pm IST</div>
      </div>
    </div>
    <a href="mailto:support@freeresumebuilder.co" class="btn btn-gold w-full justify-center py-4 text-base font-bold">
      Send us an Email →
    </a>
  </div>
</div>
