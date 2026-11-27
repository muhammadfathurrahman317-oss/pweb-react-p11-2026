import React, { useState } from 'react';
import {
  Application,
  ApplicationStatus,
  WorkMode,
} from '../../types';
import {
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
  // Active Tab: 'workflow' (State + Checklist + Logs) or 'interview' (Prep Timer)
  const [activeTab, setActiveTab] = useState<'workflow' | 'interview'>('workflow');

  // State Transition state
  const [selectedNextStatus, setSelectedNextStatus] = useState<ApplicationStatus | null>(null);
  const [cvVersion, setCvVersion] = useState<string>('CV-Kapten-v2.pdf');
  const [appliedDate, setAppliedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [interviewDateTime, setInterviewDateTime] = useState<string>('');
  const [salaryOffer, setSalaryOffer] = useState<string>('');
  const [workMode, setWorkMode] = useState<WorkMode>('Remote');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Nested Checklist input
  const [newChecklistText, setNewChecklistText] = useState<string>('');

  // Manual note input
  const [manualNote, setManualNote] = useState<string>('');

  if (!isOpen || !application) return null;

  const validNextStatuses = getNextStatuses(application.status);

  // Handle Status Transition
  const handleTransitionSubmit = () => {
    if (!selectedNextStatus) return;

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

    // Build log message
    let logMsg = `Status berubah: ${application.status} ➔ ${selectedNextStatus}`;
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

    // Update immutably
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
      workMode:
        selectedNextStatus === 'OFFER'
          ? workMode
          : application.workMode,
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

  // IMMUTABLE Nested Checklist Operations
  const handleToggleChecklist = (id: string) => {
    const updatedChecklist = application.checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );

    const updated: Application = {
      ...application,
      checklist: updatedChecklist,
      lastUpdatedAt: new Date().toISOString(),
    };

    onUpdateApplication(updated);
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newChecklistText.trim();
    if (!trimmed) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      text: trimmed,
      done: false,
    };

    // Strictly immutable update
    const updated: Application = {
      ...application,
      checklist: [...application.checklist, newItem],
      lastUpdatedAt: new Date().toISOString(),
    };

    onUpdateApplication(updated);
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (id: string) => {
    const updatedChecklist = application.checklist.filter((item) => item.id !== id);

    const updated: Application = {
      ...application,
      checklist: updatedChecklist,
      lastUpdatedAt: new Date().toISOString(),
    };

    onUpdateApplication(updated);
  };

  // Add Manual Note to Activity Log
  const handleAddManualNote = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualNote.trim();
    if (!trimmed) return;

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `[Catatan Kapten]: ${trimmed}`,
    };

    const updated: Application = {
      ...application,
      activityLogs: [newLog, ...application.activityLogs],
      lastUpdatedAt: new Date().toISOString(),
    };

    onUpdateApplication(updated);
    setManualNote('');
  };

  const completedCount = application.checklist.filter((i) => i.done).length;
  const totalCount = application.checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Pipeline stages for visual indicator
  const stages: ApplicationStatus[] = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                {application.workMode}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                Status: {STATUS_LABELS[application.status]}
              </span>
              {application.salaryOffer && application.salaryOffer > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  {formatRupiah(application.salaryOffer)}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {application.role}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {application.company}
              </span>
              {application.cvVersion && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  CV: {application.cvVersion}
                </span>
              )}
              {application.interviewDateTime && (
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Jadwal: {formatDisplayDateTime(application.interviewDateTime)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDeleteApplication(application);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Lamaran</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'workflow'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Workflow & Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'interview'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Latihan Interview (Timer)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'interview' ? (
            <InterviewPrepSection />
          ) : (
            <>
              {/* 1. Tahap Seleksi & State Machine Stepper */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tahap Seleksi Lamaran
                </div>

                {/* Visual Pipeline Bar */}
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {stages.map((stage, idx) => {
                    const isCurrent = application.status === stage;
                    const stageIndex = stages.indexOf(application.status);
                    const isPassed = stageIndex > idx;

                    return (
                      <div
                        key={stage}
                        className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 dark:ring-blue-800'
                            : isPassed
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        <div>{idx + 1}. {STATUS_LABELS[stage]}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Transitions Form */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  {validNextStatuses.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">
                      Status ini bersifat final ({application.status}). Tidak ada transisi lanjutan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Pindahkan status ke:
                        </span>
                        {validNextStatuses.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setSelectedNextStatus(st);
                              setTransitionError(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              selectedNextStatus === st
                                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                : st === 'REJECTED'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                                : st === 'GHOSTED'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                            }`}
                          >
                            {STATUS_LABELS[st]}
                          </button>
                        ))}
                      </div>

                      {/* Conditional Requirement Inputs */}
                      {selectedNextStatus && (
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 space-y-3">
                          <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                            Syarat Pindah ke {STATUS_LABELS[selectedNextStatus]}
                          </h4>

                          {selectedNextStatus === 'APPLIED' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  Versi CV (cvVersion) *
                                </label>
                                <input
                                  type="text"
                                  value={cvVersion}
                                  onChange={(e) => setCvVersion(e.target.value)}
                                  placeholder="CV-Kapten-v2.pdf"
                                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  Tanggal Melamar (appliedDate) *
                                </label>
                                <input
                                  type="date"
                                  value={appliedDate}
                                  onChange={(e) => setAppliedDate(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                />
                              </div>
                            </div>
                          )}

                          {selectedNextStatus === 'INTERVIEW' && (
                            <div>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Jadwal Interview (Format YYYY-MM-DDTHH:mm) *
                              </label>
                              <input
                                type="datetime-local"
                                value={interviewDateTime}
                                onChange={(e) => setInterviewDateTime(e.target.value)}
                                className="w-full sm:w-72 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                              />
                            </div>
                          )}

                          {selectedNextStatus === 'OFFER' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  Nominal Uang Saku / Gaji (Rp, wajib &gt; 0) *
                                </label>
                                <input
                                  type="number"
                                  value={salaryOffer}
                                  onChange={(e) => setSalaryOffer(e.target.value)}
                                  placeholder="6000000"
                                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  Mode Kerja (workMode) *
                                </label>
                                <select
                                  value={workMode}
                                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                >
                                  <option value="Remote">Remote</option>
                                  <option value="Hybrid">Hybrid</option>
                                  <option value="Onsite">Onsite</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {transitionError && (
                            <div className="p-2 text-xs rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{transitionError}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={handleTransitionSubmit}
                              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                            >
                              Konfirmasi Pindah Status
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNextStatus(null);
                                setTransitionError(null);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Nested Checklist & Activity Log Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Nested Checklist */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-blue-500" />
                      <span>Daftar Persiapan</span>
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {completedCount} / {totalCount} selesai ({progressPercent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2">
                    {application.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => handleToggleChecklist(item.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span
                            className={
                              item.done
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-700 dark:text-slate-200 font-medium'
                            }
                          >
                            {item.text}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {application.checklist.length === 0 && (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada checklist. Tambahkan persiapan interview/lamaran.
                      </p>
                    )}
                  </div>

                  {/* Add Checklist Form */}
                  <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Tambah tugas persiapan baru..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah</span>
                    </button>
                  </form>
                </div>

                {/* Right: Activity Log & Manual Notes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>Riwayat Aktivitas</span>
                    </h3>
                    <span className="text-xs text-slate-400">
                      {application.activityLogs.length} Entri
                    </span>
                  </div>

                  {/* Timeline list */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {application.activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5"
                      >
                        <div className="text-[10px] text-slate-400">
                          {formatDisplayDateTime(log.timestamp)}
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {log.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Manual Note Form */}
                  <form onSubmit={handleAddManualNote} className="flex gap-2">
                    <input
                      type="text"
                      value={manualNote}
                      onChange={(e) => setManualNote(e.target.value)}
                      placeholder="Tulis catatan manual Kapten..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Catat</span>
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
