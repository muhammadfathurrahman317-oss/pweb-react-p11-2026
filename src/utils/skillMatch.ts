export interface SkillMatchResult {
  score: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  totalRequired: number;
}

export const calculateSkillMatch = (
  userSkills: string[],
  requiredSkills: string[]
): SkillMatchResult => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
    };
  }

  const normalizedUserSkills = new Set(
    userSkills.map((s) => s.trim().toLowerCase()).filter(Boolean)
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  const seen = new Set<string>();
  for (const reqSkill of requiredSkills) {
    const trimmed = reqSkill.trim();
    const key = trimmed.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (normalizedUserSkills.has(key)) {
      matchedSkills.push(trimmed);
    } else {
      missingSkills.push(trimmed);
    }
  }

  const totalRequired = matchedSkills.length + missingSkills.length;
  const score = totalRequired > 0
    ? Math.round((matchedSkills.length / totalRequired) * 100)
    : 0;

  return {
    score,
    matchedSkills,
    missingSkills,
    totalRequired,
  };
};

export type MatchTier = 'high' | 'medium' | 'low';

export const getMatchTier = (score: number): MatchTier => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};
