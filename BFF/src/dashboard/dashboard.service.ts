import { prisma } from "../config/prisma.js";

/* ─────────────────────────────────────────────────────────────
   GET /dashboard/summary
   High-level counts for Admin & Team Manager dashboards
   ───────────────────────────────────────────────────────────── */
export async function getSummary(userId: string, roleName: string) {
  if (roleName === "ADMIN") {
    const [totalManagers, totalTeams, totalCandidates, statusCounts] = await Promise.all([
      prisma.user.count({
        where: { role: { name: "TEAM_MANAGER" } },
      }),
      prisma.team.count(),
      prisma.candidateProfile.count(),
      prisma.candidateProfile.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    return {
      totalManagers,
      totalTeams,
      totalCandidates,
      statusBreakdown: statusMap,
    };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { teamId: true } });
  
  let whereClause: any = {};
  if (user?.teamId) {
    const teamUsers = await prisma.user.findMany({ where: { teamId: user.teamId }, select: { id: true } });
    const teamUserIds = teamUsers.map((u) => u.id);
    whereClause = {
      OR: [
        { assignedManagerId: { in: teamUserIds } },
        { createdById: { in: teamUserIds } }
      ]
    };
  } else {
    whereClause = {
      OR: [
        { assignedManagerId: userId },
        { createdById: userId }
      ]
    };
  }

  const [totalCandidates, statusCounts] = await Promise.all([
    prisma.candidateProfile.count({
      where: whereClause,
    }),
    prisma.candidateProfile.groupBy({
      by: ["status"],
      _count: { status: true },
      where: whereClause,
    }),
  ]);

  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s) => {
    statusMap[s.status] = s._count.status;
  });

  return {
    totalCandidates,
    statusBreakdown: statusMap,
  };
}

/* ─────────────────────────────────────────────────────────────
   GET /dashboard/managers  (Admin only)
   List all Team Managers with stats
   ───────────────────────────────────────────────────────────── */
export async function getManagers() {
  const managers = await prisma.user.findMany({
    where: { role: { name: "TEAM_MANAGER" } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      teamId: true,
      team: { select: { name: true } },
      createdAt: true,
      _count: {
        select: {
          managedCandidates: true,
          createdCandidates: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return managers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    teamId: m.teamId,
    teamName: m.team?.name ?? null,
    candidateCount: m._count.managedCandidates,
    uploadedCount: m._count.createdCandidates,
    joinedAt: m.createdAt,
  }));
}

/* ─────────────────────────────────────────────────────────────
   GET /dashboard/teams  (Admin only)
   List all teams with member + candidate counts
   ───────────────────────────────────────────────────────────── */
export async function getTeams() {
  const teams = await prisma.team.findMany({
    include: {
      _count: {
        select: {
          users: true,
        },
      },
      users: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get candidate counts per team by looking at managers' assigned candidates
  const result = await Promise.all(
    teams.map(async (team) => {
      const managerIds = team.users.map((u) => u.id);
      const candidateCount =
        managerIds.length > 0
          ? await prisma.candidateProfile.count({
              where: { assignedManagerId: { in: managerIds } },
            })
          : 0;

      return {
        id: team.id,
        name: team.name,
        organizationId: team.organizationId,
        memberCount: team._count.users,
        candidateCount,
        createdAt: team.createdAt,
      };
    })
  );

  return result;
}

/* ─────────────────────────────────────────────────────────────
   GET /dashboard/activity
   Recent candidate activity (uploads, status changes)
   ───────────────────────────────────────────────────────────── */
export async function getActivity(userId: string, roleName: string, limit = 20) {
  let whereClause: any = {};
  if (roleName !== "ADMIN") {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { teamId: true } });
    if (user?.teamId) {
      const teamUsers = await prisma.user.findMany({ where: { teamId: user.teamId }, select: { id: true } });
      const teamUserIds = teamUsers.map((u) => u.id);
      whereClause = {
        OR: [
          { assignedManagerId: { in: teamUserIds } },
          { createdById: { in: teamUserIds } }
        ]
      };
    } else {
      whereClause = {
        OR: [
          { assignedManagerId: userId },
          { createdById: userId }
        ]
      };
    }
  }

  const recentCandidates = await prisma.candidateProfile.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      document: {
        select: { originalName: true },
      },
      createdBy: {
        select: { name: true, email: true },
      },
      assignedManager: {
        select: { name: true, email: true },
      },
    },
  });

  return recentCandidates.map((c) => ({
    id: c.id,
    candidateName: (c.profile as any)?.candidate?.name ?? "Unknown",
    resumeName: c.document?.originalName ?? null,
    status: c.status,
    createdBy: c.createdBy?.name ?? c.createdBy?.email ?? null,
    assignedManager: c.assignedManager?.name ?? c.assignedManager?.email ?? null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}
