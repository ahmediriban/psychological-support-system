import { auth } from "../src/lib/auth/config";
import prisma from "../src/lib/prisma";

async function seedAdminUser() {
  const admin1Email = "kamalabuiriban@gmail.com";
  const admin1Password = "100200400";
  const admin2Email = "ahmed.pod92@gmail.com";
  const admin2Password = "100200400";

  const admin1Exists = await prisma.user.findUnique({
    where: { email: admin1Email },
  });

  const admin2Exists = await prisma.user.findUnique({
    where: { email: admin2Email },
  });

  if (admin1Exists || admin2Exists) {
    console.log("Admin already exists, skipping seed.");
    return;
  }

  const created = await auth.api.createUser({
    body: {
      email: admin1Email,
      name: "كمال أبو عريبان",
      password: admin1Password,
      role: "admin",
      data: {
        role: "ADMIN",
      },
    },
  });

  const created2 = await auth.api.createUser({
    body: {
      email: admin2Email,
      name: "أحمد مزروع",
      password: admin2Password,
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

  await prisma.user.update({
    where: { id: created2.user.id },
    data: {
      emailVerified: true,
    },
  });

  console.log("✓ Admin created:", admin1Email);
  console.log("✓ Admin created:", admin2Email);
}

seedAdminUser();