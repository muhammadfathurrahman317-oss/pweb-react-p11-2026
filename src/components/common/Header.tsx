import React from 'react';
import { Plus, Sun, Moon, Download, Upload, RotateCcw } from './Icons';
import { iconButton } from './ui';

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

const TAB_LABELS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'jobs', label: 'Lowongan' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'comparator', label: 'Bandingkan' },
];

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

  const counts: Record<ActiveTab, number | null> = {
    jobs: null,
    pipeline: applicationsCount,
    comparator: offersCount,
  };

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink font-mono text-[11px] font-medium tracking-[0.12em] text-ink">
              AM
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="truncate font-display text-[17px] leading-none text-ink">
                  Aku Mw Magang
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  P11
                </span>
              </div>
              <p className="mt-1 hidden truncate text-[11px] leading-none text-muted sm:block">
                Buku kerja lamaran magang
              </p>
            </div>
          </div>

          <nav className="ml-auto hidden h-16 items-stretch md:flex" aria-label="Navigasi utama">
            {TAB_LABELS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 border-b-2 px-3 text-sm transition-colors ${
                    isActive
                      ? 'border-accent text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count !== null && (
                    <span className="font-mono text-[10px] text-muted">({count})</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportData}
              accept=".json"
              className="sr-only"
              aria-label="Impor backup JSON"
            />

            <div className="hidden items-center divide-x divide-rule border border-rule sm:flex">
              <button
                type="button"
                onClick={onExportData}
                title="Ekspor backup JSON"
                aria-label="Ekspor backup JSON"
                className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:bg-highlight hover:text-ink"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Impor backup JSON"
                aria-label="Impor backup JSON"
                className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:bg-highlight hover:text-ink"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onResetData}
                title="Kembalikan data demo"
                aria-label="Kembalikan data demo"
                className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Mode terang' : 'Mode gelap'}
              aria-label={isDarkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              className={iconButton}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[2px] bg-accent px-3 text-sm font-medium text-accent-ink transition-colors hover:bg-ink"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Catat lamaran</span>
              <span className="sm:hidden">Catat</span>
            </button>
          </div>
        </div>

        <nav
          className="grid grid-cols-3 border-t border-rule md:hidden"
          aria-label="Navigasi utama seluler"
        >
          {TAB_LABELS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-11 items-center justify-center gap-1.5 border-b-2 text-xs transition-colors ${
                  isActive
                    ? 'border-accent text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                <span>{tab.label}</span>
                {count !== null && (
                  <span className="font-mono text-[10px] text-muted">({count})</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
