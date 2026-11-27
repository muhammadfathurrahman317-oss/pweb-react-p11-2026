import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Application, JobListing } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_APPLICATIONS, INITIAL_KAPTEN_SKILLS } from './utils/initialData';
import { isGhostingRisk } from './utils/ghosting';
import { detectInterviewConflicts } from './utils/interviewConflict';
import { Header, ActiveTab } from './components/common/Header';
import { StatCards } from './components/dashboard/StatCards';
import { ConflictBanner } from './components/dashboard/ConflictBanner';
import { JobExplorer } from './components/jobs/JobExplorer';
import { WarRoomPipeline } from './components/pipeline/WarRoomPipeline';
import { OfferComparatorView } from './components/comparator/OfferComparatorView';
import { AddApplicationModal } from './components/pipeline/AddApplicationModal';
import { ApplicationDetailModal } from './components/pipeline/ApplicationDetailModal';
import { UndoToast } from './components/common/UndoToast';

export default function App() {
  // Navigation active tab: 'jobs' | 'pipeline' | 'comparator'
  const [activeTab, setActiveTab] = useState<ActiveTab>('pipeline');

  // Persisted state using Custom Hook useLocalStorage<T>
  const [applications, setApplications] = useLocalStorage<Application[]>(
    'kapten_applications_v1',
    INITIAL_APPLICATIONS
  );

  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
    'kapten_skills_v1',
    INITIAL_KAPTEN_SKILLS
  );

  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(
    'kapten_dark_mode_v1',
    false
  );

  // Sync Dark Mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Undo Delete state & useRef timers (Fitur 6)
  const [deletedApp, setDeletedApp] = useState<Application | null>(null);
  const [undoSeconds, setUndoSeconds] = useState<number>(5);
  const undoTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Active detail application (derived from applications to keep it fresh)
  const selectedApplication = useMemo(() => {
    if (!selectedAppId) return null;
    return applications.find((app) => app.id === selectedAppId) || null;
  }, [applications, selectedAppId]);

  // Derived State: 5 Kartu Statistik (Page 6 & 8)
  const totalApplications = applications.length;

  const activeInPipeline = useMemo(() => {
    return applications.filter(
      (app) => app.status !== 'OFFER' && app.status !== 'REJECTED'
    ).length;
  }, [applications]);

  const processedCount = useMemo(() => {
    return applications.filter((app) => app.status !== 'WISHLIST').length;
  }, [applications]);

  const responseRate = useMemo(() => {
    return totalApplications > 0
      ? Math.round((processedCount / totalApplications) * 100)
      : 0;
  }, [totalApplications, processedCount]);

  const interviewCount = useMemo(() => {
    return applications.filter(
      (app) => app.status === 'INTERVIEW' || app.status === 'OFFER'
    ).length;
  }, [applications]);

  const interviewRate = useMemo(() => {
    return totalApplications > 0
      ? Math.round((interviewCount / totalApplications) * 100)
      : 0;
  }, [totalApplications, interviewCount]);

  const ghostingRiskCount = useMemo(() => {
    return applications.filter((app) => isGhostingRisk(app)).length;
  }, [applications]);

  const offerCount = useMemo(() => {
    return applications.filter((app) => app.status === 'OFFER').length;
  }, [applications]);

  // Derived State: Interview Conflicts (checked on all data)
  const interviewConflicts = useMemo(() => {
    return detectInterviewConflicts(applications);
  }, [applications]);

  // Kapten Skills Handlers
  const handleAddKaptenSkill = (skill: string) => {
    setKaptenSkills((prev) => [...prev, skill]);
  };

  const handleRemoveKaptenSkill = (skillToRemove: string) => {
    setKaptenSkills((prev) =>
      prev.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase())
    );
  };

  // Add Application Handler
  const handleAddApplication = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  // Update Application Handler (Immutable)
  const handleUpdateApplication = (updatedApp: Application) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
  };

  // Delete Application with 5s Undo Toast & useRef Timer Cleanup (Fitur 6)
  const handleDeleteApplication = (appToDelete: Application) => {
    // Clean up previous undo timer if deleting consecutively (< 5s)
    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Remove from active list
    setApplications((prev) => prev.filter((app) => app.id !== appToDelete.id));

    // Close detail modal if the open application is deleted
    if (selectedAppId === appToDelete.id) {
      setSelectedAppId(null);
    }

    // Set deleted item and reset countdown
    setDeletedApp(appToDelete);
    setUndoSeconds(5);

    // Setup 1-second countdown ticker
    countdownIntervalRef.current = window.setInterval(() => {
      setUndoSeconds((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current !== null) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Setup 5-second automatic commit (dismiss toast)
    undoTimeoutRef.current = window.setTimeout(() => {
      setDeletedApp(null);
      if (countdownIntervalRef.current !== null) {
        window.clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      undoTimeoutRef.current = null;
    }, 5000);
  };

  // Undo Handler (restores deleted app intact with checklist & logs)
  const handleUndoDelete = () => {
    if (!deletedApp) return;

    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Restore app intact
    setApplications((prev) => [deletedApp, ...prev]);
    setDeletedApp(null);
  };

  const handleDismissUndo = () => {
    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setDeletedApp(null);
  };

  // Simulasi +15 Hari Handler (Testcase 6)
  const handleSimulateGhosting = (app: Application) => {
    const currentUpdated = new Date(app.lastUpdatedAt).getTime();
    // Subtract 15 days in milliseconds
    const fifteenDaysAgo = new Date(currentUpdated - 15 * 86400000).toISOString();

    const updatedApp: Application = {
      ...app,
      lastUpdatedAt: fifteenDaysAgo,
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: 'Simulasi +15 Hari dijalankan (memundurkan waktu pembaruan)',
        },
        ...app.activityLogs,
      ],
    };

    handleUpdateApplication(updatedApp);
  };

  // Save Job from JobExplorer to Wishlist
  const handleSaveToWishlist = (job: JobListing) => {
    const newApp: Application = {
      id: `app-wishlist-${Date.now()}`,
      company: job.company_name,
      role: job.title,
      workMode: job.candidate_required_location.toLowerCase().includes('remote')
        ? 'Remote'
        : job.candidate_required_location.toLowerCase().includes('hybrid')
        ? 'Hybrid'
        : 'Onsite',
      status: 'WISHLIST',
      requiredSkills: job.tags,
      lastUpdatedAt: new Date().toISOString(),
      checklist: [
        { id: `chk-${Date.now()}-1`, text: 'Pelajari deskripsi pekerjaan', done: false },
        { id: `chk-${Date.now()}-2`, text: 'Sesuaikan CV dengan skill yang diminta', done: false },
      ],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: `Disimpan ke Wishlist dari Katalog Lowongan (ID: ${job.id})`,
        },
      ],
    };

    setApplications((prev) => [newApp, ...prev]);
  };

  // Bonus: Export Data to JSON
  const handleExportData = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      kaptenSkills,
      applications,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aku-mw-magang-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Bonus: Import Data from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed.applications)) {
          setApplications(parsed.applications);
        } else if (Array.isArray(parsed)) {
          setApplications(parsed);
        }

        if (Array.isArray(parsed.kaptenSkills)) {
          setKaptenSkills(parsed.kaptenSkills);
        }

        alert('Data backup berhasil diimpor!');
      } catch (err) {
        alert('Gagal mengimpor file JSON. Format file tidak valid.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (
      window.confirm(
        'Kembalikan seluruh data ke kondisi awal demo (12 lamaran & skill default)?'
      )
    ) {
      setApplications(INITIAL_APPLICATIONS);
      setKaptenSkills(INITIAL_KAPTEN_SKILLS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicationsCount={totalApplications}
        offersCount={offerCount}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner Bentrok Jadwal Interview (Always visible at top when conflict exists!) */}
        <ConflictBanner conflicts={interviewConflicts} />

        {/* 5 Kartu Statistik Dashboard */}
        <StatCards
          totalApplications={totalApplications}
          activeInPipeline={activeInPipeline}
          responseRate={responseRate}
          processedCount={processedCount}
          interviewRate={interviewRate}
          interviewCount={interviewCount}
          ghostingRiskCount={ghostingRiskCount}
          offerCount={offerCount}
        />

        {/* Tab Views */}
        {activeTab === 'jobs' && (
          <JobExplorer
            kaptenSkills={kaptenSkills}
            onAddKaptenSkill={handleAddKaptenSkill}
            onRemoveKaptenSkill={handleRemoveKaptenSkill}
            applications={applications}
            onSaveToWishlist={handleSaveToWishlist}
          />
        )}

        {activeTab === 'pipeline' && (
          <WarRoomPipeline
            applications={applications}
            kaptenSkills={kaptenSkills}
            onOpenDetail={(app) => setSelectedAppId(app.id)}
            onDeleteApplication={handleDeleteApplication}
            onSimulateGhosting={handleSimulateGhosting}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'comparator' && (
          <OfferComparatorView
            applications={applications}
            kaptenSkills={kaptenSkills}
          />
        )}
      </main>

      {/* Modal: Form Tambah Lamaran Manual */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddApplication={handleAddApplication}
        existingApplications={applications}
      />

      {/* Modal: Detail Lamaran, State Machine, Checklist, Log, Prep Timer */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={Boolean(selectedApplication)}
        onClose={() => setSelectedAppId(null)}
        onUpdateApplication={handleUpdateApplication}
        onDeleteApplication={handleDeleteApplication}
      />

      {/* Undo Toast Notification (Fitur 6) */}
      <UndoToast
        deletedApp={deletedApp}
        onUndo={handleUndoDelete}
        onDismiss={handleDismissUndo}
        secondsRemaining={undoSeconds}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Praktikum Pemrograman Web 2026 • Modul 5: Aku Mw Magang • Kelompok P11
        </p>
      </footer>
    </div>
  );
}
