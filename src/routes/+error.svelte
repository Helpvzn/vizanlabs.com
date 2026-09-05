<script>import { page } from '$app/stores';</script>
<div class="min-h-screen flex items-center justify-center px-4">
  <div class="text-center">
    <div class="mb-4" style="font-family:'Playfair Display',serif;font-size:7rem;font-weight:700;color:var(--border)">{$page.status}</div>
    <h1 class="mb-4" style="font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700">{$page.error?.message || 'Something went wrong'}</h1>
    <div class="flex gap-3 justify-center">
      <a href="/" class="btn btn-gold">Go Home</a>
      <a href="/shop" class="btn btn-outline">Browse Shop</a>
    </div>
  </div>
</div>
