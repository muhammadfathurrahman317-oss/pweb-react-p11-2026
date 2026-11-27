import React from 'react';
import { InterviewConflict } from '../../types';
import { AlertTriangle, Calendar } from '../common/Icons';
import { formatDisplayDateTime } from '../../utils/formatters';

interface ConflictBannerProps {
  conflicts: InterviewConflict[];
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <section
      role="alert"
      className="neo-panel mr-2 border-2 border-border bg-attention px-4 py-4 text-attention-ink sm:px-5"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-attention-ink" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[10px] font-semibold uppercase text-attention-ink">Peringatan jadwal</p>
            <span className="border border-attention-ink px-1.5 py-0.5 font-mono text-[10px] uppercase text-attention-ink">
              {conflicts.length} bentrokan
            </span>
          </div>
          <h2 className="mt-1 font-display text-lg leading-tight text-attention-ink">
            Ada interview yang waktunya bertabrakan
          </h2>

          <ul className="mt-3 divide-y divide-attention-ink/40 border-t border-attention-ink/40">
            {conflicts.map((conflict) => (
              <li
                key={`${conflict.app1.id}-${conflict.app2.id}`}
                className="flex flex-col gap-1 py-2.5 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2"
              >
                <span className="font-medium text-attention-ink">{conflict.app1.company}</span>
                <span className="font-mono text-[11px] text-attention-ink">
                  {formatDisplayDateTime(conflict.app1.interviewDateTime)}
                </span>
                <span className="text-attention-ink">dan</span>
                <span className="font-medium text-attention-ink">{conflict.app2.company}</span>
                <span className="font-mono text-[11px] text-attention-ink">
                  {formatDisplayDateTime(conflict.app2.interviewDateTime)}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-attention-ink sm:ml-auto">
                  <Calendar className="h-3 w-3" />
                  selisih {conflict.diffMinutes} menit
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-xs leading-relaxed text-attention-ink">
            Cek lagi undangan interview-mu, lalu minta jadwal ulang ke salah satu recruiter
            sebelum harinya tiba.
          </p>
        </div>
      </div>
    </section>
  );
};
