import React, { useState } from 'react';
import { JobDataSource } from '../../services/jobService';
import { Plus, X, Sparkles } from '../common/Icons';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();

    if (!trimmed) {
      setErrorMessage('Ketik nama skill terlebih dahulu.');
      return;
    }

    // Check duplicate case-insensitive
    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setErrorMessage(`Skill "${trimmed}" sudah ada di profil Kapten!`);
      return;
    }

    onAddSkill(trimmed);
    setNewSkill('');
    setErrorMessage(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Profil Skill Kapten</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Digunakan untuk menghitung persentase kecocokan (Skill Match %) tiap lowongan secara live.
        </p>
      </div>

      {/* Add Skill Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => {
              setNewSkill(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Tambah skill (misal: Docker)..."
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
        {errorMessage && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {errorMessage}
          </p>
        )}
      </form>

      {/* Skill Tags List */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          <span>Skill Dikuasai</span>
          <span>{skills.length} Skill</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                title={`Hapus skill ${skill}`}
                className="hover:bg-blue-200 dark:hover:bg-blue-800/80 rounded p-0.5 text-blue-500 hover:text-blue-900 dark:hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <p className="text-xs text-slate-400 italic">
              Belum ada skill. Tambahkan minimal 1 skill agar perhitungan match berjalan.
            </p>
          )}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Data Source Toggle */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Sumber Data Lowongan
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="dataSource"
              value="remotive"
              checked={dataSource === 'remotive'}
              onChange={() => onDataSourceChange('remotive')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>Remotive API (Live Global)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="dataSource"
              value="local"
              checked={dataSource === 'local'}
              onChange={() => onDataSourceChange('local')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>Dataset Magang ID (Fallback Lokal)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
