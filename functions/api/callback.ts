import { encrypt, decrypt, parseCookie, b64url } from './_crypto';

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_CRYPTO_KEY: string;
  ALLOWED_ORIGIN: string;
}

interface PkcePayload {
  code_verifier: string;
  state: string;
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');

  if (!code || !returnedState) {
    return new Response('Missing code or state', { status: 400 });
  }

  const pkceToken = parseCookie(request.headers.get('Cookie'), '__Host-pkce');
  if (!pkceToken) {
    return new Response('Missing PKCE cookie', { status: 400 });
  }

  let pkce: PkcePayload;
  try {
    pkce = (await decrypt(pkceToken, env.SESSION_CRYPTO_KEY)) as PkcePayload;
  } catch {
    return new Response('Invalid PKCE cookie', { status: 400 });
  }

  if (pkce.state !== returnedState) {
    return new Response('State mismatch', { status: 400 });
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      code_verifier: pkce.code_verifier,
      redirect_uri: `${env.ALLOWED_ORIGIN}/api/callback`,
    }),
  });

  if (!res.ok) {
    return new Response('GitHub token exchange failed', { status: 502 });
  }

  const data = (await res.json()) as Record<string, string | number>;

  if (data['error'] || !data['access_token']) {
    return new Response(String(data['error_description'] ?? data['error'] ?? 'No token'), {
      status: 400,
    });
  }

  const expiresAt = Date.now() + (data['expires_in'] as number) * 1000;
  const csrfToken = b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const session = await encrypt(
    {
      accessToken: data['access_token'],
      refreshToken: data['refresh_token'],
      expiresAt,
    },
    env.SESSION_CRYPTO_KEY,
  );

  return new Response(null, {
    status: 302,
    headers: new Headers([
      ['Location', `${env.ALLOWED_ORIGIN}/?authed=1`],
      ['Set-Cookie', `__Host-pkce=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`],
      ['Set-Cookie', `__Host-session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/`],
      ['Set-Cookie', `__Host-csrf=${csrfToken}; Secure; SameSite=Strict; Path=/`],
    ]),
  });
};
