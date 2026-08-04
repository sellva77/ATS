import { useEffect, useState } from "react";
import { toast } from "../components/common/Toast";
import { listUsers, updateUserTeam, deleteUser } from "../api/user";
import { useAuth } from "../context/AuthContext";
import { listTeams, type Team } from "../api/team";
import { type User } from "../types";
import { PageHeader } from "../components/layout/PageHeader";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.name === "ADMIN";

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, teamsData] = await Promise.all([
        listUsers(),
        listTeams(),
      ]);
      setUsers(usersData.filter((u: any) => u.role?.name === (isAdmin ? "TEAM_MANAGER" : "TEAM_MEMBER")));
      setTeams(teamsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = async (userId: string, newTeamId: string) => {
    try {
      await updateUserTeam(userId, newTeamId || null);
      setUsers(users.map(u => u.id === userId ? { ...u, teamId: newTeamId || null } : u));
      toast.success("Team updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update team");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this manager?")) return;

    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast.success("Manager removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove manager");
    }
  };

  return (
    <>
      <PageHeader
        icon={isAdmin ? "🧑‍💼" : "👥"}
        title={isAdmin ? "Team Managers" : "My Team Members"}
        description={isAdmin ? "View and manage team managers. Assign them to teams." : "View and manage members of your team."}
      />
      <div className="page-body">
      <div>
        {loading ? (
          <div className="status-indicator processing">Loading...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">{isAdmin ? "🧑‍💼" : "👥"}</span>
            <h3>No {isAdmin ? "team managers" : "team members"} found</h3>
            <p>Go to <strong>{isAdmin ? "Create User" : "Add Member"}</strong> to add your first {isAdmin ? "team manager" : "team member"}.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Team</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium text-heading">{u.name || "N/A"}</td>
                    <td>{u.email}</td>
                    <td>{(u as any).phone || "-"}</td>
                    <td>
                      <select 
                        className="search-textarea"
                        style={{ padding: "4px 8px", minHeight: "32px" }}
                        value={u.teamId || ""}
                        onChange={(e) => handleTeamChange(u.id, e.target.value)}
                        disabled={!isAdmin}
                      >
                        <option value="">No Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="text-muted text-sm">
                      {new Date((u as any).createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        title={isAdmin ? "Remove manager" : "Remove member"}
                        onClick={() => handleDelete(u.id)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
