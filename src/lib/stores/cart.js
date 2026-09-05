import { writable, derived } from 'svelte/store';

function createCart() {
  let initial = [];
  if (typeof localStorage !== 'undefined') {
    try { initial = JSON.parse(localStorage.getItem('cart') || '[]'); } catch {}
  }
  const { subscribe, set, update } = writable(initial);
  return {
    subscribe,
    add(product) {
      update(items => {
        const ex = items.find(i => i.id === product.id);
        return ex
          ? items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...items, { ...product, quantity: 1 }];
      });
    },
    remove(id) { update(items => items.filter(i => i.id !== id)); },
    updateQty(id, qty) {
      if (qty <= 0) { update(items => items.filter(i => i.id !== id)); return; }
      update(items => items.map(i => i.id === id ? { ...i, quantity: qty } : i));
    },
    clear() { set([]); }
  };
}

export const cartItems = createCart();
export const cartOpen  = writable(false);
export const cartTotal = derived(cartItems, $i => $i.reduce((s, i) => s + i.price * i.quantity, 0));

// Persist to localStorage
cartItems.subscribe(items => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
});
