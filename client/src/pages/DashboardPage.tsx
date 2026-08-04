import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/layout/PageHeader";
import { toast } from "../components/common/Toast";
import {
  getDashboardSummary,
  getDashboardManagers,
  getDashboardTeams,
  getDashboardActivity,
} from "../api/dashboard";
import type { DashboardSummary, ManagerStats, TeamStats, ActivityItem, CandidateStatus } from "../types";
import { STATUS_COLORS } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "ADMIN";

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [managers, setManagers] = useState<ManagerStats[]>([]);
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const summaryData = await getDashboardSummary();
      setSummary(summaryData);

      const activityData = await getDashboardActivity(10);
      setActivity(activityData);

      if (isAdmin) {
        const [managersData, teamsData] = await Promise.all([
          getDashboardManagers(),
          getDashboardTeams(),
        ]);
        setManagers(managersData);
        setTeams(teamsData);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: CandidateStatus) => {
    return STATUS_COLORS[status] || "#cbd5e1";
  };

  if (loading) {
    return (
      <div className="page-body">
        <div className="status-indicator processing">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        icon="📊"
        title="Dashboard"
        description={isAdmin ? "Platform overview and statistics." : "Your candidate pipeline overview."}
      />
      <div className="page-body">
        {/* Key Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {isAdmin && (
            <>
              <div className="stat-card" style={{ padding: "1.5rem", background: "rgba(30, 41, 59, 0.5)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Total Managers</div>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{summary?.totalManagers || 0}</div>
              </div>
              <div className="stat-card" style={{ padding: "1.5rem", background: "rgba(30, 41, 59, 0.5)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Total Teams</div>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{summary?.totalTeams || 0}</div>
              </div>
            </>
          )}
          <div className="stat-card" style={{ padding: "1.5rem", background: "rgba(30, 41, 59, 0.5)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Total Candidates</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{summary?.totalCandidates || 0}</div>
          </div>
        </div>

        {/* Pipeline Overview */}
        <div style={{ marginBottom: "2rem", background: "rgba(30, 41, 59, 0.5)", padding: "1.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ marginBottom: "1rem" }}>Pipeline Pipeline</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {Object.entries(summary?.statusBreakdown || {}).map(([status, count]) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: getStatusColor(status as CandidateStatus) }} />
                <span>{status}: <strong>{count}</strong></span>
              </div>
            ))}
            {Object.keys(summary?.statusBreakdown || {}).length === 0 && (
              <div className="text-muted">No candidates in pipeline.</div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 1fr" : "1fr", gap: "2rem" }}>
          {/* Recent Activity */}
          <div>
            <h3 style={{ marginBottom: "1rem" }}>Recent Activity</h3>
            {activity.length === 0 ? (
              <div className="empty-state">No recent activity.</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Status</th>
                      <th>Manager</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium text-heading">{item.candidateName}</td>
                        <td>
                          <span style={{ 
                            padding: "4px 8px", 
                            borderRadius: "12px", 
                            fontSize: "0.75rem", 
                            background: getStatusColor(item.status), 
                            color: "#fff" 
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.assignedManager || "-"}</td>
                        <td className="text-muted text-sm">{new Date(item.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Admin specific panels */}
          {isAdmin && (
            <div>
              <h3 style={{ marginBottom: "1rem" }}>Top Managers</h3>
              {managers.length === 0 ? (
                <div className="empty-state">No managers found.</div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Manager</th>
                        <th>Team</th>
                        <th>Candidates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managers.slice(0, 5).map((m) => (
                        <tr key={m.id}>
                          <td className="font-medium text-heading">
                            {m.name || m.email}
                            <div className="text-muted text-sm font-mono">{m.email}</div>
                          </td>
                          <td>{m.teamName || "-"}</td>
                          <td>{m.candidateCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
