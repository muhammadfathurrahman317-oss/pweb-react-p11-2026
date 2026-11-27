import React from 'react';
import { ApplicationStatus } from '../../types';
import { STATUS_LABELS } from '../../utils/stateMachine';
import { getMatchTier } from '../../utils/skillMatch';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  WISHLIST: 'border-border text-muted',
  APPLIED: 'border-border text-ink',
  SCREENING: 'border-border text-ink',
  INTERVIEW: 'border-border bg-highlight text-ink',
  OFFER: 'border-success text-success',
  REJECTED: 'border-danger text-danger',
  GHOSTED: 'border-warning text-warning',
};

interface StatusStampProps {
  status: ApplicationStatus;
  className?: string;
}

/** A recorded state, drawn as a stamp rather than a pastel pill. */
export const StatusStamp: React.FC<StatusStampProps> = ({ status, className = '' }) => (
  <span
    className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${STATUS_STYLES[status]} ${className}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

const MATCH_STYLES = {
  high: 'border-success text-success',
  medium: 'border-warning text-warning',
  low: 'border-danger text-danger',
} as const;

interface MatchStampProps {
  score: number;
  className?: string;
}

export const MatchStamp: React.FC<MatchStampProps> = ({ score, className = '' }) => {
  const tier = getMatchTier(score);
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] ${MATCH_STYLES[tier]} ${className}`}
    >
      {score}% cocok
    </span>
  );
};
