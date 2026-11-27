import React from 'react';
import { Application } from '../../types';
import { Undo, X } from './Icons';

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
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl px-4 py-3 border border-slate-700 flex items-center gap-4 text-xs sm:text-sm">
        <div>
          <span>Lamaran </span>
          <span className="font-bold text-blue-400">{deletedApp.company}</span>
          <span> ({deletedApp.role}) telah dihapus.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUndo}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-white flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Undo className="w-3.5 h-3.5" />
            <span>Undo ({secondsRemaining}s)</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
