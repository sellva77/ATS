import { useState, useRef, useCallback } from "react";

interface ResumeUploaderProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
}

export function ResumeUploader({
  onFileSelected,
  isUploading,
}: ResumeUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") {
        return;
      }
      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const openPicker = useCallback(() => {
    if (!isUploading) inputRef.current?.click();
  }, [isUploading]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div
      id="upload-zone"
      className={`upload-zone${isDragOver ? " drag-over" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={openPicker}
      role="button"
      tabIndex={0}
      aria-label="Upload resume file"
    >
      <span className="upload-zone-icon">📋</span>
      <h3>Drop your resume here</h3>
      <p>or click to browse files</p>
      <p style={{ marginTop: 6, fontSize: "0.75rem" }}>PDF files only</p>

      <button
        className="upload-zone-cta"
        type="button"
        disabled={isUploading}
        onClick={(e) => {
          e.stopPropagation();
          openPicker();
        }}
      >
        📁 Choose File
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onInputChange}
        aria-hidden="true"
      />

      {selectedFile && (
        <div className="upload-file-info">
          <span>📎</span>
          <span>{selectedFile.name}</span>
          <span>·</span>
          <span>{formatSize(selectedFile.size)}</span>
        </div>
      )}
    </div>
  );
}
