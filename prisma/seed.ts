import { PrismaClient, RoleKey } from '@prisma/client';
import {
  PERMISSION_DESCRIPTIONS,
  PERMISSION_KEYS,
  ROLE_KEYS,
  ROLE_META,
  ROLE_PERMISSIONS,
} from '../lib/auth/catalog';
import { requireLocalDatabaseUrl } from '../lib/db/assert-local';

/**
 * Idempotent auth catalogue seed. Roles and permissions only.
 * Never creates users, passwords, or CMS content.
 */

async function seedAuthCatalogue(prisma: PrismaClient): Promise<void> {
  for (const key of ROLE_KEYS) {
    await prisma.role.upsert({
      where: { key: key as RoleKey },
      create: { key: key as RoleKey, name: ROLE_META[key].name },
      update: { name: ROLE_META[key].name },
    });
  }

  for (const key of PERMISSION_KEYS) {
    await prisma.permission.upsert({
      where: { key },
      create: { key, description: PERMISSION_DESCRIPTIONS[key] },
      update: { description: PERMISSION_DESCRIPTIONS[key] },
    });
  }

  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();
  const roleByKey = new Map(roles.map((role) => [role.key, role]));
  const permissionByKey = new Map(permissions.map((permission) => [permission.key, permission]));

  for (const roleKey of ROLE_KEYS) {
    const role = roleByKey.get(roleKey as RoleKey);
    if (!role) throw new Error(`Missing role ${roleKey}`);
    const allowed = new Set(ROLE_PERMISSIONS[roleKey]);

    for (const permissionKey of PERMISSION_KEYS) {
      const permission = permissionByKey.get(permissionKey);
      if (!permission) throw new Error(`Missing permission ${permissionKey}`);
      const assigned = await prisma.rolePermission.findUnique({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      });
      if (allowed.has(permissionKey) && !assigned) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permission.id },
        });
      }
      if (!allowed.has(permissionKey) && assigned) {
        await prisma.rolePermission.delete({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        });
      }
    }
  }
}

async function main() {
  requireLocalDatabaseUrl();
  const prisma = new PrismaClient();
  try {
    await seedAuthCatalogue(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed error';
  console.error(message);
  process.exit(1);
});
