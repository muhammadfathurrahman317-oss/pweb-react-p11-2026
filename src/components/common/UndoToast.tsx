import React from 'react';
import { Application } from '../../types';
import { Undo, X } from './Icons';
import { buttonPrimary } from './ui';

interface UndoToastProps {
  deletedApp: Application | null;
  onUndo: () => void;
  onDismiss: () => void;
  secondsRemaining: number;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  deletedApp,
  onUndo,
  onDismiss,
  secondsRemaining,
}) => {
  if (!deletedApp) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-[380px]"
    >
      <div className="border-2 border-border bg-surface p-3 shadow-[4px_4px_0_var(--app-ink)]">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              Lamaran dihapus
            </p>
            <p className="mt-1 text-sm leading-snug text-ink">
              <span className="font-medium">{deletedApp.company}</span>
              <span className="text-muted"> · {deletedApp.role}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Tutup notifikasi"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-muted transition-colors hover:bg-highlight hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-muted">
            Urungkan dalam {secondsRemaining} detik
          </span>
          <button type="button" onClick={onUndo} className={`${buttonPrimary} px-3 py-1.5 text-xs`}>
            <Undo className="h-3.5 w-3.5" />
            <span>Urungkan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
