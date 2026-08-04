import { prisma } from "../config/prisma.js";

import { register } from "../auth/auth.service.js";

export async function getUsers(organizationId?: string) {
  if (organizationId) {
    return await prisma.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true, phone: true, role: true, organizationId: true, teamId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, organizationId: true, teamId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUsersByTeam(teamId: string) {
  return await prisma.user.findMany({
    where: { teamId },
    select: { id: true, name: true, email: true, phone: true, role: true, organizationId: true, teamId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function inviteUser(email: string, role: string, name?: string, phone?: string, organizationId?: string, teamId?: string, password?: string) {
  const userPassword = password || Math.random().toString(36).slice(-8);
  const result = await register(email, userPassword, role, name, organizationId, teamId);
  if (phone) {
    await prisma.user.update({ where: { id: result.user.id }, data: { phone } });
    (result.user as any).phone = phone;
  }
  return result.user; // Return created SafeUser
}

export async function updateUserRole(id: string, roleName: string) {
  const role = await prisma.role.findFirst({
    where: { name: roleName, organizationId: null }
  });
  if (!role) throw new Error(`Role ${roleName} not found`);

  return await prisma.user.update({
    where: { id },
    data: { roleId: role.id },
    select: { id: true, name: true, email: true, phone: true, role: true, organizationId: true, teamId: true },
  });
}

export async function updateUserTeam(id: string, teamId: string | null) {
  return await prisma.user.update({
    where: { id },
    data: { teamId },
    select: { id: true, name: true, email: true, phone: true, role: true, organizationId: true, teamId: true },
  });
}

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}
