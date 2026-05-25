// Cloudflare Pages Function — GitHub OAuth redirect
// Decap CMS opens a popup to /auth, which redirects to GitHub login.
// Requires env vars: GITHUB_CLIENT_ID

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const state = url.searchParams.get('state') || '';

  const params = new URLSearchParams({
    client_id: context.env.GITHUB_CLIENT_ID,
    scope: 'repo,user',
    state,
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
}
