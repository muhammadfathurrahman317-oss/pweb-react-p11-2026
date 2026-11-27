import React from 'react';
import { ApplicationStatus } from '../../types';
import { STATUS_LABELS } from '../../utils/stateMachine';
import { getMatchTier } from '../../utils/skillMatch';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  WISHLIST: 'border-rule text-muted',
  APPLIED: 'border-ink/50 text-ink',
  SCREENING: 'border-accent/60 text-accent',
  INTERVIEW: 'border-accent/70 bg-highlight text-accent',
  OFFER: 'border-success/60 text-success',
  REJECTED: 'border-danger/50 text-danger',
  GHOSTED: 'border-warning/60 text-warning',
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
  high: 'border-success/60 text-success',
  medium: 'border-warning/60 text-warning',
  low: 'border-danger/50 text-danger',
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
