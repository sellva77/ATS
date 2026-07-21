import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { listCandidates, deleteCandidateById } from "../api/client";
import { showToast } from "../components/common/Toast";
import type { ListCandidate } from "../types";

export function ListPage() {
  const [candidates, setCandidates] = useState<ListCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        title="All Candidates"
        description="View all candidate profiles extracted and indexed by the system"
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
                  <th>Location</th>
                  <th>Source File</th>
                  <th>Status</th>
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
