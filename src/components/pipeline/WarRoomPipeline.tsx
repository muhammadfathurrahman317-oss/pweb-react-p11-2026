import React, { useMemo, useState } from 'react';
import { Application } from '../../types';
import { calculateSkillMatch } from '../../utils/skillMatch';
import { isGhostingRisk, getDaysSinceUpdate } from '../../utils/ghosting';
import { STATUS_LABELS } from '../../utils/stateMachine';
import { formatDisplayDate, formatDisplayDateTime, formatRupiah } from '../../utils/formatters';
import {
  Search,
  GhostIcon,
  Briefcase,
  FileText,
  Calendar,
  Trash2,
  ListChecks,
} from '../common/Icons';
import { SectionHeading } from '../common/SectionHeading';
import { StatusStamp, MatchStamp } from '../common/StatusStamp';
import { buttonPrimary, buttonSecondary, field, select } from '../common/ui';

interface WarRoomPipelineProps {
  applications: Application[];
  kaptenSkills: string[];
  onOpenDetail: (app: Application) => void;
  onDeleteApplication: (app: Application) => void;
  onSimulateGhosting: (app: Application) => void;
  onOpenAddModal: () => void;
}

export const WarRoomPipeline: React.FC<WarRoomPipelineProps> = ({
  applications,
  kaptenSkills,
  onOpenDetail,
  onDeleteApplication,
  onSimulateGhosting,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [onlyGhostingRisk, setOnlyGhostingRisk] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'interview-nearest' | 'offer-highest'>(
    'newest'
  );

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (app) => app.company.toLowerCase().includes(q) || app.role.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (onlyGhostingRisk) {
      result = result.filter((app) => isGhostingRisk(app));
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
      }
      if (sortBy === 'interview-nearest') {
        const timeA = a.interviewDateTime
          ? new Date(a.interviewDateTime).getTime()
          : Infinity;
        const timeB = b.interviewDateTime
          ? new Date(b.interviewDateTime).getTime()
          : Infinity;
        return timeA - timeB;
      }
      if (sortBy === 'offer-highest') {
        return (b.salaryOffer ?? 0) - (a.salaryOffer ?? 0);
      }
      return 0;
    });

    return result;
  }, [applications, searchQuery, statusFilter, onlyGhostingRisk, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setOnlyGhostingRisk(false);
    setSortBy('newest');
  };

  return (
    <section className="space-y-5">
      <SectionHeading
        index="02"
        title="Pipeline lamaran"
        description="Satu baris untuk satu lamaran. Status, kesiapan, dan langkah berikutnya terlihat tanpa membuka apa pun."
        action={
          <span className="font-mono text-[11px] text-muted">
            {filteredApplications.length} / {applications.length} entri
          </span>
        }
      />

      <div className="grid gap-3 border-y border-rule py-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_170px_180px_190px]">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari perusahaan atau posisi"
            aria-label="Cari lamaran"
            className={`${field} min-h-11 pl-9`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter status lamaran"
          className={`${select} min-h-11`}
        >
          <option value="ALL">Semua status</option>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>

        <label
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 border px-3 text-xs transition-colors ${
            onlyGhostingRisk
              ? 'border-warning/60 text-warning'
              : 'border-border text-muted hover:text-ink'
          }`}
        >
          <input
            type="checkbox"
            checked={onlyGhostingRisk}
            onChange={(e) => setOnlyGhostingRisk(e.target.checked)}
            className="h-4 w-4 accent-warning"
          />
          <GhostIcon className="h-3.5 w-3.5" />
          <span>Rawan ghosting</span>
        </label>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'newest' | 'interview-nearest' | 'offer-highest')
          }
          aria-label="Urutkan lamaran"
          className={`${select} min-h-11`}
        >
          <option value="newest">Terbaru diperbarui</option>
          <option value="interview-nearest">Interview terdekat</option>
          <option value="offer-highest">Offer tertinggi</option>
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="border border-rule bg-surface px-6 py-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted" />
          <h3 className="mt-4 font-display text-xl text-ink">
            {applications.length === 0 ? 'Buku lamaran masih kosong' : 'Tidak ada entri yang cocok'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            {applications.length === 0
              ? 'Mulai dari satu lamaran. Begitu tercatat, pipeline ini yang mengingatkan langkah berikutnya.'
              : 'Kata kunci atau filter saat ini tidak menemukan lamaran. Coba longgarkan filternya.'}
          </p>
          {applications.length === 0 ? (
            <button
              type="button"
              onClick={onOpenAddModal}
              className={`${buttonPrimary} mt-5`}
            >
              Catat lamaran pertama
            </button>
          ) : (
            <button
              type="button"
              onClick={resetFilters}
              className={`${buttonSecondary} mt-5`}
            >
              Bersihkan filter
            </button>
          )}
        </div>
      ) : (
        <div className="border-t border-ink/25">
          {filteredApplications.map((app, index) => {
            const match = calculateSkillMatch(kaptenSkills, app.requiredSkills);
            const hasGhostingRisk = isGhostingRisk(app);
            const daysInactive = getDaysSinceUpdate(app.lastUpdatedAt);

            const completedChecklist = app.checklist.filter((item) => item.done).length;
            const totalChecklist = app.checklist.length;
            const checklistPercent =
              totalChecklist > 0
                ? Math.round((completedChecklist / totalChecklist) * 100)
                : 0;

            const canSimulateGhosting =
              app.status === 'APPLIED' || app.status === 'SCREENING';

            return (
              <article
                key={app.id}
                className={`border-b border-l-2 border-b-rule py-5 pl-4 pr-1 transition-colors hover:bg-highlight/35 sm:pl-6 ${
                  hasGhostingRisk ? 'border-l-warning' : 'border-l-transparent'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] leading-none text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                        {app.company}
                      </span>
                      <StatusStamp status={app.status} />
                      {hasGhostingRisk && (
                        <span className="inline-flex items-center gap-1 border border-warning/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-warning">
                          <GhostIcon className="h-3 w-3" />
                          Rawan · {daysInactive} hari
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl leading-snug text-ink sm:text-2xl">
                      {app.role}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted">
                      <span>{app.workMode}</span>
                      <MatchStamp score={match.score} />
                      <span className="font-mono">
                        Diperbarui {formatDisplayDate(app.lastUpdatedAt)}
                      </span>
                      {app.interviewDateTime && (
                        <span className="inline-flex items-center gap-1 text-accent">
                          <Calendar className="h-3 w-3" />
                          <span className="font-mono">
                            {formatDisplayDateTime(app.interviewDateTime)}
                          </span>
                        </span>
                      )}
                      {app.salaryOffer && app.salaryOffer > 0 && (
                        <span className="font-mono text-success">
                          {formatRupiah(app.salaryOffer)} / bln
                        </span>
                      )}
                      {app.cvVersion && (
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {app.cvVersion}
                        </span>
                      )}
                    </div>

                    <div className="max-w-sm">
                      <div className="flex items-center justify-between gap-2 text-[10px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <ListChecks className="h-3 w-3" />
                          Persiapan
                        </span>
                        <span className="font-mono">
                          {completedChecklist}/{totalChecklist} · {checklistPercent}%
                        </span>
                      </div>
                      <div
                        className="mt-1 h-0.5 w-full bg-rule"
                        role="progressbar"
                        aria-label={`Progres checklist ${app.role}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={checklistPercent}
                      >
                        <div
                          className={`h-0.5 ${
                            checklistPercent === 100 && totalChecklist > 0
                              ? 'bg-success'
                              : 'bg-accent'
                          }`}
                          style={{ width: `${checklistPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5 lg:justify-end">
                    {canSimulateGhosting && (
                      <button
                        type="button"
                        onClick={() => onSimulateGhosting(app)}
                        title="Mundurkan tanggal update 15 hari untuk menguji peringatan ghosting"
                        className="inline-flex min-h-11 items-center border border-rule px-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-warning transition-colors hover:bg-warning/10"
                      >
                        +15 hari
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteApplication(app)}
                      title="Hapus lamaran"
                      aria-label={`Hapus lamaran ${app.company}`}
                      className="inline-flex h-11 w-11 items-center justify-center text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(app)}
                      className={`${buttonSecondary} min-h-11 px-3 text-xs`}
                    >
                      Buka detail
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
