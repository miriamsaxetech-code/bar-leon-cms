// Cloudflare Pages Function — PIN login
// POST { pin: string, remember: boolean }
// Returns { token: string } on success, 401 on wrong PIN.
// Requires env vars: PANEL_PIN, PANEL_SECRET

const SESSION_TTL = 4 * 60 * 60 * 1000;        // 4 hours
const DEVICE_TTL  = 30 * 24 * 60 * 60 * 1000;  // 30 days

async function signToken(exp, secret) {
  const enc = new TextEncoder();
  const payload = btoa(JSON.stringify({ exp }));
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${payload}.${sigB64}`;
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const panelPin    = env.PANEL_PIN;
  const panelSecret = env.PANEL_SECRET;

  if (!panelPin || !panelSecret) {
    return jsonResponse({ ok: false, error: 'missing_panel_config' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
  }

  const { pin, remember } = body;

  // Constant-time string comparison to resist timing attacks
  if (!pin || pin.length !== panelPin.length) {
    return jsonResponse({ ok: false, error: 'invalid_pin' }, 401);
  }
  let mismatch = 0;
  for (let i = 0; i < panelPin.length; i++) {
    mismatch |= pin.charCodeAt(i) ^ panelPin.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return jsonResponse({ ok: false, error: 'invalid_pin' }, 401);
  }

  const ttl   = remember ? DEVICE_TTL : SESSION_TTL;
  const token = await signToken(Date.now() + ttl, panelSecret);

  return jsonResponse({ token }, 200);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
