import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Clock } from '../common/Icons';
import { buttonPrimary, buttonSecondary, kicker } from '../common/ui';

export const INTERVIEW_QUESTIONS = [
  'Ceritakan tentang dirimu dan proyek web terbaik yang pernah kamu kerjakan menggunakan React & TypeScript!',
  'Ceritakan bug tersulit saat mengelola state di proyek React yang pernah kamu buat, dan bagaimana kamu memperbaikinya?',
  'Apa perbedaan utama antara useMemo, useCallback, dan useRef dalam mengoptimalkan performa React?',
  'Bagaimana kamu menangani race condition saat melakukan asynchronous data fetching di React tanpa library eksternal?',
  'Apa strategi yang kamu lakukan jika backend API tiba-tiba lambat atau down saat aplikasi sedang digunakan pengguna?',
];

const DEFAULT_TIME_SECONDS = 120;

export const InterviewPrepSection: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      setIsRunning(false);
    }
  }, [isRunning, timeLeft]);

  const toggleStartPause = () => {
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(DEFAULT_TIME_SECONDS);
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_TIME_SECONDS);
  };

  const handleNextQuestion = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_TIME_SECONDS);
    setCurrentQuestionIndex((prev) => (prev + 1) % INTERVIEW_QUESTIONS.length);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLow = timeLeft <= 20 && timeLeft > 0;
  const isFinished = timeLeft === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-border pb-3">
        <div>
          <p className={kicker}>Latihan</p>
          <h3 className="mt-0.5 font-display text-xl leading-tight text-ink">
            Interview berwaktu
          </h3>
        </div>
        <span className="font-mono text-[11px] text-muted">
          Soal {currentQuestionIndex + 1} / {INTERVIEW_QUESTIONS.length}
        </span>
      </div>

      <p className="border-2 border-border bg-explore px-4 py-4 font-display text-lg leading-relaxed text-explore-ink shadow-[4px_4px_0_var(--app-ink)]">
        &ldquo;{INTERVIEW_QUESTIONS[currentQuestionIndex]}&rdquo;
      </p>

      <div className={`flex flex-col gap-5 border-2 border-border p-4 shadow-[4px_4px_0_var(--app-ink)] sm:flex-row sm:items-end sm:justify-between ${isLow || isFinished ? 'bg-attention' : 'bg-accent'} text-accent-ink`}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-accent-ink">
              <Clock className="h-3 w-3" />
              Sisa waktu
            </span>
            <span className="font-mono text-[11px] text-accent-ink">
              {isRunning ? 'berjalan' : isFinished ? 'habis' : 'jeda'}
            </span>
          </div>

          <div
            role="timer"
            aria-live="off"
            className="mt-1 font-mono text-4xl leading-none text-accent-ink sm:text-5xl"
          >
            {formatTime(timeLeft)}
          </div>

          <div
            className="mt-2 h-1 w-full max-w-xs bg-accent-ink/25"
            role="progressbar"
            aria-label="Sisa waktu latihan"
            aria-valuemin={0}
            aria-valuemax={DEFAULT_TIME_SECONDS}
            aria-valuenow={timeLeft}
          >
            <div
              className="h-1 bg-accent-ink"
              style={{ width: `${(timeLeft / DEFAULT_TIME_SECONDS) * 100}%` }}
            />
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-accent-ink">
            Jawab dengan suara, dua menit per soal. Timer berhenti sendiri saat waktu habis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleStartPause}
            className={`${isRunning ? buttonSecondary : buttonPrimary} min-h-11 border-accent-ink bg-surface px-3 text-xs text-ink hover:bg-highlight`}
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>{isFinished ? 'Ulangi' : 'Mulai'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className={`${buttonSecondary} min-h-11 border-accent-ink bg-surface px-3 text-xs text-ink hover:bg-highlight`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleNextQuestion}
            className={`${buttonSecondary} min-h-11 border-accent-ink bg-surface px-3 text-xs text-ink hover:bg-highlight`}
          >
            <span>Soal berikutnya</span>
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
