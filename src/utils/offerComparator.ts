import { Application, OfferComparisonResult, WorkMode } from '../types';
import { calculateSkillMatch } from './skillMatch';

export const WORK_MODE_BASE_SCORES: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
};

export const isValidOffer = (app: Application): boolean =>
  app.status === 'OFFER' &&
  typeof app.salaryOffer === 'number' &&
  Number.isFinite(app.salaryOffer) &&
  app.salaryOffer > 0 &&
  Object.hasOwn(WORK_MODE_BASE_SCORES, app.workMode);

export const compareOffers = (
  offerA: Application,
  offerB: Application,
  kaptenSkills: string[]
): {
  resultA: OfferComparisonResult;
  resultB: OfferComparisonResult;
  bestOfferId: string | null;
} | null => {
  if (offerA.id === offerB.id || !isValidOffer(offerA) || !isValidOffer(offerB)) return null;

  const salaryA = offerA.salaryOffer!;
  const salaryB = offerB.salaryOffer!;
  const maxSalary = Math.max(salaryA, salaryB);

  const calculateForOffer = (offer: Application): OfferComparisonResult => {
    const salary = offer.salaryOffer!;
    const salaryScore = (salary / maxSalary) * 50;

    const baseModeScore = WORK_MODE_BASE_SCORES[offer.workMode];
    const workModeScore = baseModeScore * 0.25;

    const match = calculateSkillMatch(kaptenSkills, offer.requiredSkills);
    const skillMatchScore = match.totalRequired > 0
      ? (match.matchedSkills.length / match.totalRequired) * 25
      : 0;

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
