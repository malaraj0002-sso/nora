import 'server-only';

import type { PermissionKey } from './catalog';
import { forbidden } from './errors';
import { getSession, requireUser, type AuthSession, type SessionUser } from './session';

export function hasPermission(
  user: Pick<SessionUser, 'permissions' | 'isActive'>,
  permission: PermissionKey,
): boolean {
  if (!user.isActive) return false;
  return user.permissions.includes(permission);
}

export async function requirePermission(permission: PermissionKey): Promise<AuthSession> {
  const session = await requireUser();
  if (!hasPermission(session.user, permission)) {
    throw forbidden(`Missing permission ${permission}`);
  }
  return session;
}

export { requireUser, getSession };
