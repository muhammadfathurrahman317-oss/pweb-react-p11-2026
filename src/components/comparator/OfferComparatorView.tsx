import React, { useState, useMemo } from 'react';
import { Application } from '../../types';
import { compareOffers } from '../../utils/offerComparator';
import { formatRupiah } from '../../utils/formatters';
import { Award, Sparkles } from '../common/Icons';

interface OfferComparatorViewProps {
  applications: Application[];
  kaptenSkills: string[];
}

export const OfferComparatorView: React.FC<OfferComparatorViewProps> = ({
  applications,
  kaptenSkills,
}) => {
  // Only applications with status === 'OFFER'
  const offerApps = useMemo(() => {
    return applications.filter((app) => app.status === 'OFFER');
  }, [applications]);

  // Dropdown selection state: index or ID of offer A and B
  const [selectedOfferAId, setSelectedOfferAId] = useState<string>(
    offerApps[0]?.id || ''
  );
  const [selectedOfferBId, setSelectedOfferBId] = useState<string>(
    offerApps[1]?.id || ''
  );

  // Keep selection synced if offers list changes
  const offerA = offerApps.find((app) => app.id === selectedOfferAId) || offerApps[0];
  const offerB =
    offerApps.find((app) => app.id === selectedOfferBId && app.id !== offerA?.id) ||
    offerApps.find((app) => app.id !== offerA?.id) ||
    offerApps[1];

  // If fewer than 2 offers exist
  if (offerApps.length < 2) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Award className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Belum Cukup Tawaran untuk Dibandingkan
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Kapten membutuhkan minimal <strong>2 lamaran berstatus OFFER</strong> untuk menjalankan komparator objektif.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left text-xs space-y-2">
          <span className="font-bold text-slate-700 dark:text-slate-200">
            Cara Menguji Fitur Ini:
          </span>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li>Buka tab <strong>Pipeline Lamaran</strong>.</li>
            <li>Klik salah satu lamaran (atau buat baru) lalu buka <strong>Detail & Kelola</strong>.</li>
            <li>Pindahkan statusnya secara bertahap menuju <strong>OFFER</strong> (isi nominal gaji &gt; 0).</li>
            <li>Setelah ada minimal 2 OFFER, komparator berbobot otomatis aktif di sini!</li>
          </ol>
        </div>
      </div>
    );
  }

  // Calculate Comparison Results
  const comparison = compareOffers(offerA, offerB, kaptenSkills);
  const { resultA, resultB, bestOfferId } = comparison;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title & Selector Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>Bandingkan Offer Magang</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bobot penilaian: Uang Saku 50% • Mode Kerja 25% • Kecocokan Skill 25%
          </p>
        </div>

        {/* Dropdown selectors */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Offer A:</span>
            <select
              value={offerA.id}
              onChange={(e) => setSelectedOfferAId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {offerApps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company}
                </option>
              ))}
            </select>
          </div>

          <span className="font-bold text-slate-400">vs</span>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Offer B:</span>
            <select
              value={offerB.id}
              onChange={(e) => setSelectedOfferBId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {offerApps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid (exact wireframe style page 9!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Offer A */}
        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border flex flex-col justify-between shadow-sm transition-all ${
            bestOfferId === offerA.id
              ? 'ring-2 ring-blue-500 border-blue-500/50 shadow-blue-500/10'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {offerA.company}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {offerA.role}
                </p>
              </div>
              {bestOfferId === offerA.id && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-xs flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Rekomendasi Terbaik</span>
                </span>
              )}
            </div>

            {/* Criteria Scores Table */}
            <div className="space-y-3.5 text-xs">
              {/* 1. Uang Saku */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Uang Saku / Bulan
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {formatRupiah(offerA.salaryOffer)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {resultA.salaryScore.toFixed(1)} / 50
                  </span>
                </div>
              </div>

              {/* 2. Mode Kerja */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Mode Kerja
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {offerA.workMode} ({offerA.workMode === 'Remote' ? 100 : offerA.workMode === 'Hybrid' ? 75 : 50})
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {resultA.workModeScore.toFixed(1)} / 25
                  </span>
                </div>
              </div>

              {/* 3. Kecocokan Skill */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Kecocokan Skill
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {resultA.matchPercentage}% ({resultA.matchedSkillsCount} dari {resultA.totalSkillsCount} skill)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {resultA.skillMatchScore.toFixed(1)} / 25
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Score Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Skor Berbobot
            </span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {resultA.totalScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Card Offer B */}
        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border flex flex-col justify-between shadow-sm transition-all ${
            bestOfferId === offerB.id
              ? 'ring-2 ring-blue-500 border-blue-500/50 shadow-blue-500/10'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {offerB.company}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {offerB.role}
                </p>
              </div>
              {bestOfferId === offerB.id && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-xs flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Rekomendasi Terbaik</span>
                </span>
              )}
            </div>

            {/* Criteria Scores Table */}
            <div className="space-y-3.5 text-xs">
              {/* 1. Uang Saku */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Uang Saku / Bulan
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {formatRupiah(offerB.salaryOffer)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {resultB.salaryScore.toFixed(1)} / 50
                  </span>
                </div>
              </div>

              {/* 2. Mode Kerja */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Mode Kerja
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {offerB.workMode} ({offerB.workMode === 'Remote' ? 100 : offerB.workMode === 'Hybrid' ? 75 : 50})
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {resultB.workModeScore.toFixed(1)} / 25
                  </span>
                </div>
              </div>

              {/* 3. Kecocokan Skill */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Kecocokan Skill
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {resultB.matchPercentage}% ({resultB.matchedSkillsCount} dari {resultB.totalSkillsCount} skill)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {resultB.skillMatchScore.toFixed(1)} / 25
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Score Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Skor Berbobot
            </span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {resultB.totalScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
