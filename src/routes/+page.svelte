<script>
  import ProductCard from '$lib/components/ProductCard.svelte';

  export let data;

  $: hp   = data.homepage || {};
  $: site = data.site     || {};
  $: featured    = data.featured    || [];
  $: recentPosts = data.recentPosts || [];

  $: categories = hp.categories?.length ? hp.categories : [
    { icon: '📄', name: 'Resume Templates', href: '/shop?category=Resume+Templates' },
    { icon: '📊', name: 'Excel Templates',  href: '/shop?category=Excel+Templates'  },
    { icon: '🌿', name: 'Eco Planners',     href: '/shop?category=Eco+Planners'     },
    { icon: '✅', name: 'Habit Trackers',   href: '/shop?category=Habit+Trackers'   },
    { icon: '💼', name: 'Business Kits',    href: '/shop?category=Business+Kits'    },
  ];

  $: stats = hp.stats?.length ? hp.stats : [
    { number: '5000+', label: 'Customers' },
    { number: '100+',  label: 'Templates' },
    { number: '4.9★',  label: 'Rating'   },
    { number: '24h',   label: 'Support'  },
  ];

  $: features = hp.features?.length ? hp.features : [
    { icon: '⚡', title: 'Instant Download', desc: 'Get your files immediately after purchase' },
    { icon: '♾️', title: 'Lifetime Access',  desc: 'Download anytime, forever' },
    { icon: '🔄', title: 'Free Updates',     desc: 'All future improvements included' },
    { icon: '💬', title: 'Support',          desc: 'We are always here to help' },
  ];

  $: customizeServices = hp.customizeServices?.length ? hp.customizeServices : [
    { icon: '✏️', title: 'Custom Resume Design', desc: 'We customize any resume template with your details and branding' },
    { icon: '📊', title: 'Excel Sheet Setup',    desc: 'We configure your Excel template with your data and formulas' },
    { icon: '⚡', title: 'Fast Delivery',        desc: 'Get your customized file within 24 hours via email' },
  ];

  $: testimonials = hp.testimonials?.length ? hp.testimonials : [
    { name: 'Priya Sharma', role: 'Software Engineer', text: 'Got my dream job using the ATS resume template!', stars: 5 },
    { name: 'Rahul Gupta',  role: 'Business Owner',    text: 'Excel templates saved me hours every week.',      stars: 5 },
    { name: 'Ananya Singh', role: 'Freelancer',        text: 'Eco planner helped me organise my entire life.',  stars: 5 },
  ];

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  }
</script>

<svelte:head>
  <title>{hp.seoTitle || site.siteName || 'Premium Templates'}</title>
  <meta name="description" content={hp.seoDesc || site.tagline || ''} />
</svelte:head>

<!-- ===== HERO ===== -->
<section class="relative min-h-[88vh] flex items-center overflow-hidden">
  <div class="absolute inset-0 opacity-[0.03]"
    style="background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:60px 60px"></div>
  <div class="absolute inset-0" style="background:radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,137,26,0.18) 0%, transparent 70%)"></div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
    <div class="max-w-3xl">
      <div class="tag mb-6">✨ 100+ Professional Templates</div>
      <h1 class="mb-6 leading-tight" style="font-family:'Playfair Display',serif; font-size:clamp(2.2rem,5vw,3.8rem); font-weight:700; color:{hp.headlineColor || 'inherit'}">
        {#if hp.heroHeadline}
          {hp.heroHeadline}
        {:else}
          Level Up Your Career with<br/><span class="grad">Premium Templates</span>
        {/if}
      </h1>
      <p class="mb-10 text-lg leading-relaxed max-w-xl" style="color:{hp.subheadlineColor || 'var(--text-2)'}">
        {hp.heroSubheadline || 'Professionally designed resume templates, Excel sheets, eco-friendly planners, and productivity tools. Instant download, lifetime access.'}
      </p>
      <div class="flex flex-wrap gap-4">
        <a href={hp.heroCtaLink || '/shop'} class="btn btn-gold text-base px-8 py-3.5">
          {hp.heroCta || 'Browse Templates →'}
        </a>
      </div>
      {#if hp.showStats !== false}
        <div class="flex flex-wrap gap-8 mt-14 pt-10 border-t" style="border-color:var(--border)">
          {#each stats as s}
            <div>
              <div style="font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:700; color:var(--gold)">{s.number}</div>
              <div class="text-xs mt-0.5" style="color:var(--text-3)">{s.label}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- ===== CATEGORIES (CMS Dynamic) ===== -->
<section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div class="text-center mb-12">
    <h2 class="mb-3" style="font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:700">{hp.categoriesTitle || 'Browse by Category'}</h2>
    <p style="color:var(--text-2)">{hp.categoriesTagline || 'Find exactly what you need'}</p>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {#each categories as cat}
      <a href={cat.href} class="card p-6 text-center group hover:-translate-y-1 transition-transform flex flex-col items-center">
        <div class="mb-3 group-hover:scale-110 transition-transform inline-flex items-center justify-center w-12 h-12">
          {#if cat.icon?.startsWith('/') || cat.icon?.startsWith('http')}
            <img src={cat.icon} alt={cat.name} class="w-full h-full object-contain" />
          {:else}
            <span class="text-4xl">{cat.icon || '📁'}</span>
          {/if}
        </div>
        <h3 class="font-medium text-sm group-hover:text-[var(--gold)] transition-colors">{cat.name}</h3>
      </a>
    {/each}
  </div>
</section>

<!-- ===== CUSTOMIZE SERVICES (CMS Dynamic) ===== -->
{#if hp.customizeEnabled !== false}
<section class="py-20" style="background:var(--card)">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="rounded-2xl overflow-hidden" style="border:1px solid rgba(212,137,26,0.25); background:linear-gradient(135deg,#1a1a1a 0%,#111 100%)">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <!-- Left: Info -->
        <div class="p-10 lg:p-14 flex flex-col justify-center relative">
          <div class="absolute inset-0 opacity-5" style="background:radial-gradient(ellipse at top left,var(--gold),transparent 60%)"></div>
          <div class="relative">
            <div class="tag mb-4">🎨 Custom Service</div>
            <h2 class="mb-4" style="font-family:'Playfair Display',serif; font-size:clamp(1.6rem,3vw,2.4rem); font-weight:700">
              {hp.customizeTitle || 'Need a Custom Template?'}
            </h2>
            <p class="mb-8 leading-relaxed" style="color:var(--text-2)">
              {hp.customizeSubtitle || 'Get your resume or spreadsheet customized by our experts. Professional, fast, and affordable.'}
            </p>
            <!-- Price badge -->
            <div class="flex items-baseline gap-3 mb-8">
              <span style="font-family:'Playfair Display',serif; font-size:3rem; font-weight:700; color:var(--gold)">
                {hp.customizePrice || '$2.99'}
              </span>
              <span style="color:var(--text-3)">per customization</span>
            </div>
            <a href={hp.customizeCtaLink || 'mailto:support@freeresumebuilder.co'} class="btn btn-gold text-base px-8 py-4 inline-flex">
              {hp.customizeCtaText || 'Get Customized Now →'}
            </a>
          </div>
        </div>
        <!-- Right: Service cards -->
        <div class="p-10 lg:p-14 space-y-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l" style="border-color:rgba(212,137,26,0.15)">
          {#each customizeServices as svc}
            <div class="flex items-start gap-4 p-5 rounded-xl" style="background:rgba(255,255,255,0.03); border:1px solid var(--border)">
              <div class="text-2xl shrink-0 flex items-center justify-center w-8 h-8">
                {#if svc.icon?.startsWith('/') || svc.icon?.startsWith('http')}
                  <img src={svc.icon} alt={svc.title} class="w-full h-full object-contain" />
                {:else}
                  {svc.icon || '✨'}
                {/if}
              </div>
              <div>
                <h3 class="font-semibold mb-1">{svc.title}</h3>
                <p class="text-sm" style="color:var(--text-3)">{svc.desc}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
{/if}

<!-- ===== FEATURED PRODUCTS ===== -->
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-12">
      <div>
        <h2 class="mb-1" style="font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:700">Featured Products</h2>
        <p style="color:var(--text-2)">Our most popular templates</p>
      </div>
      <a href="/shop" class="btn btn-outline hidden sm:flex">View All →</a>
    </div>
    {#if featured.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each featured as product (product.slug)}
          <ProductCard {product} />
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each Array(4) as _}
          <div class="card overflow-hidden">
            <div class="skeleton aspect-[4/3]"></div>
            <div class="p-4 space-y-3">
              <div class="skeleton h-3 w-2/3 rounded"></div>
              <div class="skeleton h-3 w-1/2 rounded"></div>
              <div class="skeleton h-8 w-full rounded-lg"></div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<!-- ===== WHY CHOOSE US (CMS Dynamic) ===== -->
<section class="py-20" style="background:var(--card)">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-center mb-12" style="font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:700">
      {hp.featuresTitle || 'Why Choose Us?'}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each features as f}
        <div class="card p-6 text-center hover:-translate-y-1 transition-transform flex flex-col items-center">
          <div class="mb-4 inline-flex items-center justify-center w-12 h-12">
            {#if f.icon?.startsWith('/') || f.icon?.startsWith('http')}
              <img src={f.icon} alt={f.title} class="w-full h-full object-contain" />
            {:else}
              <span class="text-4xl">{f.icon || '✨'}</span>
            {/if}
          </div>
          <h3 class="font-semibold mb-2">{f.title}</h3>
          <p class="text-sm" style="color:var(--text-3)">{f.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ===== TESTIMONIALS (CMS Dynamic) ===== -->
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-center mb-12" style="font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:700">
      What Our Customers Say
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each testimonials as t}
        <div class="card p-6">
          <div class="flex text-yellow-400 mb-4 text-lg">
            {#each Array(t.stars || 5) as _}★{/each}
          </div>
          <p class="text-sm mb-6 leading-relaxed" style="color:var(--text-2)">"{t.text}"</p>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style="background:rgba(212,137,26,0.15); color:var(--gold)">
              {(t.name || 'A')[0]}
            </div>
            <div>
              <div class="font-medium text-sm">{t.name}</div>
              <div class="text-xs" style="color:var(--text-3)">{t.role}</div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ===== RECENT BLOG POSTS ===== -->
{#if recentPosts.length > 0}
<section class="py-20" style="background:var(--card)">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-12">
      <h2 style="font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:700">From the Blog</h2>
      <a href="/blog" class="btn btn-outline hidden sm:flex">All Posts →</a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each recentPosts as post}
        <a href="/blog/{post.slug}" class="card overflow-hidden group">
          <div class="aspect-video overflow-hidden" style="background:var(--border)">
            {#if post.coverImage}
              <img src={post.coverImage} alt={post.title}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {:else}
              <div class="w-full h-full flex items-center justify-center text-4xl">✍️</div>
            {/if}
          </div>
          <div class="p-5">
            {#if post.category}<span class="tag text-xs mb-3 inline-block">{post.category}</span>{/if}
            <h3 class="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[var(--gold)] transition-colors">{post.title}</h3>
            {#if post.excerpt}
              <p class="text-xs line-clamp-2 mb-3" style="color:var(--text-3)">{post.excerpt}</p>
            {/if}
            <p class="text-xs" style="color:var(--text-3)">{post.author || 'Admin'} · {fmtDate(post.date)}</p>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
{/if}

<!-- ===== CTA ===== -->
<section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div class="rounded-2xl text-center py-16 px-8 relative overflow-hidden"
    style="background:linear-gradient(135deg,#1a1a1a,#111); border:1px solid rgba(212,137,26,0.2)">
    <div class="absolute inset-0" style="background:radial-gradient(ellipse at center,rgba(212,137,26,0.1) 0%,transparent 70%)"></div>
    <div class="relative">
      <h2 class="mb-4" style="font-family:'Playfair Display',serif; font-size:clamp(1.6rem,4vw,2.8rem); font-weight:700">
        Ready to Transform Your Career?
      </h2>
      <p class="mb-8 text-lg" style="color:var(--text-2)">Join 5,000+ professionals who've upgraded with our templates</p>
      <a href="/shop" class="btn btn-gold text-base px-10 py-4">Shop All Templates →</a>
    </div>
  </div>
</section>
