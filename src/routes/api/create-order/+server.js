/**
 * POST /api/create-order
 * Creates a unique Cashfree order for each customer via Cashfree API.
 * Body: { productSlug, customerPhone, customerName, customerEmail }
 */
export async function POST({ request, platform }) {
  const env = platform?.env;
  const headers = { 'Content-Type': 'application/json' };

  if (!env?.CASHFREE_APP_ID || !env?.CASHFREE_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Payment not configured' }), { status: 500, headers });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
  }

  const { productSlug, customerPhone, customerName = 'Customer', customerEmail = '' } = body;

  if (!productSlug || !customerPhone) {
    return new Response(JSON.stringify({ error: 'Product and phone required' }), { status: 400, headers });
  }

  // Fetch product from catalog to get price
  let product = null;
  try {
    const origin = new URL(request.url).origin;
    const res = await fetch(`${origin}/api/products-catalog`);
    if (res.ok) {
      const catalog = await res.json();
      product = catalog.find(p => p.slug === productSlug);
    }
  } catch (e) {
    console.error('Catalog fetch error:', e);
  }

  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404, headers });
  }

  // Generate unique order ID
  const orderId = `VZN_${productSlug}_${Date.now()}`;

  // Create Cashfree order
  const orderPayload = {
    order_id:       orderId,
    order_amount:   Number(product.price),
    order_currency: 'INR',
    customer_details: {
      customer_id:    `cust_${customerPhone.replace(/\D/g, '')}`,
      customer_phone: customerPhone.replace(/\D/g, '').slice(-10),
      customer_name:  customerName,
      customer_email: customerEmail || undefined
    },
    order_meta: {
      return_url:   `https://vizanlabs.com/download?order_id=${orderId}`,
      notify_url:   `https://vizanlabs.com/api/webhooks/cashfree`
    },
    order_note: product.title
  };

  try {
    const cfRes = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'x-client-id':     env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_WEBHOOK_SECRET,
        'x-api-version':   '2023-08-01',
        'Content-Type':    'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const cfData = await cfRes.json();
    console.log('Cashfree order response:', JSON.stringify(cfData));

    if (!cfRes.ok) {
      return new Response(JSON.stringify({ error: cfData.message || 'Order creation failed' }), { status: 500, headers });
    }

    // Return checkout URL
    const checkoutUrl = `https://payments.cashfree.com/order/#/${cfData.payment_session_id}`;

    return new Response(JSON.stringify({
      success: true,
      orderId,
      checkoutUrl,
      paymentSessionId: cfData.payment_session_id
    }), { status: 200, headers });

  } catch (err) {
    console.error('Cashfree order creation error:', err);
    return new Response(JSON.stringify({ error: 'Payment service error. Please try again.' }), { status: 500, headers });
  }
}
