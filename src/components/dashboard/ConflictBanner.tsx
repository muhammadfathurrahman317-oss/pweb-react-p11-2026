import React from 'react';
import { InterviewConflict } from '../../types';
import { AlertTriangle, Clock } from '../common/Icons';
import { formatDisplayDateTime } from '../../utils/formatters';

interface ConflictBannerProps {
  conflicts: InterviewConflict[];
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs mb-6 text-amber-900 dark:text-amber-200">
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <span>Peringatan Jadwal Interview Bentrok!</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300 font-semibold">
              {conflicts.length} Bentrokan Terdeteksi
            </span>
          </h2>
          <div className="mt-2 space-y-1 text-xs sm:text-sm">
            {conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-1.5 bg-amber-100/70 dark:bg-amber-900/40 px-3 py-1.5 rounded-lg border border-amber-300/50 dark:border-amber-800"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {conflict.app1.company}
                </span>{' '}
                <span>({formatDisplayDateTime(conflict.app1.interviewDateTime)})</span>
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  dan
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {conflict.app2.company}
                </span>{' '}
                <span>({formatDisplayDateTime(conflict.app2.interviewDateTime)})</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold ml-auto">
                  berselisih {conflict.diffMinutes} menit (&lt; 60 menit)!
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300 italic">
            * Cek jadwal wawancara Anda kembali dan segera minta jadwal ulang (reschedule) ke salah satu recruiter.
          </p>
        </div>
      </div>
    </div>
  );
};
