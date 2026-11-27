import React from 'react';
import { SectionHeading } from '../common/SectionHeading';

interface StatCardsProps {
  totalApplications: number;
  activeInPipeline: number;
  responseRate: number;
  submittedCount: number;
  responseCount: number;
  interviewRate: number;
  interviewCount: number;
  ghostingRiskCount: number;
  offerCount: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalApplications,
  activeInPipeline,
  responseRate,
  submittedCount,
  responseCount,
  interviewRate,
  interviewCount,
  ghostingRiskCount,
  offerCount,
}) => {
  return (
    <section className="space-y-4">
      <SectionHeading
        index="01"
        title="Ringkasan"
        description="Hitungan langsung dari buku lamaranmu. Tidak ada angka yang dikira-kira."
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-rule bg-rule lg:grid-cols-5">
        <div className="col-span-2 bg-surface p-4 sm:p-5 lg:col-span-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
            Total lamaran
          </div>
          <div className="mt-3 font-display text-4xl leading-none text-ink sm:text-5xl">
            {totalApplications}
          </div>
          <div className="mt-3 text-[11px] leading-snug text-muted">
            {activeInPipeline} masih aktif di pipeline
          </div>
        </div>

        <div className="bg-surface p-4 sm:p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
            Response rate
          </div>
          <div className="mt-3 font-mono text-3xl leading-none text-ink">
            {responseRate}%
          </div>
          <div className="mt-3 text-[11px] leading-snug text-muted">
            {responseCount} dari {submittedCount} lamaran dijawab
          </div>
        </div>

        <div className="bg-surface p-4 sm:p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
            Interview rate
          </div>
          <div className="mt-3 font-mono text-3xl leading-none text-ink">
            {interviewRate}%
          </div>
          <div className="mt-3 text-[11px] leading-snug text-muted">
            {interviewCount} dari {submittedCount} masuk wawancara
          </div>
        </div>

        <div className="bg-surface p-4 sm:p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
            Rawan ghosting
          </div>
          <div
            className={`mt-3 font-mono text-3xl leading-none ${
              ghostingRiskCount > 0 ? 'text-warning' : 'text-ink'
            }`}
          >
            {ghostingRiskCount}
          </div>
          <div className="mt-3 text-[11px] leading-snug text-muted">
            Lebih dari 14 hari tanpa kabar
          </div>
        </div>

        <div className="bg-surface p-4 sm:p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
            Offer diterima
          </div>
          <div
            className={`mt-3 font-mono text-3xl leading-none ${
              offerCount > 0 ? 'text-success' : 'text-ink'
            }`}
          >
            {offerCount}
          </div>
          <div className="mt-3 text-[11px] leading-snug text-muted">
            Siap dibandingkan
          </div>
        </div>
      </div>
    </section>
  );
};
