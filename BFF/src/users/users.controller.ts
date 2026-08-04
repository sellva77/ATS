import type { Request, Response } from "express";
import * as usersService from "./users.service.js";
import { AuthRequest } from "../types/auth.js";

export async function getUsersHandler(req: Request, res: Response) {
  const user = (req as AuthRequest).user;
  try {
    let users;
    if (user.role.name === "ADMIN") {
      users = await usersService.getUsers(req.query.organizationId as string);
    } else if (user.role.name === "TEAM_MANAGER") {
      if (!user.teamId) {
        return res.status(403).json({ success: false, error: "You are not assigned to a team" });
      }
      users = await usersService.getUsersByTeam(user.teamId);
    } else {
      users = await usersService.getUsers(user.organizationId!);
    }
    return res.status(200).json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
}

export async function inviteUserHandler(req: Request, res: Response) {
  const { email, role, name, phone, organizationId, teamId, password } = req.body;
  const user = (req as AuthRequest).user;

  if (!email || !role) {
    return res.status(400).json({ success: false, error: "Email and role are required" });
  }

  // Determine org
  let targetOrgId = organizationId;
  let targetTeamId = teamId;
  
  if (user.role.name !== "ADMIN") {
    targetOrgId = user.organizationId;
    if (role === "ADMIN") {
      return res.status(403).json({ success: false, error: "Cannot create ADMIN users" });
    }
    
    if (user.role.name === "TEAM_MANAGER") {
      if (role !== "TEAM_MEMBER") {
        return res.status(403).json({ success: false, error: "Team managers can only create team members" });
      }
      if (!user.teamId) {
        return res.status(403).json({ success: false, error: "You are not assigned to a team" });
      }
      targetTeamId = user.teamId;
    }
  }

  try {
    const newUser = await usersService.inviteUser(email, role, name, phone, targetOrgId, targetTeamId, password);
    // TODO: Actually send an invite email here
    return res.status(201).json({ success: true, data: newUser });
  } catch (err: any) {
    return res.status(err.httpStatus ?? 500).json({ success: false, error: err.message || "Failed to invite user" });
  }
}

export async function updateUserRoleHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { role } = req.body;
  const user = (req as AuthRequest).user;

  if (!role) {
    return res.status(400).json({ success: false, error: "Role is required" });
  }

  try {
    const targetUser = await usersService.getUserById(id);
    if (!targetUser) return res.status(404).json({ success: false, error: "User not found" });

    if (user.role.name !== "ADMIN") {
      if (targetUser.organizationId !== user.organizationId) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
      if (role === "ADMIN") {
        return res.status(403).json({ success: false, error: "Cannot promote to ADMIN" });
      }
    }

    const updated = await usersService.updateUserRole(id, role);
    return res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to update role" });
  }
}

export async function updateUserTeamHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { teamId } = req.body;
  const user = (req as AuthRequest).user;

  try {
    const targetUser = await usersService.getUserById(id);
    if (!targetUser) return res.status(404).json({ success: false, error: "User not found" });

    if (user.role.name !== "ADMIN" && targetUser.organizationId !== user.organizationId) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const updated = await usersService.updateUserTeam(id, teamId ?? null);
    return res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to update team" });
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  const { id } = req.params;
  const user = (req as AuthRequest).user;

  try {
    const targetUser = await usersService.getUserById(id);
    if (!targetUser) return res.status(404).json({ success: false, error: "User not found" });

    if (user.role.name !== "ADMIN") {
      if (targetUser.organizationId !== user.organizationId) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
      if (user.role.name === "TEAM_MANAGER") {
        if (targetUser.teamId !== user.teamId || targetUser.roleId === user.roleId) {
          // Cannot delete users outside of team or other team managers
          return res.status(403).json({ success: false, error: "Forbidden: Not in your team" });
        }
      }
    }

    await usersService.deleteUser(id);
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to delete user" });
  }
}
