import { CandidateRanking, SearchQuery, SemanticCandidate } from "../types/ranking.js";
import { RankingConfig } from "./ranking-config.js";
import { SkillMatcher } from "../matchers/skill-matcher.js";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ScoreCalculator {
  private skillMatcher: SkillMatcher;

  constructor() {
    this.skillMatcher = new SkillMatcher();
  }

  public calculate(
    candidate: SemanticCandidate,
    profile: any,
    query: SearchQuery
  ): CandidateRanking {
    const candidateSkills = profile?.metadata?.skills || profile?.candidate?.skills || candidate.metadata?.skills || [];
    
    // 1. Skill Score using Skill Matcher
    const skillMatch = this.skillMatcher.match(query.skills, candidateSkills);

    // 2. Title and Experience matching (naive implementation for Phase 1)
    const expTitles = profile?.experience?.map((e: any) => e.title).join(" ").toLowerCase() || "";
    const searchableText = [
      profile?.summary,
      candidateSkills.join(" "),
      expTitles,
      profile?.projects?.map((p: any) => p.name).join(" "),
    ].join(" ").toLowerCase();

    let titleMatchBoost = 0;
    let expMatchBoost = 0;
    
    for (const term of query.skills) {
      const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
      if (regex.test(expTitles)) {
        titleMatchBoost += 0.5;
      }
      if (regex.test(searchableText)) {
        expMatchBoost += 0.2;
      }
    }
    
    const titleScore = query.skills.length > 0 ? Math.min(titleMatchBoost / query.skills.length, 1.0) : 0;
    const experienceScore = query.skills.length > 0 ? Math.min(expMatchBoost / query.skills.length, 1.0) : 0;
    const educationScore = 0; // Not implemented in Phase 1

    // 3. Final Score Calculation
    const semanticScore = candidate.score;
    const finalScore = 
      (semanticScore * RankingConfig.semanticWeight) +
      (skillMatch.score * RankingConfig.skillWeight) +
      (titleScore * RankingConfig.titleWeight) +
      (experienceScore * RankingConfig.experienceWeight) +
      (educationScore * RankingConfig.educationWeight);

    // 4. Explanation Builder
    let explanation = "";
    if (finalScore >= 0.8) {
      explanation += `Excellent match.\n`;
    } else if (finalScore >= 0.6) {
      explanation += `Strong match.\n`;
    } else {
      explanation += `Moderate match.\n`;
    }

    if (query.skills.length > 0) {
      explanation += `✔ Matches ${skillMatch.matched.length} of ${query.skills.length} required skills.\n`;
    }
    if (titleScore > 0) {
      explanation += `✔ Has relevant past experience titles.`;
    }

    return {
      candidateId: candidate.candidateId,
      semanticScore,
      skillScore: skillMatch.score,
      titleScore,
      experienceScore,
      educationScore,
      finalScore,
      explanation: explanation.trim(),
      matchedSkills: skillMatch.matched,
      missingSkills: skillMatch.missing,
      metadata: {
        name: profile?.candidate?.name || candidate.metadata?.name,
        role: profile?.experience?.[0]?.title || candidate.metadata?.role,
        location: profile?.candidate?.location || candidate.metadata?.location,
        skills: candidateSkills
      }
    };
  }
}
