import { parseCookie } from './_crypto';

interface Env {
  ALLOWED_ORIGIN: string;
}

export function checkCsrf(request: Request, env: Env): Response | null {
  // Only validate Origin when it is present. Same-origin requests omit it;
  // cross-origin requests always include it, so a wrong origin is still blocked.
  const origin = request.headers.get('Origin');
  if (origin !== null && origin !== env.ALLOWED_ORIGIN) {
    return new Response('Forbidden', { status: 403 });
  }

  // Double-submit cookie: the JS-readable __Host-csrf cookie value must match
  // the X-GitHub-App-CSRF request header. Forged cross-origin requests cannot
  // read the cookie, so they cannot supply the correct header value.
  const headerToken = request.headers.get('X-GitHub-App-CSRF');
  const cookieToken = parseCookie(request.headers.get('Cookie'), '__Host-csrf');
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return new Response('Forbidden', { status: 403 });
  }

  return null;
}
