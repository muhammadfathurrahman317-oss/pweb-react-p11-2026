import React, { useState, useMemo } from 'react';
import { Application } from '../../types';
import { calculateSkillMatch, getMatchBadgeColors } from '../../utils/skillMatch';
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
  const [sortBy, setSortBy] = useState<'newest' | 'interview-nearest' | 'offer-highest'>('newest');

  // Filter & Sort Applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // 1. Text Search (Company & Role)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter((app) => app.status === statusFilter);
    }

    // 3. Ghosting Risk Filter
    if (onlyGhostingRisk) {
      result = result.filter((app) => isGhostingRisk(app));
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return (
          new Date(b.lastUpdatedAt).getTime() -
          new Date(a.lastUpdatedAt).getTime()
        );
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
        const offerA = a.salaryOffer ?? 0;
        const offerB = b.salaryOffer ?? 0;
        return offerB - offerA;
      }
      return 0;
    });

    return result;
  }, [applications, searchQuery, statusFilter, onlyGhostingRisk, sortBy]);

  return (
    <div className="space-y-5">
      {/* Filters & Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lamaran di pipeline..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Semua Status</option>
          <option value="WISHLIST">Wishlist</option>
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
          <option value="GHOSTED">Ghosted</option>
        </select>

        {/* Ghosting Toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 cursor-pointer bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/80">
          <input
            type="checkbox"
            checked={onlyGhostingRisk}
            onChange={(e) => setOnlyGhostingRisk(e.target.checked)}
            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
          />
          <GhostIcon className="w-3.5 h-3.5" />
          <span>Hanya Rawan Ghosting</span>
        </label>

        {/* Sorting Dropdown */}
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value as 'newest' | 'interview-nearest' | 'offer-highest'
            )
          }
          className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Terbaru (Last Updated)</option>
          <option value="interview-nearest">Jadwal Interview Terdekat</option>
          <option value="offer-highest">Offer Tertinggi</option>
        </select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak Ada Lamaran Ditemukan
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {applications.length === 0
              ? 'Belum ada lamaran di pipeline. Simpan lowongan dari katalog atau catat manual!'
              : 'Tidak ada lamaran yang cocok dengan kriteria pencarian dan filter saat ini.'}
          </p>
          {applications.length === 0 && (
            <button
              onClick={onOpenAddModal}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs"
            >
              + Catat Lamaran Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((app) => {
            const match = calculateSkillMatch(kaptenSkills, app.requiredSkills);
            const badgeColors = getMatchBadgeColors(match.score);
            const hasGhostingRisk = isGhostingRisk(app);
            const daysInactive = getDaysSinceUpdate(app.lastUpdatedAt);

            const completedChecklist = app.checklist.filter((i) => i.done).length;
            const totalChecklist = app.checklist.length;
            const checklistPercent =
              totalChecklist > 0
                ? Math.round((completedChecklist / totalChecklist) * 100)
                : 0;

            const canSimulateGhosting =
              app.status === 'APPLIED' || app.status === 'SCREENING';

            return (
              <div
                key={app.id}
                className={`bg-white dark:bg-slate-900 rounded-xl p-5 border flex flex-col justify-between shadow-xs transition-all ${
                  hasGhostingRisk
                    ? 'border-amber-400 dark:border-amber-600 shadow-amber-500/5'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Company, Status, Workmode */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {app.company}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                        {app.role}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        app.status === 'OFFER'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : app.status === 'INTERVIEW'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : app.status === 'GHOSTED'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                  </div>

                  {/* Badges row: Skill Match % & Ghosting Alert */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Skill Match Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badgeColors.dot}`} />
                      <span>{match.score}% Match</span>
                    </span>

                    {/* Work Mode */}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {app.workMode}
                    </span>

                    {/* Ghosting Badge */}
                    {hasGhostingRisk && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                        <GhostIcon className="w-3 h-3" />
                        <span>Rawan Ghosting ({daysInactive}h)</span>
                      </span>
                    )}
                  </div>

                  {/* Details (CV, Interview, Salary) */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    {app.cvVersion && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>CV: {app.cvVersion}</span>
                      </div>
                    )}
                    {app.interviewDateTime && (
                      <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Wawancara: {formatDisplayDateTime(app.interviewDateTime)}</span>
                      </div>
                    )}
                    {app.salaryOffer && app.salaryOffer > 0 && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Tawaran: {formatRupiah(app.salaryOffer)} / bulan</span>
                      </div>
                    )}
                  </div>

                  {/* Checklist Mini Progress */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <ListChecks className="w-3 h-3" />
                        <span>Checklist Persiapan</span>
                      </span>
                      <span className="font-semibold">
                        {completedChecklist}/{totalChecklist} ({checklistPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${checklistPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  {/* Simulasi +15 Hari Button (Testcase 6) */}
                  {canSimulateGhosting ? (
                    <button
                      type="button"
                      onClick={() => onSimulateGhosting(app)}
                      title="Mundurkan tanggal update 15 hari untuk memicu badge Rawan Ghosting"
                      className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 transition-colors"
                    >
                      +15 Hari
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      Update: {formatDisplayDate(app.lastUpdatedAt)}
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDeleteApplication(app)}
                      title="Hapus Lamaran"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetail(app)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white shadow-xs transition-colors"
                    >
                      Detail & Kelola
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
