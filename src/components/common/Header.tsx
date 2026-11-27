import React from 'react';
import { Plus, Sun, Moon, Download, Upload, RotateCcw } from './Icons';

export type ActiveTab = 'jobs' | 'pipeline' | 'comparator';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  applicationsCount: number;
  offersCount: number;
  onOpenAddModal: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  applicationsCount,
  offersCount,
  onOpenAddModal,
  isDarkMode,
  toggleDarkMode,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <span className="text-sm tracking-wider">AM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Aku Mw Magang
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  P11
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                War Room & Matcher Lamaran Kerja Kapten
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Eksplorasi Lowongan
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'pipeline'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Pipeline Lamaran</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'pipeline'
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {applicationsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('comparator')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'comparator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Bandingkan Offer</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'comparator'
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {offersCount}
              </span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Hidden File Input for JSON Import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportData}
              accept=".json"
              className="hidden"
            />

            {/* Bonus: Export & Import Data */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={onExportData}
                title="Ekspor Backup Data JSON"
                aria-label="Ekspor Backup Data JSON"
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleUploadClick}
                title="Impor Backup Data JSON"
                aria-label="Impor Backup Data JSON"
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                title="Reset ke Data Awal Demo"
                aria-label="Reset ke Data Awal Demo"
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Bonus: Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Beralih ke Terang' : 'Beralih ke Gelap'}
              aria-label="Toggle Mode Gelap"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Add Application Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Lamaran</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-1.5 px-3 rounded-md font-medium ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Lowongan
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-1.5 px-3 rounded-md font-medium flex items-center gap-1 ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Pipeline</span>
            <span className="font-bold">({applicationsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('comparator')}
            className={`py-1.5 px-3 rounded-md font-medium flex items-center gap-1 ${
              activeTab === 'comparator'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Bandingkan</span>
            <span className="font-bold">({offersCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
