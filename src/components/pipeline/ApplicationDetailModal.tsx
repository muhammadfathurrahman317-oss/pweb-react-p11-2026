import React, { useId, useRef, useState } from 'react';
import { Application, ApplicationStatus, WorkMode } from '../../types';
import {
  canTransition,
  getNextStatuses,
  STATUS_LABELS,
  validateTransitionRequirements,
} from '../../utils/stateMachine';
import { InterviewPrepSection } from '../interview/InterviewPrepSection';
import { formatDisplayDateTime, formatRupiah } from '../../utils/formatters';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Briefcase,
  FileText,
  AlertTriangle,
  MessageSquare,
  ListChecks,
} from '../common/Icons';
import { ModalFrame } from '../common/ModalFrame';
import {
  buttonDanger,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  field,
  fieldLabel,
  kicker,
  select,
} from '../common/ui';

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateApplication: (updatedApp: Application) => void;
  onDeleteApplication: (app: Application) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onUpdateApplication,
  onDeleteApplication,
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'interview'>('workflow');

  const [selectedNextStatus, setSelectedNextStatus] = useState<ApplicationStatus | null>(null);
  const [cvVersion, setCvVersion] = useState<string>(
    application?.cvVersion ?? 'CV-Kapten-v2.pdf'
  );
  const [appliedDate, setAppliedDate] = useState<string>(
    application?.appliedDate ?? new Date().toISOString().split('T')[0]
  );
  const [interviewDateTime, setInterviewDateTime] = useState<string>(
    application?.interviewDateTime ?? ''
  );
  const [salaryOffer, setSalaryOffer] = useState<string>(
    application?.salaryOffer !== undefined && application.salaryOffer > 0
      ? String(application.salaryOffer)
      : ''
  );
  const [workMode, setWorkMode] = useState<WorkMode>(application?.workMode ?? 'Remote');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const [manualNote, setManualNote] = useState<string>('');

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const panelId = `${baseId}-panel`;
  const tabWorkflowId = `${baseId}-tab-workflow`;
  const tabInterviewId = `${baseId}-tab-interview`;
  const cvId = `${baseId}-cv`;
  const appliedDateId = `${baseId}-applied-date`;
  const interviewId = `${baseId}-interview`;
  const salaryId = `${baseId}-salary`;
  const offerWorkModeId = `${baseId}-offer-work-mode`;
  const checklistInputId = `${baseId}-checklist`;
  const noteInputId = `${baseId}-note`;

  if (!isOpen || !application) return null;

  const validNextStatuses = getNextStatuses(application.status);

  const handleTransitionSubmit = () => {
    if (!selectedNextStatus) return;

    if (!canTransition(application.status, selectedNextStatus)) {
      setTransitionError(
        `Transisi dari ${STATUS_LABELS[application.status]} ke ${STATUS_LABELS[selectedNextStatus]} tidak diizinkan.`
      );
      return;
    }

    const validation = validateTransitionRequirements(selectedNextStatus, {
      cvVersion,
      appliedDate,
      interviewDateTime,
      salaryOffer: salaryOffer ? parseFloat(salaryOffer) : undefined,
      workMode,
    });

    if (!validation.valid) {
      setTransitionError(validation.errorMessage || 'Persyaratan transisi belum lengkap.');
      return;
    }

    let logMsg = `Status berubah: ${application.status} menjadi ${selectedNextStatus}`;
    if (selectedNextStatus === 'APPLIED') {
      logMsg = `Pindah ke APPLIED (CV: ${cvVersion}, Tgl: ${appliedDate})`;
    } else if (selectedNextStatus === 'INTERVIEW') {
      logMsg = `Pindah ke INTERVIEW (Jadwal: ${formatDisplayDateTime(interviewDateTime)})`;
    } else if (selectedNextStatus === 'OFFER') {
      logMsg = `Menerima penawaran OFFER (${formatRupiah(parseFloat(salaryOffer))}, Mode: ${workMode})`;
    } else if (selectedNextStatus === 'REJECTED') {
      logMsg = 'Lamaran ditolak (REJECTED)';
    } else if (selectedNextStatus === 'GHOSTED') {
      logMsg = 'Ditandai GHOSTED oleh Kapten';
    } else if (selectedNextStatus === 'SCREENING' && application.status === 'GHOSTED') {
      logMsg = 'Dipulihkan dari GHOSTED kembali ke SCREENING';
    }

    const updated: Application = {
      ...application,
      status: selectedNextStatus,
      lastUpdatedAt: new Date().toISOString(),
      cvVersion: selectedNextStatus === 'APPLIED' ? cvVersion : application.cvVersion,
      appliedDate: selectedNextStatus === 'APPLIED' ? appliedDate : application.appliedDate,
      interviewDateTime:
        selectedNextStatus === 'INTERVIEW'
          ? interviewDateTime
          : application.interviewDateTime,
      salaryOffer:
        selectedNextStatus === 'OFFER'
          ? parseFloat(salaryOffer)
          : application.salaryOffer,
      workMode: selectedNextStatus === 'OFFER' ? workMode : application.workMode,
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: logMsg,
        },
        ...application.activityLogs,
      ],
    };

    onUpdateApplication(updated);
    setSelectedNextStatus(null);
    setTransitionError(null);
  };

  const handleToggleChecklist = (id: string) => {
    const updatedChecklist = application.checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );

    onUpdateApplication({
      ...application,
      checklist: updatedChecklist,
    });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newChecklistText.trim();
    if (!trimmed) return;

    onUpdateApplication({
      ...application,
      checklist: [
        ...application.checklist,
        { id: `chk-${Date.now()}`, text: trimmed, done: false },
      ],
    });
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (id: string) => {
    onUpdateApplication({
      ...application,
      checklist: application.checklist.filter((item) => item.id !== id),
    });
  };

  const handleAddManualNote = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualNote.trim();
    if (!trimmed) return;

    onUpdateApplication({
      ...application,
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: `[Catatan Kapten]: ${trimmed}`,
        },
        ...application.activityLogs,
      ],
    });
    setManualNote('');
  };

  const completedCount = application.checklist.filter((item) => item.done).length;
  const totalCount = application.checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const stages: ApplicationStatus[] = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];
  const stageIndex = stages.indexOf(application.status);

  return (
    <ModalFrame
      onClose={onClose}
      labelledBy={titleId}
      initialFocusRef={closeButtonRef}
      widthClass="max-w-4xl"
    >
      <div className="border-b-2 border-border bg-explore px-5 py-4 text-explore-ink sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase text-explore-ink">Detail lamaran</span>
              <span className="inline-flex items-center border-2 border-explore-ink bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-ink">
                {STATUS_LABELS[application.status]}
              </span>
              <span className="border border-explore-ink px-1.5 py-0.5 font-mono text-[10px] uppercase text-explore-ink">
                {application.workMode}
              </span>
              {application.salaryOffer && application.salaryOffer > 0 && (
                <span className="font-mono text-[10px] text-success">
                  {formatRupiah(application.salaryOffer)}
                </span>
              )}
            </div>

            <h2
              id={titleId}
              className="mt-2 break-words font-display text-2xl leading-tight text-explore-ink sm:text-3xl"
            >
              {application.role}
            </h2>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-explore-ink">
              <span className="inline-flex items-center gap-1 font-semibold text-explore-ink">
                <Briefcase className="h-3.5 w-3.5" />
                {application.company}
              </span>
              {application.cvVersion && (
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {application.cvVersion}
                </span>
              )}
              {application.interviewDateTime && (
                <span className="inline-flex items-center gap-1 text-explore-ink">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-mono">
                    {formatDisplayDateTime(application.interviewDateTime)}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onDeleteApplication(application);
                onClose();
              }}
              className={`${buttonDanger} min-h-11 text-xs`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
            <button
              type="button"
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Tutup detail lamaran"
              className="flex h-11 w-11 items-center justify-center text-explore-ink transition-colors hover:bg-explore-ink/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Bagian detail lamaran"
        className="grid grid-cols-2 border-b-2 border-border bg-paper px-3 py-2 sm:flex sm:px-6"
      >
        <button
          type="button"
          role="tab"
          id={tabWorkflowId}
          aria-selected={activeTab === 'workflow'}
          aria-controls={panelId}
          onClick={() => setActiveTab('workflow')}
          className={`flex min-h-11 min-w-0 items-center justify-center gap-2 border-2 px-2 text-center text-[11px] font-semibold transition-colors sm:mr-2 sm:px-3 sm:text-sm ${
            activeTab === 'workflow'
              ? 'border-border bg-accent text-accent-ink'
              : 'border-transparent text-muted hover:border-border hover:bg-highlight hover:text-ink'
          }`}
        >
          <ListChecks className="h-4 w-4" />
          Workflow & checklist
        </button>
        <button
          type="button"
          role="tab"
          id={tabInterviewId}
          aria-selected={activeTab === 'interview'}
          aria-controls={panelId}
          onClick={() => setActiveTab('interview')}
          className={`flex min-h-11 min-w-0 items-center justify-center gap-2 border-2 px-2 text-center text-[11px] font-semibold transition-colors sm:px-3 sm:text-sm ${
            activeTab === 'interview'
              ? 'border-border bg-explore text-explore-ink'
              : 'border-transparent text-muted hover:border-border hover:bg-highlight hover:text-ink'
          }`}
        >
          <Clock className="h-4 w-4" />
          Latihan interview
        </button>
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={activeTab === 'workflow' ? tabWorkflowId : tabInterviewId}
        className="min-h-0 flex-1 overflow-y-auto bg-paper p-4 sm:p-6"
      >
        {activeTab === 'interview' ? (
          <InterviewPrepSection />
        ) : (
          <div className="space-y-6">
            <section className="border-2 border-border bg-surface shadow-[4px_4px_0_var(--app-ink)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border bg-explore px-4 py-3 text-explore-ink">
                <p className="font-mono text-[10px] font-semibold uppercase text-explore-ink">Tahap seleksi</p>
                {stageIndex === -1 && (
                  <span className="text-[10px] text-explore-ink">
                    Di luar jalur utama: {STATUS_LABELS[application.status]}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-5">
                {stages.map((stage, index) => {
                  const isCurrent = application.status === stage;
                  const isPassed = stageIndex > index;

                  return (
                    <div
                      key={stage}
                      aria-current={isCurrent ? 'step' : undefined}
                      className={`min-w-0 border-r border-rule px-1 py-3 last:border-r-0 sm:px-3 ${
                        isCurrent ? 'bg-accent text-accent-ink' : ''
                      }`}
                    >
                      <span
                        className={`font-mono text-[10px] ${
                          isCurrent
                            ? 'text-accent-ink'
                            : isPassed
                            ? 'text-success'
                            : 'text-muted'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div
                        className={`mt-1 h-0.5 w-full ${
                          isCurrent ? 'bg-accent-ink' : isPassed ? 'bg-success' : 'bg-rule'
                        }`}
                      />
                      <span
                        className={`mt-2 block break-words text-[9px] uppercase leading-tight sm:text-[10px] ${
                          isCurrent
                            ? 'text-accent-ink'
                            : isPassed
                            ? 'text-ink/70'
                            : 'text-muted'
                        }`}
                      >
                        {STATUS_LABELS[stage]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-border p-4">
                {validNextStatuses.length === 0 ? (
                  <p className="text-xs leading-relaxed text-muted">
                    Status {STATUS_LABELS[application.status]} bersifat final. Tidak ada
                    langkah berikutnya di jalur ini.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-ink">Pindahkan ke</span>
                      {validNextStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setSelectedNextStatus(status);
                            setTransitionError(null);
                          }}
                          aria-pressed={selectedNextStatus === status}
                          className={`min-h-11 border-2 px-3 text-xs font-semibold transition-colors ${
                            selectedNextStatus === status
                              ? 'border-border bg-accent text-accent-ink'
                              : status === 'REJECTED'
                              ? 'border-danger text-danger hover:bg-danger/10'
                              : status === 'GHOSTED'
                              ? 'border-warning text-warning hover:bg-warning/10'
                              : 'border-border text-ink hover:bg-highlight'
                          }`}
                        >
                          {STATUS_LABELS[status]}
                        </button>
                      ))}
                    </div>

                    {selectedNextStatus && (
                      <div className="space-y-3 border-2 border-border bg-explore/25 p-3.5">
                        <p className={kicker}>
                          Syarat pindah ke {STATUS_LABELS[selectedNextStatus]}
                        </p>

                        {selectedNextStatus === 'APPLIED' && (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label htmlFor={cvId} className={fieldLabel}>
                                Versi CV <span aria-hidden="true" className="text-danger">*</span>
                              </label>
                              <input
                                id={cvId}
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
                                type="date"
                                value={appliedDate}
                                onChange={(e) => setAppliedDate(e.target.value)}
                                className={`${field} min-h-11`}
                              />
                            </div>
                          </div>
                        )}

                        {selectedNextStatus === 'INTERVIEW' && (
                          <div>
                            <label htmlFor={interviewId} className={fieldLabel}>
                              Jadwal interview <span aria-hidden="true" className="text-danger">*</span>
                            </label>
                            <input
                              id={interviewId}
                              type="datetime-local"
                              value={interviewDateTime}
                              onChange={(e) => setInterviewDateTime(e.target.value)}
                              className={`${field} min-h-11 sm:max-w-xs`}
                            />
                          </div>
                        )}

                        {selectedNextStatus === 'OFFER' && (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label htmlFor={salaryId} className={fieldLabel}>
                                Uang saku / bulan (Rp) <span aria-hidden="true" className="text-danger">*</span>
                              </label>
                              <input
                                id={salaryId}
                                type="number"
                                min={1}
                                value={salaryOffer}
                                onChange={(e) => setSalaryOffer(e.target.value)}
                                placeholder="6000000"
                                className={`${field} min-h-11`}
                              />
                            </div>
                            <div>
                              <label htmlFor={offerWorkModeId} className={fieldLabel}>
                                Mode kerja <span aria-hidden="true" className="text-danger">*</span>
                              </label>
                              <select
                                id={offerWorkModeId}
                                value={workMode}
                                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                                className={`${select} min-h-11`}
                              >
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Onsite">Onsite</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {transitionError && (
                          <div
                            role="alert"
                            className="flex items-start gap-2 border-2 border-danger bg-attention/50 px-3 py-2 text-xs leading-relaxed text-danger"
                          >
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{transitionError}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleTransitionSubmit}
                            className={`${buttonPrimary} min-h-11 px-3 text-xs`}
                          >
                            Konfirmasi pindah
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNextStatus(null);
                              setTransitionError(null);
                            }}
                            className={`${buttonGhost} min-h-11 text-xs`}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <section className="min-w-0 space-y-3 border-2 border-border bg-surface p-4 shadow-[4px_4px_0_var(--app-ink)]">
                <div className="-mx-4 -mt-4 flex items-end justify-between gap-2 border-b-2 border-border bg-accent px-4 py-3 text-accent-ink">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase text-accent-ink">Persiapan</p>
                    <h3 className="mt-0.5 font-display text-lg leading-tight text-accent-ink">
                      Daftar persiapan
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-accent-ink">
                    {completedCount}/{totalCount} · {progressPercent}%
                  </span>
                </div>

                <div
                  className="h-0.5 w-full bg-rule"
                  role="progressbar"
                  aria-label="Progres daftar persiapan"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                >
                  <div
                    className={`h-0.5 ${
                      progressPercent === 100 && totalCount > 0 ? 'bg-success' : 'bg-accent'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div>
                  {application.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex min-h-11 items-center justify-between gap-2 border-b border-rule py-1"
                    >
                      <label className="flex flex-1 cursor-pointer items-center gap-2 text-xs leading-relaxed">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleToggleChecklist(item.id)}
                          className="h-4 w-4 shrink-0 accent-accent"
                        />
                        <span
                          className={
                            item.done ? 'text-muted line-through' : 'font-medium text-ink'
                          }
                        >
                          {item.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        aria-label={`Hapus tugas ${item.text}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {application.checklist.length === 0 && (
                    <p className="border border-dashed border-rule px-3 py-3 text-xs leading-relaxed text-muted">
                      Belum ada tugas persiapan. Tambahkan langkah pertama di bawah.
                    </p>
                  )}
                </div>

                <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                  <label htmlFor={checklistInputId} className="sr-only">
                    Tugas persiapan baru
                  </label>
                  <input
                    id={checklistInputId}
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Tambah tugas persiapan"
                    className={`${field} min-h-11 min-w-0 flex-1 text-xs`}
                  />
                  <button type="submit" className={`${buttonSecondary} min-h-11 shrink-0 px-3 text-xs`}>
                    <Plus className="h-3.5 w-3.5" />
                    Tambah
                  </button>
                </form>
              </section>

              <section className="min-w-0 space-y-3 border-2 border-border bg-surface p-4 shadow-[4px_4px_0_var(--app-ink)]">
                <div className="-mx-4 -mt-4 flex items-end justify-between gap-2 border-b-2 border-border bg-explore px-4 py-3 text-explore-ink">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase text-explore-ink">Riwayat</p>
                    <h3 className="mt-0.5 font-display text-lg leading-tight text-explore-ink">
                      Aktivitas
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-explore-ink">
                    {application.activityLogs.length} entri
                  </span>
                </div>

                {application.activityLogs.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto border-t border-rule bg-explore/10">
                    {application.activityLogs.map((log) => (
                      <div key={log.id} className="border-b border-rule px-2 py-2.5">
                        <p className="font-mono text-[10px] text-muted">
                          {formatDisplayDateTime(log.timestamp)}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink/90">
                          {log.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="border border-dashed border-rule px-3 py-3 text-xs leading-relaxed text-muted">
                    Belum ada aktivitas yang tercatat.
                  </p>
                )}

                <form onSubmit={handleAddManualNote} className="flex gap-2">
                  <label htmlFor={noteInputId} className="sr-only">
                    Catatan baru
                  </label>
                  <input
                    id={noteInputId}
                    type="text"
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    placeholder="Tulis catatan"
                    className={`${field} min-h-11 min-w-0 flex-1 text-xs`}
                  />
                  <button type="submit" className={`${buttonSecondary} min-h-11 shrink-0 px-3 text-xs`}>
                    <MessageSquare className="h-3.5 w-3.5" />
                    Catat
                  </button>
                </form>
              </section>
            </div>
          </div>
        )}
      </div>
    </ModalFrame>
  );
};
