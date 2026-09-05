<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { SvelteToast } from '@zerodevx/svelte-toast';

  export let data;

  // CMS settings destructure
  $: site        = data.site        || {};
  $: ann         = data.announcement || {};
  $: header      = data.header      || {};
  $: footer      = data.footer      || {};

  // Apply CMS-controlled primary color as CSS variable dynamically
  $: if (typeof document !== 'undefined' && site.primaryColor) {
    document.documentElement.style.setProperty('--gold', site.primaryColor);
  }

  let scrolled = false;
  let mobileOpen = false;
  let shopOpen = false;
  let shopTimer = null;

  function openShop() {
    if (shopTimer) { clearTimeout(shopTimer); shopTimer = null; }
    shopOpen = true;
  }
  function closeShop() {
    shopTimer = setTimeout(() => { shopOpen = false; }, 150);
  }

  onMount(() => {
    const fn = () => scrolled = window.scrollY > 20;
    window.addEventListener('scroll', fn, { passive: true });
    // Load Lemon Squeezy overlay
    const s = document.createElement('script');
    s.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    s.defer = true;
    s.onload = () => window.createLemonSqueezy?.();
    document.head.appendChild(s);
    return () => window.removeEventListener('scroll', fn);
  });


  $: isActive = (href) => $page.url.pathname === href || ($page.url.pathname.startsWith(href + '/') && href !== '/');

  // CMS extra nav links merged with defaults
  $: hpCategories = data.homepage?.categories || [];
  $: shopCategories = hpCategories.length > 0 ? hpCategories.map(c => ({
    icon: c.icon, label: c.name, href: c.href, desc: c.desc || ''
  })) : [
    { icon: '✨', label: 'AI Prompts',      href: '/shop?category=AI+Prompts',      desc: 'Power your workflow with AI' },
    { icon: '📊', label: 'Excel Templates',  href: '/shop?category=Excel+Templates',  desc: 'Business, finance & tracking' },
    { icon: '🌿', label: 'Eco Planners',     href: '/shop?category=Eco+Planners',     desc: 'Sustainable life planning' },
    { icon: '✅', label: 'Habit Trackers',   href: '/shop?category=Habit+Trackers',   desc: 'Build better routines' },
    { icon: '💼', label: 'Business Kits',    href: '/shop?category=Business+Kits',    desc: 'Complete business packs' },
    { icon: '🎯', label: 'All Products',     href: '/shop',                           desc: 'Browse everything' },
  ];

  // CMS extra nav links merged with defaults
  $: extraLinks = header.navLinks || [];
  $: year = new Date().getFullYear();
  $: social = footer.social || {};
</script>

<svelte:head>
  <title>{site.siteName || 'Premium Templates'}</title>
  <meta name="description" content={site.tagline || ''} />
</svelte:head>

<SvelteToast />

<!-- ========== ANNOUNCEMENT BAR (CMS controlled) ========== -->
{#if ann.enabled && ann.text}
  <div class="text-center py-2 px-4 text-sm font-medium text-black"
    style="background:{ann.bgColor || 'var(--gold)'}">
    {ann.text}
    {#if ann.link}
      <a href={ann.link} class="underline ml-2 font-bold">Shop Now →</a>
    {/if}
  </div>
{/if}

<!-- ========== HEADER (CMS controlled) ========== -->
<header class="fixed left-0 right-0 z-50 transition-all duration-300"
  style="top:{ann.enabled && ann.text ? '36px' : '0'}"
  class:hblur={scrolled}
  style:border-bottom={scrolled ? '1px solid var(--border)' : 'none'}>
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

    <!-- Logo (CMS: site.siteName, site.logo) -->
    <a href="/" class="flex items-center gap-3">
      {#if site.logo}
        <img src={site.logo} alt={site.siteName} class="h-8 w-auto" />
      {:else}
        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black text-sm"
          style="background:var(--gold); font-family:'Playfair Display',serif">PT</div>
        <span style="font-family:'Playfair Display',serif; font-weight:700; font-size:1.1rem">
          {site.siteName || 'Premium'}<span style="color:var(--gold)">Templates</span>
        </span>
      {/if}
    </a>

    <!-- Desktop Nav -->
    <div class="hidden lg:flex items-center gap-1">
      <a href="/" class="px-4 py-2 text-sm rounded-lg transition-colors"
        style="color:{isActive('/') ? 'var(--gold)' : 'var(--text-2)'}">Home</a>

      <!-- Shop mega menu -->
      <div class="relative" role="none"
        on:mouseenter={openShop}
        on:mouseleave={closeShop}>
        <button class="px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-1"
          style="color:{isActive('/shop') ? 'var(--gold)' : 'var(--text-2)'}">
          Shop
          <svg class="w-3 h-3 transition-transform" class:rotate-180={shopOpen} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {#if shopOpen}
          <!-- Invisible bridge fills the gap between button and dropdown so mouse move doesn't close it -->
          <div class="absolute top-full left-0 right-0 h-3" on:mouseenter={openShop} on:mouseleave={closeShop}></div>
          <div class="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[480px] card p-5 shadow-2xl"
            on:mouseenter={openShop}
            on:mouseleave={closeShop}>
            <div class="grid grid-cols-2 gap-2">
              {#each shopCategories as cat}
                <a href={cat.href} class="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group">
                  <span class="text-xl shrink-0 flex items-center justify-center w-8 h-8">
                    {#if cat.icon?.startsWith('/') || cat.icon?.startsWith('http')}
                      <img src={cat.icon} alt={cat.label} class="w-full h-full object-contain" />
                    {:else}
                      {cat.icon || '📁'}
                    {/if}
                  </span>
                  <div>
                    <div class="text-sm font-medium group-hover:text-[var(--gold)] transition-colors">{cat.label}</div>
                    <div class="text-xs mt-0.5" style="color:var(--text-3)">{cat.desc}</div>
                  </div>
                </a>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <a href="/blog" class="px-4 py-2 text-sm rounded-lg transition-colors"
        style="color:{isActive('/blog') ? 'var(--gold)' : 'var(--text-2)'}">Blog</a>
      <a href="/about" class="px-4 py-2 text-sm rounded-lg transition-colors"
        style="color:{isActive('/about') ? 'var(--gold)' : 'var(--text-2)'}">About</a>

      <!-- CMS extra nav links -->
      {#each extraLinks as lnk}
        {#if lnk.label && lnk.href}
          <a href={lnk.href} target={lnk.external ? '_blank' : '_self'}
            class="px-4 py-2 text-sm rounded-lg transition-colors"
            style="color:var(--text-2)">{lnk.label}</a>
        {/if}
      {/each}
    </div>

    <!-- Right actions -->
    <div class="flex items-center gap-2">
      {#if header.showSearch !== false}
        <a href="/search" class="p-2 rounded-lg transition-colors hover:bg-[#1a1a1a]" style="color:var(--text-2)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </a>
      {/if}



      <button class="lg:hidden p-2 rounded-lg hover:bg-[#1a1a1a]"
        on:click={() => mobileOpen = !mobileOpen}>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if mobileOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/>
          {/if}
        </svg>
      </button>
    </div>
  </nav>

  <!-- Mobile Menu -->
  {#if mobileOpen}
    <div class="lg:hidden border-t py-4 px-4 space-y-1" style="background:var(--bg); border-color:var(--border)">
      {#each [['/', 'Home'], ['/shop', 'Shop'], ['/blog', 'Blog'], ['/about', 'About'], ['/faq', 'FAQ'], ['/contact', 'Contact']] as [href, label]}
        <a {href} on:click={() => mobileOpen=false}
          class="block px-4 py-2.5 rounded-lg text-sm transition-colors"
          style="color:{isActive(href) ? 'var(--gold)' : 'var(--text-2)'}">{label}</a>
      {/each}
      <div class="pt-2 border-t" style="border-color:var(--border)">
        <p class="text-xs px-4 py-2" style="color:var(--text-3)">Categories</p>
        {#each shopCategories as cat}
          <a href={cat.href} on:click={() => mobileOpen=false}
            class="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:text-[var(--gold)]"
            style="color:var(--text-2)">
            <span class="w-5 h-5 flex items-center justify-center shrink-0">
              {#if cat.icon?.startsWith('/') || cat.icon?.startsWith('http')}
                <img src={cat.icon} alt={cat.label} class="w-full h-full object-contain" />
              {:else}
                {cat.icon || '📁'}
              {/if}
            </span>
            {cat.label}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</header>

<!-- Spacer for fixed header -->
<div style="height:{ann.enabled && ann.text ? '88px' : '64px'}"></div>

<!-- ========== MAIN ========== -->
<main class="min-h-screen">
  <slot />
</main>

<!-- ========== FOOTER (CMS controlled) ========== -->
<footer class="border-t mt-20" style="background:var(--card); border-color:var(--border)">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

      <!-- Brand -->
      <div class="lg:col-span-2">
        <a href="/" class="flex items-center gap-3 mb-4">
          {#if site.logo}
            <img src={site.logo} alt={site.siteName} class="h-8 w-auto" />
          {:else}
            <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black text-sm"
              style="background:var(--gold); font-family:'Playfair Display',serif">PT</div>
            <span style="font-family:'Playfair Display',serif; font-weight:700">
              {site.siteName || 'Premium'}<span style="color:var(--gold)">Templates</span>
            </span>
          {/if}
        </a>
        <p class="text-sm leading-relaxed mb-6" style="color:var(--text-3)">
          {footer.tagline || site.tagline || 'Professional digital products for your career & business.'}
        </p>
        <!-- Newsletter -->
        {#if footer.showNewsletter !== false}
          <p class="text-xs font-medium uppercase tracking-widest mb-2" style="color:var(--text-3)">Get free templates</p>
          <div class="flex gap-2">
            <label for="newsletter-email" class="sr-only">Email Address</label>
            <input id="newsletter-email" type="email" placeholder="your@email.com"
              class="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none"
              style="background:var(--bg); border:1px solid var(--border); color:#fff" />
            <button class="btn btn-gold text-sm px-4 py-2.5">Subscribe</button>
          </div>
        {/if}
      </div>

      <!-- Products col -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest mb-4" style="color:var(--text-3)">Products</h3>
        <ul class="space-y-2.5">
          {#each [['Resume Templates','/shop?category=Resume+Templates'],['Excel Templates','/shop?category=Excel+Templates'],['Eco Planners','/shop?category=Eco+Planners'],['Habit Trackers','/shop?category=Habit+Trackers'],['All Products','/shop']] as [label,href]}
            <li><a {href} class="text-sm transition-colors hover:text-[var(--gold)]" style="color:var(--text-3)">{label}</a></li>
          {/each}
        </ul>
      </div>

      <!-- Company col -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest mb-4" style="color:var(--text-3)">Company</h3>
        <ul class="space-y-2.5">
          {#each [['/about','About Us'],['/blog','Blog'],['/contact','Contact'],['/faq','FAQ']] as [href,label]}
            <li><a {href} class="text-sm transition-colors hover:text-[var(--gold)]" style="color:var(--text-3)">{label}</a></li>
          {/each}
        </ul>
      </div>

      <!-- Legal col -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest mb-4" style="color:var(--text-3)">Legal</h3>
        <ul class="space-y-2.5">
          {#each [['/privacy','Privacy Policy'],['/terms','Terms of Service'],['/refund-policy','Refund Policy']] as [href,label]}
            <li><a {href} class="text-sm transition-colors hover:text-[var(--gold)]" style="color:var(--text-3)">{label}</a></li>
          {/each}
        </ul>
      </div>
    </div>

    <div class="divider my-10"></div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-xs" style="color:var(--text-3)">
        {footer.copyright || `© ${year} ${site.siteName || 'Vizan Labs'} · vizanlabs.com`}
      </p>
      <!-- Social links (CMS controlled) -->
      <div class="flex items-center gap-3">
        {#if social.twitter}
          <a href={social.twitter} target="_blank" class="hover:text-[var(--gold)] transition-colors" style="color:var(--text-3)">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        {/if}
        {#if social.instagram}
          <a href={social.instagram} target="_blank" class="hover:text-[var(--gold)] transition-colors" style="color:var(--text-3)">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
        {/if}
        {#if social.linkedin}
          <a href={social.linkedin} target="_blank" class="hover:text-[var(--gold)] transition-colors" style="color:var(--text-3)">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        {/if}
      </div>
    </div>
  </div>
</footer>


