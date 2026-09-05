export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('Missing code', { status: 400 });
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
    });
    const data = await res.json();
    if (data.error) return new Response(`OAuth error: ${data.error_description}`, { status: 400 });
    const script = `<script>
      window.addEventListener('message', e => {
        window.opener.postMessage('authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}', e.origin);
      }, false);
      window.opener.postMessage('authorizing:github', '*');
    <\/script>`;
    return new Response(`<!DOCTYPE html><html><body>${script}</body></html>`, { headers: { 'Content-Type': 'text/html' } });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
