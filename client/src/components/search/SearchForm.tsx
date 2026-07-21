import { useState, useCallback } from "react";

interface SearchFormProps {
  onSearch: (jobDescription: string, limit: number) => void;
  isSearching: boolean;
}

export function SearchForm({ onSearch, isSearching }: SearchFormProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [limit, setLimit] = useState(10);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (jobDescription.trim() && !isSearching) {
        onSearch(jobDescription.trim(), limit);
      }
    },
    [jobDescription, limit, isSearching, onSearch]
  );

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-textarea-wrapper">
        <textarea
          id="search-jd-input"
          className="search-textarea"
          placeholder="Paste a job description here…&#10;&#10;Example: We are hiring a Flutter Developer to build and maintain cross-platform mobile applications using Flutter and Dart. The candidate should have experience with REST APIs, Firebase, state management, and Android application development."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          aria-label="Job description"
        />
        <span className="search-textarea-count">
          {jobDescription.length} chars
        </span>
      </div>

      <div className="search-controls">
        <div className="search-limit-group">
          <span className="search-limit-label">Results limit</span>
          <input
            id="search-limit-slider"
            type="range"
            className="search-limit-slider"
            min={1}
            max={25}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            aria-label="Results limit"
          />
          <span className="search-limit-value">{limit}</span>
        </div>

        <button
          id="search-submit-btn"
          type="submit"
          className="search-btn"
          disabled={!jobDescription.trim() || isSearching}
        >
          {isSearching ? (
            <>
              <span className="spinner-inline" />
              Searching…
            </>
          ) : (
            <>🔍 Search Candidates</>
          )}
        </button>
      </div>
    </form>
  );
}
