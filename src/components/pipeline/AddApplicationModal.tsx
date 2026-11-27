import React, { useState, useRef } from 'react';
import { Application, ApplicationStatus, WorkMode } from '../../types';
import { X, Briefcase, AlertTriangle, Plus } from '../common/Icons';

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApplication: (app: Application) => void;
  existingApplications: Application[];
}

export const AddApplicationModal: React.FC<AddApplicationModalProps> = ({
  isOpen,
  onClose,
  onAddApplication,
  existingApplications,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('Remote');
  const [status, setStatus] = useState<ApplicationStatus>('WISHLIST');
  const [skillsString, setSkillsString] = useState('');
  const [cvVersion, setCvVersion] = useState('CV-Kapten-v1.pdf');
  const [appliedDate, setAppliedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for auto-focus on error (Testcase 4 requirement!)
  const companyInputRef = useRef<HTMLInputElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);
  const skillsInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const appliedDateInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate Company
    if (!company.trim()) {
      setErrorMessage('Nama Perusahaan wajib diisi.');
      companyInputRef.current?.focus();
      return;
    }

    // 2. Validate Role
    if (!role.trim()) {
      setErrorMessage('Posisi / Role lamaran wajib diisi.');
      roleInputRef.current?.focus();
      return;
    }

    // 3. Validate Duplicate (Anti-duplikat lamaran: case-insensitive)
    const isDuplicate = existingApplications.some(
      (app) =>
        app.company.trim().toLowerCase() === company.trim().toLowerCase() &&
        app.role.trim().toLowerCase() === role.trim().toLowerCase()
    );

    if (isDuplicate) {
      setErrorMessage(
        `Duplikat! Lamaran untuk "${company}" dengan posisi "${role}" sudah pernah didaftarkan.`
      );
      // Auto-focus to company input on duplicate error as per requirement!
      companyInputRef.current?.focus();
      return;
    }

    // 4. Validate Skills
    const parsedSkills = skillsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsedSkills.length === 0) {
      setErrorMessage('Minimal isi 1 required skill (pisahkan dengan koma).');
      skillsInputRef.current?.focus();
      return;
    }

    // 5. If Status = APPLIED, validate cvVersion and appliedDate
    if (status === 'APPLIED') {
      if (!cvVersion.trim()) {
        setErrorMessage('Versi CV wajib diisi jika status awal adalah APPLIED.');
        cvInputRef.current?.focus();
        return;
      }
      if (!appliedDate.trim()) {
        setErrorMessage('Tanggal melamar wajib diisi jika status awal adalah APPLIED.');
        appliedDateInputRef.current?.focus();
        return;
      }
    }

    const newApp: Application = {
      id: crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      workMode,
      status,
      requiredSkills: parsedSkills,
      cvVersion: status === 'APPLIED' ? cvVersion.trim() : undefined,
      appliedDate: status === 'APPLIED' ? appliedDate : undefined,
      lastUpdatedAt: new Date().toISOString(),
      checklist: [
        { id: `chk-${Date.now()}-1`, text: 'Riset profil perusahaan & tech stack', done: false },
        { id: `chk-${Date.now()}-2`, text: 'Siapkan portfolio & resume pendukung', done: false },
      ],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message:
            status === 'APPLIED'
              ? `Lamaran dibuat langsung berstatus APPLIED (${cvVersion.trim()}, tgl ${appliedDate})`
              : 'Lamaran manual ditambahkan ke Wishlist',
        },
      ],
    };

    onAddApplication(newApp);
    onClose();

    // Reset Form
    setCompany('');
    setRole('');
    setSkillsString('');
    setStatus('WISHLIST');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Catat Lamaran Baru
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tambah lamaran manual ke War Room Pipeline Kapten
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Perusahaan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Nama Perusahaan <span className="text-rose-500">*</span>
            </label>
            <input
              ref={companyInputRef}
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Contoh: GoTo, Traveloka, Garuda FinTech"
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Posisi / Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Posisi / Role <span className="text-rose-500">*</span>
            </label>
            <input
              ref={roleInputRef}
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Contoh: Frontend Intern, React Developer"
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mode Kerja & Status Awal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Mode Kerja
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Status Awal
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ApplicationStatus)
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WISHLIST">WISHLIST</option>
                <option value="APPLIED">APPLIED</option>
              </select>
            </div>
          </div>

          {/* Conditional Inputs if Status === APPLIED */}
          {status === 'APPLIED' && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3">
              <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                Kelengkapan Status APPLIED:
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Versi CV <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={cvInputRef}
                  type="text"
                  value={cvVersion}
                  onChange={(e) => setCvVersion(e.target.value)}
                  placeholder="Contoh: CV-Kapten-v2.pdf"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Melamar <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={appliedDateInputRef}
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Required Skills <span className="text-rose-500">*</span>
            </label>
            <input
              ref={skillsInputRef}
              type="text"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="React, TypeScript, CSS, Docker (pisahkan dengan koma)"
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Ketik beberapa skill dan pisahkan dengan tanda koma.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Lamaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
