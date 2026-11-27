import React from 'react';
import { InterviewConflict } from '../../types';
import { AlertTriangle, Calendar } from '../common/Icons';
import { formatDisplayDateTime } from '../../utils/formatters';
import { kicker } from '../common/ui';

interface ConflictBannerProps {
  conflicts: InterviewConflict[];
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <section
      role="alert"
      className="border border-warning/40 border-l-2 border-l-warning bg-surface px-4 py-4 sm:px-5"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={kicker}>Peringatan jadwal</p>
            <span className="border border-warning/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-warning">
              {conflicts.length} bentrokan
            </span>
          </div>
          <h2 className="mt-1 font-display text-lg leading-tight text-ink">
            Ada interview yang waktunya bertabrakan
          </h2>

          <ul className="mt-3 divide-y divide-rule border-t border-rule">
            {conflicts.map((conflict) => (
              <li
                key={`${conflict.app1.id}-${conflict.app2.id}`}
                className="flex flex-col gap-1 py-2.5 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2"
              >
                <span className="font-medium text-ink">{conflict.app1.company}</span>
                <span className="font-mono text-[11px] text-muted">
                  {formatDisplayDateTime(conflict.app1.interviewDateTime)}
                </span>
                <span className="text-muted">dan</span>
                <span className="font-medium text-ink">{conflict.app2.company}</span>
                <span className="font-mono text-[11px] text-muted">
                  {formatDisplayDateTime(conflict.app2.interviewDateTime)}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-danger sm:ml-auto">
                  <Calendar className="h-3 w-3" />
                  selisih {conflict.diffMinutes} menit
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-xs leading-relaxed text-muted">
            Cek lagi undangan interview-mu, lalu minta jadwal ulang ke salah satu recruiter
            sebelum harinya tiba.
          </p>
        </div>
      </div>
    </section>
  );
};
