export type AuthErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'inactive'
  | 'last_super_admin'
  | 'invalid_role';

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status: number;

  constructor(code: AuthErrorCode, message: string, status = 403) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}

export function unauthenticated(message = 'Authentication required'): AuthError {
  return new AuthError('unauthenticated', message, 401);
}

export function forbidden(message = 'Permission denied'): AuthError {
  return new AuthError('forbidden', message, 403);
}

export function lastSuperAdminError(action: string): AuthError {
  return new AuthError(
    'last_super_admin',
    `Cannot ${action} the final active super_admin`,
    409,
  );
}
