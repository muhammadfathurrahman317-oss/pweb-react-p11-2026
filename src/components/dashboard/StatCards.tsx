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
        description="Angka dari lamaran yang kamu catat."
      />

      <div className="neo-panel mr-2 grid grid-cols-2 border-2 border-border bg-surface lg:grid-cols-5">
        <div className="col-span-2 border-b-2 border-border bg-accent p-4 text-accent-ink sm:p-5 lg:col-span-1 lg:border-b-0 lg:border-r-2">
          <div className="text-[10px] font-bold uppercase text-accent-ink">
            Total lamaran
          </div>
          <div className="mt-3 font-display text-4xl font-extrabold leading-none text-accent-ink sm:text-5xl">
            {totalApplications}
          </div>
          <div className="mt-3 text-[11px] font-medium leading-snug text-accent-ink">
            {activeInPipeline} masih aktif di pipeline
          </div>
        </div>

        <div className="border-b-2 border-r-2 border-border bg-explore p-4 text-explore-ink sm:p-5 lg:border-b-0">
          <div className="text-[10px] font-bold uppercase text-explore-ink">
            Response rate
          </div>
          <div className="mt-3 font-mono text-3xl leading-none text-explore-ink">
            {responseRate}%
          </div>
          <div className="mt-3 text-[11px] leading-snug text-explore-ink">
            {responseCount} dari {submittedCount} lamaran dijawab
          </div>
        </div>

        <div className="border-b-2 border-border bg-surface p-4 sm:p-5 lg:border-b-0 lg:border-r-2">
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

        <div className={`border-b-2 border-r-2 border-border p-4 sm:p-5 lg:border-b-0 ${ghostingRiskCount > 0 ? 'bg-attention text-attention-ink' : 'bg-surface text-ink'}`}>
          <div className={`text-[10px] font-bold uppercase ${ghostingRiskCount > 0 ? 'text-attention-ink' : 'text-muted'}`}>
            Rawan ghosting
          </div>
          <div className="mt-3 font-mono text-3xl leading-none">
            {ghostingRiskCount}
          </div>
          <div className={`mt-3 text-[11px] leading-snug ${ghostingRiskCount > 0 ? 'text-attention-ink' : 'text-muted'}`}>
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
