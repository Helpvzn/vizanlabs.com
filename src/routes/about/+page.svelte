<svelte:head><title>About Us</title></svelte:head>
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
  <div class="text-center mb-16">
    <div class="tag mb-4">🌟 Our Story</div>
    <h1 style="font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700" class="mb-5">
      Helping You Succeed<br/><span class="grad">One Template at a Time</span>
    </h1>
    <p class="text-xl max-w-2xl mx-auto" style="color:var(--text-2)">We create professional, beautiful digital templates that save you time and help you look your best.</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
    {#each [['🎯','Our Mission','Professional-quality templates accessible to everyone.'],['💡','Our Approach','Every template is researched, tested, and refined.'],['🌱','Our Values','Quality over quantity. Honest pricing. Real support.']] as [icon,title,desc]}
      <div class="card p-6 text-center">
        <div class="text-4xl mb-4">{icon}</div>
        <h3 style="font-family:'Playfair Display',serif" class="text-lg font-bold mb-2">{title}</h3>
        <p class="text-sm" style="color:var(--text-3)">{desc}</p>
      </div>
    {/each}
  </div>
  <div class="rounded-2xl p-10 mb-16 text-center" style="background:var(--card);border:1px solid rgba(212,137,26,0.2)">
    <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700" class="mb-8">By The Numbers</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      {#each [['5,000+','Customers'],['100+','Templates'],['4.9/5','Rating'],['2022','Founded']] as [num,label]}
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;color:var(--gold)">{num}</div>
          <div class="text-sm mt-1" style="color:var(--text-3)">{label}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="text-center">
    <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700" class="mb-4">Ready to get started?</h2>
    <p class="mb-8" style="color:var(--text-2)">Browse our collection and find the perfect template.</p>
    <a href="/shop" class="btn btn-gold text-base px-8 py-3.5">Shop All Templates →</a>
  </div>
</div>
