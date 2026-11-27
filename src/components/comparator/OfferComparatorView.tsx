import React, { useId, useMemo, useState } from 'react';
import { Application, OfferComparisonResult } from '../../types';
import { compareOffers, isValidOffer, WORK_MODE_BASE_SCORES } from '../../utils/offerComparator';
import { formatRupiah } from '../../utils/formatters';
import { SectionHeading } from '../common/SectionHeading';
import {
  buttonPrimary,
  buttonSecondary,
  fieldLabel,
  kicker,
  select,
} from '../common/ui';

interface OfferComparatorViewProps {
  applications: Application[];
  kaptenSkills: string[];
  onGoToPipeline: () => void;
}

interface OfferSheetProps {
  offer: Application;
  result: OfferComparisonResult;
  side: 'A' | 'B';
  isRecommended: boolean;
}

const OfferSheet: React.FC<OfferSheetProps> = ({ offer, result, side, isRecommended }) => {
  return (
    <div className={`neo-panel mr-2 flex min-w-0 flex-col border-2 border-border bg-surface ${isRecommended ? 'border-b-[5px]' : ''}`}>
      <div className={`h-1.5 w-full ${isRecommended ? 'bg-explore' : 'bg-ink/20'}`} />

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-rule pb-4">
          <div className="min-w-0">
            <p className={kicker}>Offer {side}</p>
            <h3 className="mt-1 break-words font-display text-2xl leading-tight text-ink">
              {offer.company}
            </h3>
            <p className="mt-0.5 text-xs leading-snug text-muted">{offer.role}</p>
          </div>
          {isRecommended && (
            <span className="-rotate-2 border-2 border-border bg-explore px-2 py-1 font-mono text-[10px] font-bold uppercase text-explore-ink">
              Rekomendasi
            </span>
          )}
        </div>

        <dl className="divide-y divide-rule text-xs">
          <div className="flex items-start justify-between gap-4 py-3">
            <dt className="text-muted">Uang saku / bulan</dt>
            <dd className="text-right">
              <span className="block font-mono text-sm text-ink">
                {formatRupiah(offer.salaryOffer)}
              </span>
            </dd>
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <dt className="text-muted">Mode kerja</dt>
            <dd className="text-right">
              <span className="block text-sm text-ink">
                {offer.workMode}
                <span className="ml-1 font-mono text-[10px] text-muted">
                  ({WORK_MODE_BASE_SCORES[offer.workMode]})
                </span>
              </span>
            </dd>
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <dt className="text-muted">Kecocokan skill</dt>
            <dd className="text-right">
              <span className="block text-sm text-ink">
                {result.matchPercentage}%
                <span className="ml-1 font-mono text-[10px] text-muted">
                  ({result.matchedSkillsCount}/{result.totalSkillsCount})
                </span>
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-auto border-t border-ink/20 pt-4">
          <div className="flex items-end justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
              Total skor
            </span>
            <span
              className="font-display text-4xl font-extrabold leading-none text-ink"
            >
              {result.totalScore.toFixed(1)}
              <span className="ml-1 font-mono text-xs text-muted">/100</span>
            </span>
          </div>
          <div
            className="mt-2 h-0.5 w-full bg-rule"
            role="progressbar"
            aria-label={`Total skor ${offer.company}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(result.totalScore)}
          >
            <div
              className={`h-0.5 ${isRecommended ? 'bg-explore' : 'bg-ink/40'}`}
              style={{ width: `${Math.min(100, Math.max(0, result.totalScore))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const OfferComparatorView: React.FC<OfferComparatorViewProps> = ({
  applications,
  kaptenSkills,
  onGoToPipeline,
}) => {
  const offerApps = useMemo(
    () => applications.filter(isValidOffer),
    [applications]
  );

  const [selectedOfferAId, setSelectedOfferAId] = useState<string>(offerApps[0]?.id || '');
  const [selectedOfferBId, setSelectedOfferBId] = useState<string>(offerApps[1]?.id || '');

  const offerA = offerApps.find((app) => app.id === selectedOfferAId) || offerApps[0];
  const offerB =
    offerApps.find((app) => app.id === selectedOfferBId && app.id !== offerA?.id) ||
    offerApps.find((app) => app.id !== offerA?.id) ||
    offerApps[1];

  const selectIdA = useId();
  const selectIdB = useId();

  if (offerApps.length < 2 || new Set(offerApps.map((app) => app.id)).size < 2) {
    return (
      <section className="space-y-5">
        <SectionHeading
          index="02"
          title="Bandingkan offer"
          description="Bobot penilaian: uang saku 50%, mode kerja 25%, kecocokan skill 25%."
        />

        <div className="border-2 border-border bg-surface px-6 py-8 sm:px-8">
          <div className="max-w-xl">
            <p className={kicker}>Belum bisa dibandingkan</p>
            <h3 className="mt-1 font-display text-2xl leading-tight text-ink">
              Butuh dua offer untuk membandingkan
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Komparator ini memakai bobot yang sama untuk setiap tawaran, jadi hasilnya baru
              berarti kalau ada dua offer yang bisa diadu.
            </p>

            <ol className="mt-5 divide-y divide-rule border-y border-rule">
              <li className="flex gap-3 py-2.5 text-sm leading-relaxed">
                <span className="font-mono text-[11px] text-muted">01</span>
                <span>Buka pipeline dan pilih lamaran yang sudah sampai tahap offer.</span>
              </li>
              <li className="flex gap-3 py-2.5 text-sm leading-relaxed">
                <span className="font-mono text-[11px] text-muted">02</span>
                <span>Isi nominal uang saku dan mode kerjanya saat memindahkan status.</span>
              </li>
              <li className="flex gap-3 py-2.5 text-sm leading-relaxed">
                <span className="font-mono text-[11px] text-muted">03</span>
                <span>Ulangi untuk offer kedua, lalu kembali ke halaman ini.</span>
              </li>
            </ol>

            <button type="button" onClick={onGoToPipeline} className={`${buttonPrimary} mt-5`}>
              Buka pipeline
            </button>
          </div>
        </div>
      </section>
    );
  }

  const comparison = compareOffers(offerA, offerB, kaptenSkills);
  if (!comparison) return null;
  const { resultA, resultB, bestOfferId } = comparison;

  const swapOffers = () => {
    setSelectedOfferAId(offerB.id);
    setSelectedOfferBId(offerA.id);
  };

  return (
    <section className="space-y-5">
      <SectionHeading
        index="02"
        title="Bandingkan offer"
        description="Bobot penilaian: uang saku 50%, mode kerja 25%, kecocokan skill 25%."
      />

      <div className="flex flex-wrap items-end gap-3 border-y-2 border-border py-4">
        <div className="min-w-[160px] flex-1 sm:flex-none">
          <label htmlFor={selectIdA} className={fieldLabel}>
            Offer A
          </label>
          <select
            id={selectIdA}
            value={offerA.id}
            onChange={(e) => setSelectedOfferAId(e.target.value)}
            className={`${select} min-h-11`}
          >
            {offerApps.map((app) => (
              <option key={app.id} value={app.id} disabled={app.id === offerB.id}>
                {app.company}
              </option>
            ))}
          </select>
        </div>

        <span className="pb-2.5 font-display text-lg text-muted">vs</span>

        <div className="min-w-[160px] flex-1 sm:flex-none">
          <label htmlFor={selectIdB} className={fieldLabel}>
            Offer B
          </label>
          <select
            id={selectIdB}
            value={offerB.id}
            onChange={(e) => setSelectedOfferBId(e.target.value)}
            className={`${select} min-h-11`}
          >
            {offerApps.map((app) => (
              <option key={app.id} value={app.id} disabled={app.id === offerA.id}>
                {app.company}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={swapOffers} className={`${buttonSecondary} min-h-11`}>
          Tukar posisi
        </button>
      </div>

      <div className="grid grid-cols-1 gap-7 pb-2 md:grid-cols-2">
        <OfferSheet
          offer={offerA}
          result={resultA}
          side="A"
          isRecommended={bestOfferId === offerA.id}
        />
        <OfferSheet
          offer={offerB}
          result={resultB}
          side="B"
          isRecommended={bestOfferId === offerB.id}
        />
      </div>

      {bestOfferId === null && (
        <p className="border border-rule bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
          Skor kedua offer sama. Tidak ada rekomendasi otomatis; pilih berdasarkan hal yang
          tidak masuk ke perhitungan, seperti tim, lokasi, atau jalur karier.
        </p>
      )}
    </section>
  );
};
