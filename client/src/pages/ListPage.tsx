import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { listCandidates, deleteCandidateById, updateCandidateStatus } from "../api/client";
import { showToast } from "../components/common/Toast";
import type { ListCandidate, CandidateStatus } from "../types";
import { CANDIDATE_STATUSES, STATUS_COLORS } from "../types";
import { useAuth } from "../context/AuthContext";

export function ListPage() {
  const [candidates, setCandidates] = useState<ListCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  const isAdmin = user?.role?.name === "ADMIN";

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listCandidates();
      setCandidates(response.candidates);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Delete candidate "${name}"? This cannot be undone.`)) {
        return;
      }

      setDeletingId(id);
      try {
        await deleteCandidateById(id);
        setCandidates((prev) => prev.filter((c) => c.id !== id));
        showToast("success", `Candidate "${name}" deleted`);
      } catch (err: any) {
        showToast("error", err.message || "Failed to delete candidate");
      } finally {
        setDeletingId(null);
      }
    },
    []
  );

  const handleStatusChange = useCallback(async (candidateId: string, newStatus: string) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      setCandidates(prev => prev.map(c =>
        c.id === candidateId ? { ...c, status: newStatus as CandidateStatus } : c
      ));
      showToast("success", `Status updated to ${newStatus}`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to update status");
    }
  }, []);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <PageHeader
        icon="👥"
        title={isAdmin ? "All Candidates" : "My Candidates"}
        description={isAdmin
          ? "View all candidate profiles across all team managers."
          : "Candidates you have uploaded and manage."
        }
      />
      <div className="page-body">
        {isLoading ? (
          <LoadingSpinner text="Loading candidate profiles…" />
        ) : candidates.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <h3>No candidates yet</h3>
            <p>Upload some resumes to start building your candidate pool.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Job Title</th>
                  <th>Experience</th>
                  <th>Location</th>
                  <th>Source File</th>
                  <th>Status</th>
                  <th>Pipeline</th>
                  <th>Added On</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => {
                  const name = c.profile?.candidate?.name || "Unknown";
                  return (
                    <tr key={c.id}>
                      <td className="font-medium text-heading">{name}</td>
                      <td>{c.profile?.experience?.[0]?.title || "—"}</td>
                      <td>
                        {c.totalExperienceYears != null ? (
                          <span className="status-badge exp-badge">
                            {c.totalExperienceYears} {c.totalExperienceYears === 1 ? 'year' : 'years'}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>{c.profile?.candidate?.location || "—"}</td>
                      <td>
                        <span
                          className="font-mono text-muted text-sm"
                          title={c.document.originalName}
                        >
                          {c.document.originalName.length > 25
                            ? c.document.originalName.slice(0, 22) + "..."
                            : c.document.originalName}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${c.document.status.toLowerCase()}`}
                        >
                          {c.document.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="search-textarea"
                          style={{
                            padding: "4px 8px",
                            minHeight: "30px",
                            fontSize: "0.75rem",
                            minWidth: "120px",
                            background: STATUS_COLORS[c.status] || "#64748b",
                            color: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            fontWeight: 600,
                          }}
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        >
                          {CANDIDATE_STATUSES.map((s) => (
                            <option key={s} value={s} style={{ background: "#1e293b", color: "#fff" }}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-muted text-sm">
                        {formatDate(c.createdAt)}
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(c.id, name)}
                          disabled={deletingId === c.id}
                          title="Delete candidate"
                        >
                          {deletingId === c.id ? (
                            <span className="spinner-inline" />
                          ) : (
                            "🗑"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
