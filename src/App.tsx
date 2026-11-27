import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Application, JobListing } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_APPLICATIONS, INITIAL_KAPTEN_SKILLS } from './utils/initialData';
import { calculateDashboardStats } from './utils/dashboardStats';
import {
  isApplicationArray,
  isBoolean,
  isStringArray,
  parseBackup,
} from './utils/dataValidation';
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
import { kicker } from './components/common/ui';

const PAGE_COPY: Record<ActiveTab, { kicker: string; title: string; note: string }> = {
  jobs: {
    kicker: 'Lowongan / cari dan simpan',
    title: 'Cari lowongan',
    note: 'Cocokkan skill-mu dengan lowongan yang sedang buka, lalu simpan yang paling masuk akal.',
  },
  pipeline: {
    kicker: 'Pipeline / pantau progres',
    title: 'Buku lamaran',
    note: 'Catat setiap langkah, dari wishlist sampai offer, di satu tempat.',
  },
  comparator: {
    kicker: 'Offer / pilih dengan angka',
    title: 'Bandingkan offer',
    note: 'Dua tawaran, bobot yang sama. Lihat mana yang benar-benar lebih baik.',
  },
};

const uniqueApplicationId = (id: string, applications: Application[]): string => {
  const ids = new Set(applications.map((app) => app.id));
  let candidate = id;
  let suffix = 1;
  while (ids.has(candidate)) candidate = `${id}-${suffix++}`;
  return candidate;
};

export default function App() {
  // Navigation active tab: 'jobs' | 'pipeline' | 'comparator'
  const [activeTab, setActiveTab] = useState<ActiveTab>('pipeline');

  // Persisted state using Custom Hook useLocalStorage<T>
  // Validators reject corrupted / outdated shapes instead of trusting JSON.parse.
  const [applications, setApplications] = useLocalStorage<Application[]>(
    'kapten_applications_v1',
    INITIAL_APPLICATIONS,
    isApplicationArray
  );

  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
    'kapten_skills_v1',
    INITIAL_KAPTEN_SKILLS,
    isStringArray
  );

  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(
    'kapten_dark_mode_v1',
    false,
    isBoolean
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

  const {
    totalApplications,
    activeInPipeline,
    submittedCount,
    responseCount,
    responseRate,
    interviewCount,
    interviewRate,
    ghostingRiskCount,
    offerCount,
  } = useMemo(() => calculateDashboardStats(applications), [applications]);

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
    setApplications((prev) => [
      { ...newApp, id: uniqueApplicationId(newApp.id, prev) },
      ...prev,
    ]);
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
    setApplications((prev) =>
      prev.some((app) => app.id === deletedApp.id) ? prev : [deletedApp, ...prev]
    );
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

    setApplications((prev) => [
      { ...newApp, id: uniqueApplicationId(newApp.id, prev) },
      ...prev,
    ]);
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
      const content = event.target?.result;
      if (typeof content !== 'string') {
        alert('Gagal mengimpor file JSON. Format file tidak valid.');
        return;
      }

      try {
        const backup = parseBackup(JSON.parse(content) as unknown);
        if (!backup) {
          alert(
            'Gagal mengimpor: struktur data tidak valid. Gunakan file backup hasil ekspor aplikasi ini.'
          );
          return;
        }

        setApplications(backup.applications);
        if (backup.kaptenSkills) {
          setKaptenSkills(backup.kaptenSkills);
        }

        // Drop any pending undo so an application from the old dataset cannot
        // be restored on top of the imported one.
        handleDismissUndo();

        alert('Data backup berhasil diimpor!');
      } catch (err) {
        alert('Gagal mengimpor file JSON. Format file tidak valid.');
        console.error(err);
      }
    };
    reader.onerror = () => {
      alert('Gagal membaca file backup.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (
      window.confirm(
        'Kembalikan seluruh data ke kondisi awal demo (lamaran contoh & skill default)?'
      )
    ) {
      handleDismissUndo();
      setSelectedAppId(null);
      setApplications(INITIAL_APPLICATIONS);
      setKaptenSkills(INITIAL_KAPTEN_SKILLS);
    }
  };

  const pageCopy = PAGE_COPY[activeTab];

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
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

      <main className="mx-auto w-full max-w-[1180px] flex-1 space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="border-b-[3px] border-ink pb-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className={kicker}>{pageCopy.kicker}</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
                {pageCopy.title}
              </h1>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">{pageCopy.note}</p>
          </div>
        </div>

        <ConflictBanner conflicts={interviewConflicts} />

        <StatCards
          totalApplications={totalApplications}
          activeInPipeline={activeInPipeline}
          responseRate={responseRate}
          submittedCount={submittedCount}
          responseCount={responseCount}
          interviewRate={interviewRate}
          interviewCount={interviewCount}
          ghostingRiskCount={ghostingRiskCount}
          offerCount={offerCount}
        />

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
            onGoToPipeline={() => setActiveTab('pipeline')}
          />
        )}
      </main>

      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddApplication={handleAddApplication}
        existingApplications={applications}
      />

      <ApplicationDetailModal
        key={selectedApplication?.id ?? 'closed'}
        application={selectedApplication}
        isOpen={Boolean(selectedApplication)}
        onClose={() => setSelectedAppId(null)}
        onUpdateApplication={handleUpdateApplication}
        onDeleteApplication={handleDeleteApplication}
      />

      <UndoToast
        deletedApp={deletedApp}
        onUndo={handleUndoDelete}
        onDismiss={handleDismissUndo}
        secondsRemaining={undoSeconds}
      />

      <footer className="mt-auto border-t-2 border-ink bg-surface py-4">
        <p className="px-4 text-center text-xs font-medium text-muted">
          Aku Mw Magang
        </p>
      </footer>
    </div>
  );
}
