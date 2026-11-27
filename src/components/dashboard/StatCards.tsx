import React from 'react';
import { Briefcase, BarChart3, Clock, GhostIcon, Award } from '../common/Icons';

interface StatCardsProps {
  totalApplications: number;
  activeInPipeline: number;
  responseRate: number;
  processedCount: number;
  interviewRate: number;
  interviewCount: number;
  ghostingRiskCount: number;
  offerCount: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalApplications,
  activeInPipeline,
  responseRate,
  processedCount,
  interviewRate,
  interviewCount,
  ghostingRiskCount,
  offerCount,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Lamaran */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold">Total Lamaran</span>
          <Briefcase className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">
          {totalApplications}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {activeInPipeline} aktif di pipeline
        </div>
      </div>

      {/* 2. Response Rate */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold">Response Rate</span>
          <BarChart3 className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">
          {responseRate}%
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {processedCount} dari {totalApplications} diproses
        </div>
      </div>

      {/* 3. Interview Rate */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold">Interview Rate</span>
          <Clock className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">
          {interviewRate}%
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {interviewCount} masuk wawancara
        </div>
      </div>

      {/* 4. Rawan Ghosting */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold">Rawan Ghosting</span>
          <GhostIcon className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
          {ghostingRiskCount}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          &gt; 14 hari tanpa kabar
        </div>
      </div>

      {/* 5. Offer Diterima */}
      <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold">Offer Diterima</span>
          <Award className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
          {offerCount}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Siap dibandingkan
        </div>
      </div>
    </div>
  );
};
