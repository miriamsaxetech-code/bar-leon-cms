// Cloudflare Pages Function — GitHub OAuth token exchange
// GitHub redirects here after login. We exchange the code for a token,
// then either:
//   (a) post it back to the CMS window via postMessage (Decap CMS popup flow), or
//   (b) redirect to ?return= URL with token in fragment (panel redirect flow)
// Requires env vars: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state') || '';

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

  const token = data.access_token;

  // Panel redirect flow: state contains "return:/panel/" or similar
  // We redirect to the return URL with the token in the URL fragment.
  let returnUrl = null;
  if (stateParam.startsWith('return:')) {
    returnUrl = stateParam.slice('return:'.length);
  }

  if (returnUrl) {
    // Basic safety check: only allow same-origin relative paths
    if (returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      const redirectTarget = `${returnUrl}#token=${encodeURIComponent(token)}`;
      return Response.redirect(redirectTarget, 302);
    }
  }

  // Decap CMS popup flow (default): postMessage back to opener
  const content = JSON.stringify({ token, provider: 'github' });

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
