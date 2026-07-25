import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_USERS = [
  {
    email: "admin@ats.dev",
    password: "password",
    role: Role.ADMIN,
  },
  {
    email: "recruiter@ats.dev",
    password: "password",
    role: Role.RECRUITER,
  },
  {
    email: "interviewer@ats.dev",
    password: "password",
    role: Role.INTERVIEWER,
  },
];

async function main() {
  console.log("🌱 Seeding users...");

  for (const user of SEED_USERS) {
    const hashed = await bcrypt.hash(user.password, 10);

    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role, password: hashed },
      create: {
        email: user.email,
        password: hashed,
        role: user.role,
      },
    });

    console.log(`  ✓ ${upserted.role.padEnd(12)} → ${upserted.email}`);
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
