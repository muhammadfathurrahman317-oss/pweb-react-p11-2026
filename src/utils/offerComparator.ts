import { Application, OfferComparisonResult, WorkMode } from '../types';
import { calculateSkillMatch } from './skillMatch';

export const WORK_MODE_BASE_SCORES: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
};

export const compareOffers = (
  offerA: Application,
  offerB: Application,
  kaptenSkills: string[]
): {
  resultA: OfferComparisonResult;
  resultB: OfferComparisonResult;
  bestOfferId: string | null;
} => {
  const salaryA = offerA.salaryOffer ?? 0;
  const salaryB = offerB.salaryOffer ?? 0;
  const maxSalary = Math.max(salaryA, salaryB);

  const calculateForOffer = (offer: Application): OfferComparisonResult => {
    const salary = offer.salaryOffer ?? 0;
    // Salary Normalization: 50% max weight
    const salaryScore = maxSalary > 0 ? (salary / maxSalary) * 50 : 0;

    // Work Mode Score: 25% max weight (Base: Remote=100, Hybrid=75, Onsite=50)
    const baseModeScore = WORK_MODE_BASE_SCORES[offer.workMode] ?? 50;
    const workModeScore = baseModeScore * 0.25;

    // Skill Match: 25% max weight
    const match = calculateSkillMatch(kaptenSkills, offer.requiredSkills);
    const skillMatchScore = (match.score / 100) * 25;

    const totalScore = salaryScore + workModeScore + skillMatchScore;

    return {
      offer,
      salaryScore,
      workModeScore,
      skillMatchScore,
      totalScore,
      matchedSkillsCount: match.matchedSkills.length,
      totalSkillsCount: match.totalRequired,
      matchPercentage: match.score,
    };
  };

  const resultA = calculateForOffer(offerA);
  const resultB = calculateForOffer(offerB);

  let bestOfferId: string | null = null;
  if (resultA.totalScore > resultB.totalScore) {
    bestOfferId = offerA.id;
  } else if (resultB.totalScore > resultA.totalScore) {
    bestOfferId = offerB.id;
  }

  return {
    resultA,
    resultB,
    bestOfferId,
  };
};
