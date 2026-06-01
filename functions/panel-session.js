// Cloudflare Pages Function — validate a stored owner panel token.
// Mounted at /panel-session.

async function verifyPanelToken(token, secret) {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  try {
    const { exp } = JSON.parse(atob(parts[0]));
    if (!exp || Date.now() > exp) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify']
    );
    const sigBytes = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0));
    return crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(parts[0]));
  } catch {
    return false;
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ ok: false, error: 'missing_token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.slice(7);
  if (!(await verifyPanelToken(token, env.PANEL_SECRET))) {
    return new Response(
      JSON.stringify({ ok: false, error: 'invalid_token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
