import type { UploadResponse } from "../../types";

interface UploadResultProps {
  result: UploadResponse | null;
  error: string | null;
  onReset: () => void;
}

export function UploadResult({ result, error, onReset }: UploadResultProps) {
  if (!result && !error) return null;

  if (error) {
    return (
      <div className="upload-result error">
        <div className="upload-result-header">
          <span className="upload-result-icon">❌</span>
          <h3>Pipeline Failed</h3>
        </div>
        <p style={{ fontSize: "0.88rem", color: "var(--error)", marginBottom: 16 }}>
          {error}
        </p>
        <div className="upload-result-actions">
          <button className="btn-secondary" onClick={onReset}>
            ↩ Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="upload-result">
      <div className="upload-result-header">
        <span className="upload-result-icon">{result.updated ? "🔄" : "✅"}</span>
        <h3>{result.updated ? "Existing Candidate Updated" : "Resume Processed Successfully"}</h3>
      </div>
      <div className="upload-result-data">
        <div className="upload-result-field">
          <label>Document ID</label>
          <span>{result.documentId}</span>
        </div>
        <div className="upload-result-field">
          <label>Candidate ID</label>
          <span>{result.candidateId}</span>
        </div>
        <div className="upload-result-field">
          <label>Status</label>
          <span>{result.status}</span>
        </div>
        <div className="upload-result-field">
          <label>Indexed</label>
          <span>{result.indexed ? "Yes — searchable" : "No"}</span>
        </div>
      </div>
      <div className="upload-result-actions">
        <button className="btn-secondary" onClick={onReset}>
          📄 Upload Another
        </button>
      </div>
    </div>
  );
}
