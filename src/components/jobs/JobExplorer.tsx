import React, { useState, useEffect, useRef, useMemo, useId } from 'react';
import { Application, JobListing } from '../../types';
import { JobDataSource } from '../../services/jobService';
import { useDebounce } from '../../hooks/useDebounce';
import { useJobs } from '../../hooks/useJobs';
import { calculateSkillMatch } from '../../utils/skillMatch';
import { KaptenSkillProfile } from './KaptenSkillProfile';
import { SectionHeading } from '../common/SectionHeading';
import { MatchStamp } from '../common/StatusStamp';
import {
  Search,
  MapPin,
  Check,
  Plus,
  RefreshCw,
  AlertTriangle,
} from '../common/Icons';
import { buttonPrimary, buttonSecondary, field, select } from '../common/ui';

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
  const { jobs, isLoading, errorMessage, retry } = useJobs(dataSource);

  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebounce<string>(searchInput, 400);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'match-desc' | 'match-asc' | 'company-asc'>(
    'match-desc'
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((job) => {
      if (job.category) set.add(job.category);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const isJobApplied = (job: JobListing): boolean => {
    return applications.some(
      (app) =>
        app.company.trim().toLowerCase() === job.company_name.trim().toLowerCase() &&
        app.role.trim().toLowerCase() === job.title.trim().toLowerCase()
    );
  };

  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs.map((job) => {
      const matchResult = calculateSkillMatch(kaptenSkills, job.tags);
      return { job, matchResult, isApplied: isJobApplied(job) };
    });

    if (debouncedSearch.trim() !== '') {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        ({ job }) =>
          job.title.toLowerCase().includes(query) ||
          job.company_name.toLowerCase().includes(query) ||
          job.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter(({ job }) => job.category === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortBy === 'match-desc') return b.matchResult.score - a.matchResult.score;
      if (sortBy === 'match-asc') return a.matchResult.score - b.matchResult.score;
      if (sortBy === 'company-asc') return a.job.company_name.localeCompare(b.job.company_name);
      return 0;
    });

    return result;
    // isJobApplied reads applications, which is listed in the deps below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, kaptenSkills, debouncedSearch, selectedCategory, sortBy, applications]);

  const sourceLabel = dataSource === 'remotive' ? 'Remotive API' : 'Dataset lokal';

  const resetSearch = () => {
    setSearchInput('');
    setSelectedCategory('ALL');
  };

  return (
    <section className="space-y-5">
      <SectionHeading
        index="02"
        title="Katalog lowongan"
        description="Lowongan yang sedang buka, diurutkan dari yang paling cocok dengan skill-mu."
        action={
          <span className="font-mono text-[11px] text-muted">
            {isLoading ? 'Memuat' : `${filteredAndSortedJobs.length} lowongan`}
          </span>
        }
      />

      <KaptenSkillProfile
        skills={kaptenSkills}
        onAddSkill={onAddKaptenSkill}
        onRemoveSkill={onRemoveKaptenSkill}
        dataSource={dataSource}
        onDataSourceChange={(newSource) => setDataSource(newSource)}
      />

      <div className="border-y-2 border-border py-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
          <div className="relative min-w-0">
            <label htmlFor={searchId} className="sr-only">
              Cari lowongan
            </label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id={searchId}
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari posisi, perusahaan, atau skill"
              className={`${field} min-h-11 pl-9 pr-12`}
            />
            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 border border-rule px-1.5 font-mono text-[10px] text-muted sm:inline-block">
              /
            </span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter kategori lowongan"
            className={`${select} min-h-11`}
          >
            <option value="ALL">Semua kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'match-desc' | 'match-asc' | 'company-asc')
            }
            aria-label="Urutkan lowongan"
            className={`${select} min-h-11`}
          >
            <option value="match-desc">Kecocokan tertinggi</option>
            <option value="match-asc">Kecocokan terendah</option>
            <option value="company-asc">Perusahaan (A-Z)</option>
          </select>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
          <span className="font-mono">
            {sourceLabel} · {filteredAndSortedJobs.length} hasil
          </span>
          <span className="hidden sm:inline">
            Tekan <kbd className="border border-rule px-1 font-mono">/</kbd> untuk mencari
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="border border-rule bg-surface" aria-busy="true">
          <div className="border-b border-rule px-4 py-3 text-xs text-muted">
            Memuat lowongan dari {sourceLabel}...
          </div>
          {[0, 1, 2].map((n) => (
            <div key={n} className="border-b border-rule px-4 py-5 last:border-b-0">
              <div className="h-3 w-28 bg-rule" />
              <div className="mt-3 h-5 w-2/3 bg-rule/70" />
              <div className="mt-3 h-3 w-1/2 bg-rule/60" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div role="alert" className="border border-danger/40 bg-surface px-6 py-10 text-center">
          <AlertTriangle className="mx-auto h-7 w-7 text-danger" />
          <h3 className="mt-4 font-display text-xl text-ink">Lowongan gagal dimuat</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            {errorMessage}
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted">
            Periksa koneksi lalu coba lagi, atau pakai dataset lokal yang ikut tersimpan di
            aplikasi.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={retry} className={buttonPrimary}>
              <RefreshCw className="h-4 w-4" />
              Coba lagi
            </button>
            <button
              type="button"
              onClick={() => setDataSource('local')}
              className={buttonSecondary}
            >
              Pakai dataset lokal
            </button>
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && filteredAndSortedJobs.length === 0 && (
        <div className="border border-rule bg-surface px-6 py-12 text-center">
          <Search className="mx-auto h-8 w-8 text-muted" />
          <h3 className="mt-4 font-display text-xl text-ink">
            {jobs.length === 0 ? 'Belum ada lowongan dari sumber ini' : 'Tidak ada yang cocok'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            {jobs.length === 0
              ? 'Sumber ini tidak mengembalikan lowongan. Coba muat ulang atau pindah ke dataset lokal.'
              : `Tidak ada lowongan yang cocok dengan "${searchInput}" dan filter yang dipilih.`}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {jobs.length === 0 ? (
              <>
                <button type="button" onClick={retry} className={buttonPrimary}>
                  <RefreshCw className="h-4 w-4" />
                  Muat ulang
                </button>
                <button
                  type="button"
                  onClick={() => setDataSource('local')}
                  className={buttonSecondary}
                >
                  Pakai dataset lokal
                </button>
              </>
            ) : (
              <button type="button" onClick={resetSearch} className={buttonSecondary}>
                Bersihkan pencarian
              </button>
            )}
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && filteredAndSortedJobs.length > 0 && (
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1 text-success">
              <Check className="h-3 w-3" />
              cocok dengan skillmu
            </span>
            <span>·</span>
            <span>skill tanpa tanda belum kamu kuasai</span>
          </div>

          <div className="space-y-3 border-t-2 border-border pt-3">
            {filteredAndSortedJobs.map(({ job, matchResult, isApplied }) => (
              <article
                key={job.id}
                className="mr-2 border-2 border-border bg-surface px-4 py-5 transition-[background-color,box-shadow] hover:bg-highlight hover:shadow-[4px_4px_0_var(--app-ink)] sm:px-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-explore font-mono text-[11px] font-bold text-explore-ink">
                      {job.company_name.substring(0, 2).toUpperCase()}
                    </span>

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg leading-tight text-ink sm:text-xl">
                          {job.title}
                        </h3>
                        {isApplied && (
                          <span className="inline-flex items-center gap-1 border border-success/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-success">
                            <Check className="h-3 w-3" />
                            Sudah dilamar
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                        <span className="font-medium text-ink/80">{job.company_name}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.candidate_required_location}
                        </span>
                        <span>{job.category}</span>
                        <span className="font-mono">{job.salary}</span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1 text-[11px]">
                        {matchResult.matchedSkills.map((skill) => (
                          <span key={skill} className="inline-flex items-center gap-0.5 text-success">
                            <Check className="h-3 w-3" />
                            {skill}
                          </span>
                        ))}
                        {matchResult.missingSkills.map((skill) => (
                          <span key={skill} className="text-muted">
                            {skill}
                          </span>
                        ))}
                        {matchResult.totalRequired === 0 && (
                          <span className="text-muted">Tidak ada skill khusus yang diminta.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <MatchStamp score={matchResult.score} />
                    <button
                      type="button"
                      disabled={isApplied}
                      onClick={() => onSaveToWishlist(job)}
                      aria-label={isApplied ? 'Sudah Dilamar' : `Simpan ${job.title} di ${job.company_name} ke wishlist`}
                      className={`${buttonSecondary} min-h-11 px-3 text-xs hover:bg-explore hover:text-explore-ink`}
                    >
                      {isApplied ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {isApplied ? 'Sudah Dilamar' : 'Simpan ke Wishlist'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
