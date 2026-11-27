import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Clock } from '../common/Icons';

export const INTERVIEW_QUESTIONS = [
  'Ceritakan tentang dirimu dan proyek web terbaik yang pernah kamu kerjakan menggunakan React & TypeScript!',
  'Ceritakan bug tersulit saat mengelola state di proyek React yang pernah kamu buat, dan bagaimana kamu memperbaikinya?',
  'Apa perbedaan utama antara useMemo, useCallback, dan useRef dalam mengoptimalkan performa React?',
  'Bagaimana kamu menangani race condition saat melakukan asynchronous data fetching di React tanpa library eksternal?',
  'Apa strategi yang kamu lakukan jika backend API tiba-tiba lambat atau down saat aplikasi sedang digunakan pengguna?',
];

const DEFAULT_TIME_SECONDS = 120; // 02:00

export const InterviewPrepSection: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  // Wajib Cleanup: Timer with clearInterval in return to avoid leaks on unmount or re-render!
  useEffect(() => {
    let intervalId: number | undefined = undefined;

    if (isRunning) {
      intervalId = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  const toggleStartPause = () => {
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

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Latihan Interview Berwaktu
          </h4>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
          Soal {currentQuestionIndex + 1} / {INTERVIEW_QUESTIONS.length}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-sm italic font-medium text-slate-800 dark:text-slate-200 min-h-[72px] flex items-center">
        &ldquo;{INTERVIEW_QUESTIONS[currentQuestionIndex]}&rdquo;
      </div>

      {/* Timer & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Countdown Digits */}
        <div className="flex items-baseline gap-2">
          <div
            className={`font-mono text-3xl sm:text-4xl font-extrabold tracking-tight ${
              timeLeft <= 20
                ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isRunning ? 'Berjalan...' : timeLeft === 0 ? 'Waktu Habis!' : 'Jeda'}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleStartPause}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Mulai</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleNextQuestion}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Soal Berikutnya</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
