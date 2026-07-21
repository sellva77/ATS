import { useState, useCallback } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { ResumeUploader } from "../components/upload/ResumeUploader";
import { UploadResult } from "../components/upload/UploadResult";
import { uploadResume } from "../api/client";
import { showToast } from "../components/common/Toast";
import type { UploadResponse } from "../types";

export function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setIsUploading(true);
    setResult(null);
    setError(null);

    try {
      const response = await uploadResume(file);
      setResult(response);
      showToast(
        "success",
        response.updated
          ? `Candidate ${response.candidateId.slice(0, 8)}… updated with new resume`
          : `Resume processed — candidate ${response.candidateId.slice(0, 8)}… indexed`
      );
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      setError(msg);
      showToast("error", msg);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return (
    <>
      <PageHeader
        icon="📄"
        title="Upload Resume"
        description="Upload a candidate resume to process through the AI pipeline"
      />
      <div className="page-body">
        <ResumeUploader
          onFileSelected={handleFileSelected}
          isUploading={isUploading}
        />

        {isUploading && (
          <div className="upload-progress">
            <div className="upload-progress-bar-track">
              <div className="upload-progress-bar-fill" />
            </div>
            <div className="upload-progress-label">
              <span className="spinner-inline" />
              Processing resume through AI pipeline…
            </div>
          </div>
        )}

        <UploadResult result={result} error={error} onReset={handleReset} />
      </div>
    </>
  );
}
