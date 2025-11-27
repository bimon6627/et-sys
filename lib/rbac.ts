import { prisma } from "@/lib/prisma";

export async function hasPermission(
  userEmail: string,
  requiredPermission: string
): Promise<boolean> {
  if (!userEmail) return false;

  const user = await prisma.whitelist.findUnique({
    where: { email: userEmail },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user || !user.role) return false;

  return user.role.permissions.some((p) => p.slug === requiredPermission);
}
