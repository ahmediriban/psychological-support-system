import { auth } from "../src/lib/auth/config";
import prisma from "../src/lib/prisma";

async function seedAdminUser() {
  const adminEmail = "test@admin.com";
  const adminPassword = "Admin1234";

  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (adminExists) {
    console.log("Admin already exists, skipping seed.");
    return;
  }

  const created = await auth.api.createUser({
    body: {
      email: adminEmail,
      name: "Admin",
      password: adminPassword,
      role: "admin",
      data: {
        role: "ADMIN",
      },
    },
  });

  await prisma.user.update({
    where: { id: created.user.id },
    data: {
      emailVerified: true,
    },
  });

  console.log("✓ Admin created:", adminEmail);
}

seedAdminUser();