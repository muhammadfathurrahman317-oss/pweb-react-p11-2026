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

  for (const reqSkill of requiredSkills) {
    const trimmed = reqSkill.trim();
    if (!trimmed) continue;
    if (normalizedUserSkills.has(trimmed.toLowerCase())) {
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

export const getMatchBadgeColors = (
  score: number
): { bg: string; text: string; border: string; dot: string } => {
  const tier = getMatchTier(score);
  switch (tier) {
    case 'high':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'medium':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'low':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
  }
};
