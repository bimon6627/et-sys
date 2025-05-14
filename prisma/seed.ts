const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "birk@elev.no";

  // Check if the user already exists
  const existingUser = await prisma.whitelist.findUnique({
    where: { email: adminEmail },
  });

  // Only create the user if they don't already exist
  if (!existingUser) {
    await prisma.whitelist.create({
      data: {
        email: adminEmail,
        role: "ADMIN", // Assign the ADMIN role
      },
    });
    console.log(`Admin with email ${adminEmail} created.`);
  } else {
    console.log(`Admin with email ${adminEmail} already exists.`);
  }

  const existingConfig = await prisma.config.findUnique({
    where: { key: "START_DATE" },
  });

  if (!existingConfig) {
    await prisma.config.create({
      data: {
        key: "START_DATE",
        value: new Date().toISOString(),
      },
    });
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
