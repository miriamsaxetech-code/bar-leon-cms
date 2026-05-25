// Cloudflare Pages Function — GitHub OAuth token exchange
// GitHub redirects here after login. We exchange the code for a token,
// then post it back to the CMS window via postMessage.
// Requires env vars: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: context.env.GITHUB_CLIENT_ID,
      client_secret: context.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await tokenRes.json();

  if (data.error) {
    return new Response(
      `GitHub OAuth error: ${data.error_description || data.error}`,
      { status: 400 }
    );
  }

  const content = JSON.stringify({ token: data.access_token, provider: 'github' });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Autorizando...</title></head>
<body>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage('authorization:github:success:${content}', e.origin);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
