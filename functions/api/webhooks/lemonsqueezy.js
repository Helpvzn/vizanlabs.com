export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.text();
  const payload = JSON.parse(body);
  const event = payload.meta?.event_name;
  console.log('LS Webhook:', event);
  if (event === 'order_created') {
    const order = payload.data?.attributes;
    if (order?.user_email && env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'orders@freeresumebuilder.co', to: [order.user_email],
          subject: '✅ Your Download is Ready!',
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h2>Thank you, ${order.user_name||'Customer'}! 🎉</h2><p>Your order #${payload.data?.id} is confirmed.</p><a href="${order.urls?.receipt}" style="display:inline-block;background:#d4891a;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">📥 Download Your Templates</a><p style="color:#666;margin-top:24px;font-size:14px">Questions? Reply to this email.</p></div>`
        })
      });
    }
  }
  return new Response('OK', { status: 200 });
}
