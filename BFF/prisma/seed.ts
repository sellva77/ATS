import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ─────────────────────────────────────────────────────────────
   Simplified permission set for 2-role MVP
   ───────────────────────────────────────────────────────────── */
const PERMISSIONS = [
  "organization:create", "organization:view", "organization:update", "organization:delete",
  "team:create", "team:view", "team:update", "team:delete",
  "user:create", "user:view", "user:update", "user:delete",
  "candidate:create", "candidate:view", "candidate:update", "candidate:delete", "candidate:assign",
  "resume:upload", "resume:download",
  "search:candidate",
  "dashboard:view",
];

/* ─────────────────────────────────────────────────────────────
   Only two roles: ADMIN and TEAM_MANAGER
   ───────────────────────────────────────────────────────────── */
const ROLES = [
  {
    name: "ADMIN",
    description: "Platform administrator — full access",
    permissions: PERMISSIONS,
  },
  {
    name: "TEAM_MANAGER",
    description: "Team manager — manages own candidates",
    permissions: [
      "candidate:create", "candidate:view", "candidate:update", "candidate:delete",
      "resume:upload", "resume:download",
      "search:candidate",
      "dashboard:view",
      "team:view",
    ],
  },
  {
    name: "TEAM_MEMBER",
    description: "Team member — works under a manager",
    permissions: [
      "candidate:create", "candidate:view", "candidate:update",
      "resume:upload", "resume:download",
      "search:candidate",
      "dashboard:view",
      "team:view",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   Seed users — one ADMIN and one TEAM_MANAGER for dev
   ───────────────────────────────────────────────────────────── */
const SEED_USERS = [
  { email: "admin@ats.dev", password: "password", roleName: "ADMIN", name: "Admin" },
  { email: "manager@ats.dev", password: "password", roleName: "TEAM_MANAGER", name: "John Manager" },
  { email: "member@ats.dev", password: "password", roleName: "TEAM_MEMBER", name: "Jane Member" },
];

async function main() {
  // 1. Seed permissions
  console.log("🌱 Seeding permissions...");
  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: `Permission for ${key}` },
    });
  }

  // 2. Seed roles
  console.log("🌱 Seeding roles...");
  for (const roleDef of ROLES) {
    let role = await prisma.role.findFirst({
      where: { name: roleDef.name, organizationId: null },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleDef.name,
          description: roleDef.description,
        },
      });
    } else {
      // Update description in case it changed
      role = await prisma.role.update({
        where: { id: role.id },
        data: { description: roleDef.description },
      });
    }

    // Assign permissions
    const permissions = await prisma.permission.findMany({
      where: { key: { in: roleDef.permissions } },
    });

    for (const p of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: p.id,
        },
      });
    }

    console.log(`  ✓ Role ${role.name} (${permissions.length} permissions)`);
  }

  // 3. Seed default organization
  console.log("🌱 Seeding default organization...");
  let defaultOrg = await prisma.organization.findFirst({ where: { slug: "platform" } });
  if (!defaultOrg) {
    defaultOrg = await prisma.organization.create({
      data: { name: "Platform", slug: "platform" },
    });
    console.log(`  ✓ Created default org: ${defaultOrg.name} (${defaultOrg.id})`);
  } else {
    console.log(`  ✓ Default org already exists: ${defaultOrg.name}`);
  }

  // 4. Seed users
  console.log("🌱 Seeding users...");
  for (const userDef of SEED_USERS) {
    const role = await prisma.role.findFirst({
      where: { name: userDef.roleName, organizationId: null },
    });

    if (!role) {
      console.error(`Role ${userDef.roleName} not found!`);
      continue;
    }

    const hashed = await bcrypt.hash(userDef.password, 10);

    const upserted = await prisma.user.upsert({
      where: { email: userDef.email },
      update: { roleId: role.id, password: hashed, name: userDef.name, organizationId: defaultOrg.id },
      create: {
        email: userDef.email,
        password: hashed,
        roleId: role.id,
        name: userDef.name,
        organizationId: defaultOrg.id,
      },
    });

    console.log(`  ✓ ${role.name.padEnd(14)} → ${upserted.email}`);
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
