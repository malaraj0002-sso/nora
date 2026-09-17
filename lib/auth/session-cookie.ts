/**
 * Cookie flags for first-party Dashboard sessions.
 * The cookie value is the raw random token; PostgreSQL stores SHA-256(token) only.
 *
 * `__Host-` requires Secure, Path=/, and no Domain attribute.
 */

export const SESSION_COOKIE_NAME = '__Host-nora-session';

export type SessionCookieOptions = {
  httpOnly: true;
  secure: true;
  sameSite: 'lax';
  path: '/';
  expires: Date;
};

export function sessionCookieOptions(expiresAt: Date): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  };
}
