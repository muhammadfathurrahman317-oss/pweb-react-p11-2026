import React, { useId, useRef, useState } from 'react';
import { Application, ApplicationStatus, WorkMode } from '../../types';
import { X, AlertTriangle, Plus } from '../common/Icons';
import { ModalFrame } from '../common/ModalFrame';
import {
  buttonPrimary,
  buttonSecondary,
  field,
  fieldLabel,
  kicker,
  select,
} from '../common/ui';

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

  const companyInputRef = useRef<HTMLInputElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);
  const skillsInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const appliedDateInputRef = useRef<HTMLInputElement>(null);

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const companyId = `${baseId}-company`;
  const roleId = `${baseId}-role`;
  const workModeId = `${baseId}-work-mode`;
  const statusId = `${baseId}-status`;
  const cvId = `${baseId}-cv`;
  const appliedDateId = `${baseId}-applied-date`;
  const skillsId = `${baseId}-skills`;
  const skillsHelpId = `${baseId}-skills-help`;

  if (!isOpen) return null;

  const resetForm = () => {
    setCompany('');
    setRole('');
    setWorkMode('Remote');
    setStatus('WISHLIST');
    setSkillsString('');
    setCvVersion('CV-Kapten-v1.pdf');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!company.trim()) {
      setErrorMessage('Nama perusahaan wajib diisi.');
      companyInputRef.current?.focus();
      return;
    }

    if (!role.trim()) {
      setErrorMessage('Posisi atau role lamaran wajib diisi.');
      roleInputRef.current?.focus();
      return;
    }

    const isDuplicate = existingApplications.some(
      (app) =>
        app.company.trim().toLowerCase() === company.trim().toLowerCase() &&
        app.role.trim().toLowerCase() === role.trim().toLowerCase()
    );

    if (isDuplicate) {
      setErrorMessage(
        `Lamaran untuk "${company}" dengan posisi "${role}" sudah pernah dicatat.`
      );
      companyInputRef.current?.focus();
      return;
    }

    const seenSkills = new Set<string>();
    const parsedSkills = skillsString
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => {
        const key = skill.toLowerCase();
        if (!key || seenSkills.has(key)) return false;
        seenSkills.add(key);
        return true;
      });

    if (parsedSkills.length === 0) {
      setErrorMessage('Isi minimal satu skill, pisahkan dengan koma.');
      skillsInputRef.current?.focus();
      return;
    }

    if (status === 'APPLIED') {
      if (!cvVersion.trim()) {
        setErrorMessage('Versi CV wajib diisi kalau status awalnya Applied.');
        cvInputRef.current?.focus();
        return;
      }
      if (!appliedDate.trim()) {
        setErrorMessage('Tanggal melamar wajib diisi kalau status awalnya Applied.');
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
    resetForm();
    onClose();
  };

  return (
    <ModalFrame
      onClose={handleClose}
      labelledBy={titleId}
      initialFocusRef={companyInputRef}
      widthClass="max-w-lg"
    >
      <div className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className={kicker}>Entri baru</p>
          <h2 id={titleId} className="mt-1 font-display text-2xl leading-tight text-ink">
            Catat lamaran
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Satu baris baru di buku lamaranmu. Bisa diubah lagi kapan saja.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup form"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-muted transition-colors hover:bg-highlight hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 border border-danger/40 px-3 py-2 text-xs leading-relaxed text-danger"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor={companyId} className={fieldLabel}>
              Nama perusahaan <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <input
              id={companyId}
              ref={companyInputRef}
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="GoTo, Traveloka, Garuda FinTech"
              required
              aria-required="true"
              className={`${field} min-h-11`}
            />
          </div>

          <div>
            <label htmlFor={roleId} className={fieldLabel}>
              Posisi / role <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <input
              id={roleId}
              ref={roleInputRef}
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Frontend Intern, React Developer"
              required
              aria-required="true"
              className={`${field} min-h-11`}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={workModeId} className={fieldLabel}>
                Mode kerja
              </label>
              <select
                id={workModeId}
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className={`${select} min-h-11`}
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label htmlFor={statusId} className={fieldLabel}>
                Status awal
              </label>
              <select
                id={statusId}
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className={`${select} min-h-11`}
              >
                <option value="WISHLIST">Wishlist</option>
                <option value="APPLIED">Applied</option>
              </select>
            </div>
          </div>

          {status === 'APPLIED' && (
            <div className="space-y-3 border border-rule border-l-2 border-l-accent bg-highlight/40 p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                Kelengkapan status Applied
              </p>

              <div>
                <label htmlFor={cvId} className={fieldLabel}>
                  Versi CV <span aria-hidden="true" className="text-danger">*</span>
                </label>
                <input
                  id={cvId}
                  ref={cvInputRef}
                  type="text"
                  value={cvVersion}
                  onChange={(e) => setCvVersion(e.target.value)}
                  placeholder="CV-Kapten-v2.pdf"
                  className={`${field} min-h-11`}
                />
              </div>

              <div>
                <label htmlFor={appliedDateId} className={fieldLabel}>
                  Tanggal melamar <span aria-hidden="true" className="text-danger">*</span>
                </label>
                <input
                  id={appliedDateId}
                  ref={appliedDateInputRef}
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className={`${field} min-h-11`}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor={skillsId} className={fieldLabel}>
              Skill yang diminta <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <input
              id={skillsId}
              ref={skillsInputRef}
              type="text"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="React, TypeScript, CSS, Docker"
              required
              aria-required="true"
              aria-describedby={skillsHelpId}
              className={`${field} min-h-11`}
            />
            <p id={skillsHelpId} className="mt-1 text-[11px] leading-relaxed text-muted">
              Pisahkan dengan koma. Skill ini dipakai untuk menghitung kecocokan.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-rule bg-surface px-5 py-3 sm:px-6">
          <button type="button" onClick={handleClose} className={buttonSecondary}>
            Batal
          </button>
          <button type="submit" className={buttonPrimary}>
            <Plus className="h-4 w-4" />
            Simpan lamaran
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};
