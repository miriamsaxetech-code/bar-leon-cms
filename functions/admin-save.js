// Cloudflare Pages Function — Admin save endpoint
// Accepts POST with JSON body containing the full updated venue.json
// Commits it to GitHub via the Contents API.
// Requires env vars: GITHUB_TOKEN (a PAT with repo write access), PANEL_SECRET

async function verifyPanelToken(token, secret) {
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

export async function onRequestPost(context) {
  const { request, env } = context;

  // ── Auth check ──────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('No autorizado', { status: 401 });
  }
  const userToken = authHeader.slice(7);

  if (!(await verifyPanelToken(userToken, env.PANEL_SECRET))) {
    return new Response('Token no válido o caducado', { status: 401 });
  }

  // ── Read current file SHA (required for GitHub Contents API update) ─────────
  const OWNER  = 'miriamsaxetech-code';
  const REPO   = 'bar-leon-cms';
  const PATH   = 'data/venue.json';
  const BRANCH = 'main';
  const PAT    = env.GITHUB_TOKEN;

  if (!PAT) {
    return new Response('Configuración incompleta: falta GITHUB_TOKEN', { status: 500 });
  }

  const currentFile = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`,
    {
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'User-Agent': 'bar-leon-cms',
      },
    }
  );

  if (!currentFile.ok) {
    return new Response('Error al leer el archivo actual', { status: 500 });
  }

  const fileData = await currentFile.json();
  const sha = fileData.sha;

  // ── Get updated content from request body ──────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Cuerpo de la petición no válido', { status: 400 });
  }

  // Encode content as base64 for GitHub API
  const jsonStr = JSON.stringify(body, null, 2);
  const content = btoa(unescape(encodeURIComponent(jsonStr)));

  // ── Commit to GitHub ────────────────────────────────────────────────────────
  const commit = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'User-Agent': 'bar-leon-cms',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'chore(panel): update venue.json via admin panel',
        content,
        sha,
        branch: BRANCH,
      }),
    }
  );

  if (!commit.ok) {
    const errText = await commit.text();
    // 409 Conflict means SHA mismatch (file changed since we read it)
    if (commit.status === 409) {
      return new Response(
        JSON.stringify({ ok: false, error: 'conflict' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ ok: false, error: errText }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Handle OPTIONS preflight for cross-origin dev scenarios
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
