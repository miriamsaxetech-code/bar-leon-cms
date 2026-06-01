// Cloudflare Pages Function — Server-side image upload proxy
// POST multipart/form-data with fields: image (File), filename (string)
// Authorization: Bearer <panel_token>
// Requires env vars: GITHUB_TOKEN, PANEL_SECRET

const OWNER  = 'miriamsaxetech-code';
const REPO   = 'bar-leon-cms';
const BRANCH = 'main';
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const mimeToExtension = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function jsonError(error, status) {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function verifyToken(token, secret) {
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

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('unauthorized', 401);
  }
  const token = authHeader.slice(7);
  if (!(await verifyToken(token, env.PANEL_SECRET))) {
    return jsonError('invalid_token', 401);
  }

  if (!env.GITHUB_TOKEN) {
    return jsonError('missing_github_token', 500);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError('invalid_form', 400);
  }

  const imageFile = formData.get('image');
  if (!imageFile || typeof imageFile === 'string') {
    return jsonError('image_required', 400);
  }

  if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
    return jsonError('unsupported_image_type', 400);
  }

  if (imageFile.size > MAX_UPLOAD_BYTES) {
    return jsonError('image_too_large', 413);
  }

  const extension = mimeToExtension[imageFile.type];
  const filename = `carioca-${Date.now()}.${extension}`;
  const arrayBuffer = await imageFile.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_UPLOAD_BYTES) {
    return jsonError('image_too_large', 413);
  }
  const base64 = arrayBufferToBase64(arrayBuffer);

  const resp = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/assets/images/cariocas/${filename}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'User-Agent': 'bar-leon-cms',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'chore(panel): upload carioca image',
        content: base64,
        branch: BRANCH,
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    return jsonError(errText, 500);
  }

  return new Response(
    JSON.stringify({ ok: true, path: `/assets/images/cariocas/${filename}` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
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
