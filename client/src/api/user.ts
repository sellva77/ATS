import { request } from "./client";
import { type User } from "../types";

const BASE = "/api/v1/users";

export async function listUsers(organizationId?: string): Promise<User[]> {
  const url = organizationId ? `${BASE}?organizationId=${organizationId}` : BASE;
  const data = await request<{ success: boolean; data: User[] }>(url, "GET");
  return data.data;
}

export async function inviteUser(
  email: string,
  role: string,
  name?: string,
  organizationId?: string,
  teamId?: string,
  password?: string
): Promise<User> {
  const body: any = { email, role };
  if (name) body.name = name;
  if (organizationId) body.organizationId = organizationId;
  if (teamId) body.teamId = teamId;
  if (password) body.password = password;

  const data = await request<{ success: boolean; data: User }>(`${BASE}/invite`, "POST", body);
  return data.data;
}

export async function updateUserRole(id: string, role: string): Promise<User> {
  const data = await request<{ success: boolean; data: User }>(`${BASE}/${id}/role`, "PATCH", { role });
  return data.data;
}

export async function updateUserTeam(id: string, teamId: string | null): Promise<User> {
  const data = await request<{ success: boolean; data: User }>(`${BASE}/${id}/team`, "PATCH", { teamId });
  return data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await request(`${BASE}/${id}`, "DELETE");
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: string;
}): Promise<User> {
  const body: any = {
    email: data.email,
    password: data.password,
    role: data.role || "TEAM_MANAGER",
  };
  if (data.name) body.name = data.name;
  if (data.phone) body.phone = data.phone;

  const res = await request<{ success: boolean; data: User }>(`${BASE}/invite`, "POST", body);
  return res.data;
}
