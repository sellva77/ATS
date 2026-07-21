export interface CandidateRanking {
  candidateId: string;
  semanticScore: number;
  skillScore: number;
  titleScore: number;
  experienceScore: number;
  educationScore: number;
  finalScore: number;
  explanation: string;
  matchedSkills: string[];
  missingSkills: string[];
  metadata: any;
}

export interface SearchQuery {
  skills: string[];
  title?: string;
  experience?: number;
  education?: string;
  raw: string;
}

export interface SkillMatchResult {
  matched: string[];
  missing: string[];
  score: number;
}

export interface CandidateSearchProvider {
  semanticSearch(query: string, limit?: number): Promise<SemanticCandidate[]>;
}

export interface SemanticCandidate {
  candidateId: string;
  score: number;
  metadata: any;
}
