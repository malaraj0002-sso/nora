/**
 * Stable RBAC catalogue. Permission keys are seeded in PostgreSQL and must
 * not be invented at runtime by the Dashboard.
 *
 * Matrix follows PHASE_0_ARCHITECTURE_VALIDATION.md §5.3–5.4.
 */

export const ROLE_KEYS = ['super_admin', 'admin', 'editor', 'translator', 'viewer'] as const;
export type RoleKeyName = (typeof ROLE_KEYS)[number];

export const PERMISSION_KEYS = [
  'dashboard.access',
  'content.read',
  'content.update',
  'content.publish',
  'content.delete',
  'services.update',
  'services.delete',
  'media.upload',
  'media.delete',
  'users.read',
  'users.manage',
  'roles.manage',
  'audit.read',
  'translations.update',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const ROLE_META: Record<RoleKeyName, { name: string }> = {
  super_admin: { name: 'Super Admin' },
  admin: { name: 'Admin' },
  editor: { name: 'Editor' },
  translator: { name: 'Translator' },
  viewer: { name: 'Viewer' },
};

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  'dashboard.access': 'Access the Dashboard shell',
  'content.read': 'Read CMS content',
  'content.update': 'Update structural CMS fields',
  'content.publish': 'Publish CMS content',
  'content.delete': 'Delete CMS content (locked services still denied in application code)',
  'services.update': 'Update service records including non-translation fields',
  'services.delete': 'Delete service records (locked golden slugs still denied)',
  'media.upload': 'Upload or replace media',
  'media.delete': 'Delete media',
  'users.read': 'Read staff users',
  'users.manage': 'Create, disable, or change staff users',
  'roles.manage': 'Change the role catalogue (not allowed from the Dashboard without a migration)',
  'audit.read': 'Read audit logs',
  'translations.update': 'Update translation rows only (non-structural)',
};

const ALL: readonly PermissionKey[] = PERMISSION_KEYS;

/** Admin has every permission except role-catalogue management. */
const ADMIN: readonly PermissionKey[] = PERMISSION_KEYS.filter((key) => key !== 'roles.manage');

const EDITOR: readonly PermissionKey[] = [
  'dashboard.access',
  'content.read',
  'content.update',
  'content.publish',
  'content.delete',
  'services.update',
  'services.delete',
  'media.upload',
  'translations.update',
];

const TRANSLATOR: readonly PermissionKey[] = [
  'dashboard.access',
  'content.read',
  'translations.update',
];

const VIEWER: readonly PermissionKey[] = ['dashboard.access', 'content.read'];

export const ROLE_PERMISSIONS: Record<RoleKeyName, readonly PermissionKey[]> = {
  super_admin: ALL,
  admin: ADMIN,
  editor: EDITOR,
  translator: TRANSLATOR,
  viewer: VIEWER,
};

export function isPermissionKey(value: string): value is PermissionKey {
  return (PERMISSION_KEYS as readonly string[]).includes(value);
}
