import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const accountantRole = await prisma.role.upsert({
    where: { name: "Accountant" },
    update: {},
    create: { name: "Accountant" },
  });
  await prisma.role.upsert({ where: { name: "Admin" }, update: {}, create: { name: "Admin" } });
  await prisma.role.upsert({ where: { name: "Super Admin" }, update: {}, create: { name: "Super Admin" } });

  const email = "accountant@digitalpathshalanepal.com";
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
    const user = await prisma.user.create({
      data: { fullName: "Default Accountant", email, passwordHash },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: accountantRole.id } });
    console.log(`Seeded: ${email} / ChangeMe123! — change this after first login`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });