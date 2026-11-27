import React, { useId, useState } from 'react';
import { JobDataSource } from '../../services/jobService';
import { Plus, X } from '../common/Icons';
import { buttonPrimary, field, fieldLabel } from '../common/ui';

interface KaptenSkillProfileProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  dataSource: JobDataSource;
  onDataSourceChange: (source: JobDataSource) => void;
}

export const KaptenSkillProfile: React.FC<KaptenSkillProfileProps> = ({
  skills,
  onAddSkill,
  onRemoveSkill,
  dataSource,
  onDataSourceChange,
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const bodyId = useId();
  const inputId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();

    if (!trimmed) {
      setErrorMessage('Ketik nama skill terlebih dahulu.');
      return;
    }

    const isDuplicate = skills.some((skill) => skill.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      setErrorMessage(`Skill "${trimmed}" sudah ada di profil.`);
      return;
    }

    onAddSkill(trimmed);
    setNewSkill('');
    setErrorMessage(null);
  };

  return (
    <section className="neo-panel mr-2 overflow-hidden border-2 border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b-2 border-border bg-explore px-4 py-3 text-explore-ink">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase text-explore-ink">Indeks skill</p>
          <h3 className="mt-0.5 font-display text-lg leading-tight text-explore-ink">Profil skill</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-explore-ink">{skills.length} skill</span>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls={bodyId}
            className="min-h-11 border-2 border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:bg-highlight lg:hidden"
          >
            {isExpanded ? 'Tutup' : 'Kelola'}
          </button>
        </div>
      </div>

      <div
        id={bodyId}
        className={`${isExpanded ? 'block' : 'hidden'} px-4 py-4 lg:block`}
      >
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <p className="text-xs leading-relaxed text-muted">
              Skill di sini dipakai untuk menghitung persentase kecocokan setiap lowongan.
            </p>

            {skills.length > 0 ? (
              <div className="mt-3 grid gap-x-6 sm:grid-cols-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex min-h-11 items-center justify-between gap-2 border-b border-rule"
                  >
                    <span className="truncate text-sm text-ink">{skill}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveSkill(skill)}
                      title={`Hapus ${skill}`}
                      aria-label={`Hapus skill ${skill}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 border border-dashed border-rule px-3 py-4 text-xs leading-relaxed text-muted">
                Belum ada skill. Tambahkan minimal satu supaya skor kecocokan bisa dihitung.
              </p>
            )}
          </div>

          <div className="space-y-5">
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor={inputId} className={fieldLabel}>
                Tambah skill
              </label>
              <div className="flex gap-2">
                <input
                  id={inputId}
                  type="text"
                  value={newSkill}
                  onChange={(e) => {
                    setNewSkill(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Docker, Figma, SQL"
                  className={`${field} min-h-11 min-w-0 flex-1`}
                />
                <button
                  type="submit"
                  className={`${buttonPrimary} min-h-11 shrink-0 px-3`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah</span>
                </button>
              </div>
              {errorMessage && (
                <p role="alert" className="mt-2 text-xs font-medium text-danger">
                  {errorMessage}
                </p>
              )}
            </form>

            <div className="border-t border-rule pt-4">
              <p className={fieldLabel}>Sumber data lowongan</p>
              <div className="space-y-1">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="data-source"
                    value="remotive"
                    checked={dataSource === 'remotive'}
                    onChange={() => onDataSourceChange('remotive')}
                    className="h-4 w-4 accent-accent"
                  />
                  <span>Remotive API</span>
                  <span className="text-xs text-muted">live global</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="data-source"
                    value="local"
                    checked={dataSource === 'local'}
                    onChange={() => onDataSourceChange('local')}
                    className="h-4 w-4 accent-accent"
                  />
                  <span>Dataset lokal</span>
                  <span className="text-xs text-muted">fallback</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
