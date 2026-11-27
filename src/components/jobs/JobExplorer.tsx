import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Application, JobListing } from '../../types';
import { fetchJobs, JobDataSource } from '../../services/jobService';
import { useDebounce } from '../../hooks/useDebounce';
import { calculateSkillMatch, getMatchBadgeColors } from '../../utils/skillMatch';
import { KaptenSkillProfile } from './KaptenSkillProfile';
import {
  Search,
  Building2,
  MapPin,
  DollarSign,
  Check,
  Plus,
  RefreshCw,
  AlertTriangle,
} from '../common/Icons';

interface JobExplorerProps {
  kaptenSkills: string[];
  onAddKaptenSkill: (skill: string) => void;
  onRemoveKaptenSkill: (skill: string) => void;
  applications: Application[];
  onSaveToWishlist: (job: JobListing) => void;
}

export const JobExplorer: React.FC<JobExplorerProps> = ({
  kaptenSkills,
  onAddKaptenSkill,
  onRemoveKaptenSkill,
  applications,
  onSaveToWishlist,
}) => {
  const [dataSource, setDataSource] = useState<JobDataSource>('remotive');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search, filter, and sort state
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebounce<string>(searchInput, 400);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'match-desc' | 'match-asc' | 'company-asc'>('match-desc');

  // Ref for search input (Bonus: keyboard shortcut '/')
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Press '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch jobs with useEffect + AbortController
  const loadJobs = async (source: JobDataSource) => {
    setIsLoading(true);
    setErrorMessage(null);
    const controller = new AbortController();

    try {
      const data = await fetchJobs(source, controller.signal);
      setJobs(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memuat lowongan.'
      );
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  };

  useEffect(() => {
    const abortPromise = loadJobs(dataSource);
    return () => {
      abortPromise.then((abort) => abort && abort());
    };
  }, [dataSource]);

  // Extract unique categories from loaded jobs
  const categories = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((job) => {
      if (job.category) set.add(job.category);
    });
    return Array.from(set).sort();
  }, [jobs]);

  // Helper to check if a job is already in applications (case-insensitive company + role)
  const isJobApplied = (job: JobListing): boolean => {
    return applications.some(
      (app) =>
        app.company.trim().toLowerCase() === job.company_name.trim().toLowerCase() &&
        app.role.trim().toLowerCase() === job.title.trim().toLowerCase()
    );
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs.map((job) => {
      const matchResult = calculateSkillMatch(kaptenSkills, job.tags);
      return {
        job,
        matchResult,
        isApplied: isJobApplied(job),
      };
    });

    // 1. Text Search Filter (debounced, 400ms)
    if (debouncedSearch.trim() !== '') {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        ({ job }) =>
          job.title.toLowerCase().includes(query) ||
          job.company_name.toLowerCase().includes(query) ||
          job.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(({ job }) => job.category === selectedCategory);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'match-desc') {
        return b.matchResult.score - a.matchResult.score;
      }
      if (sortBy === 'match-asc') {
        return a.matchResult.score - b.matchResult.score;
      }
      if (sortBy === 'company-asc') {
        return a.job.company_name.localeCompare(b.job.company_name);
      }
      return 0;
    });

    return result;
  }, [jobs, kaptenSkills, debouncedSearch, selectedCategory, sortBy, applications]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Column: Kapten's Skill Profile */}
      <div className="lg:col-span-1">
        <KaptenSkillProfile
          skills={kaptenSkills}
          onAddSkill={onAddKaptenSkill}
          onRemoveSkill={onRemoveKaptenSkill}
          dataSource={dataSource}
          onDataSourceChange={(newSource) => setDataSource(newSource)}
        />
      </div>

      {/* Right Column: Search & Job Listings */}
      <div className="lg:col-span-3 space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
          {/* Search Input with Debounce */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari posisi atau perusahaan... (tekan / untuk cari)"
              className="w-full pl-9 pr-12 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
              /
            </span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sorting Dropdown */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'match-desc' | 'match-asc' | 'company-asc'
              )
            }
            className="w-full sm:w-44 px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="match-desc">Match Tertinggi</option>
            <option value="match-asc">Match Terendah</option>
            <option value="company-asc">Perusahaan (A-Z)</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3"
              >
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry & Fallback Button (Testcase 1) */}
        {!isLoading && errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-800 dark:text-rose-200">
                Gagal Mengambil Data Lowongan
              </h3>
              <p className="text-sm text-rose-600 dark:text-rose-300 mt-1 max-w-md mx-auto">
                {errorMessage}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => loadJobs(dataSource)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-xs transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
              <button
                onClick={() => setDataSource('local')}
                className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Gunakan Fallback Lokal (magang-fallback.json)
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && filteredAndSortedJobs.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Lowongan Ditemukan
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Tidak ada lowongan yang sesuai dengan kata kunci &quot;{searchInput}&quot; atau filter yang dipilih.
            </p>
            <button
              onClick={() => {
                setSearchInput('');
                setSelectedCategory('ALL');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}

        {/* Job Cards Grid */}
        {!isLoading && !errorMessage && filteredAndSortedJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAndSortedJobs.map(({ job, matchResult, isApplied }) => {
              const badgeColors = getMatchBadgeColors(matchResult.score);

              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    {/* Header: Company & Match Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                          {job.company_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {job.company_name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{job.candidate_required_location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeColors.dot}`} />
                        <span>{matchResult.score}% Match</span>
                      </div>
                    </div>

                    {/* Job Title */}
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{job.category}</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <DollarSign className="w-3 h-3" />
                          <span>{job.salary}</span>
                        </span>
                      </div>
                    </div>

                    {/* Skill Breakdown (Matched vs Missing) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Required Skills</span>
                        <span className="text-slate-400">
                          {matchResult.matchedSkills.length}/{matchResult.totalRequired} Cocok
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {/* Matched skills (Green) */}
                        {matchResult.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>{skill}</span>
                          </span>
                        ))}
                        {/* Missing skills (Gray) */}
                        {matchResult.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          >
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      ID: #{job.id}
                    </span>
                    <button
                      type="button"
                      disabled={isApplied}
                      onClick={() => onSaveToWishlist(job)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isApplied
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Sudah Dilamar</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Simpan ke Wishlist</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
