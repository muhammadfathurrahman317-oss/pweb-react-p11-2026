// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within, act } from '@testing-library/react';
import App from './App';
import { VALID_TRANSITIONS, canTransition } from './utils/stateMachine';
import { JobExplorer } from './components/jobs/JobExplorer';
import { UndoToast } from './components/common/UndoToast';
import { INITIAL_APPLICATIONS } from './utils/initialData';
import { fetchJobsFromFallback } from './services/jobService';
import { calculateDashboardStats } from './utils/dashboardStats';
import { compareOffers } from './utils/offerComparator';
import { calculateSkillMatch } from './utils/skillMatch';
import { isGhostingRisk } from './utils/ghosting';
import { detectInterviewConflicts } from './utils/interviewConflict';
import { OfferComparatorView } from './components/comparator/OfferComparatorView';
import { ApplicationDetailModal } from './components/pipeline/ApplicationDetailModal';
import { AddApplicationModal } from './components/pipeline/AddApplicationModal';
import type { Application } from './types';
import { parseBackup, isApplicationArray } from './utils/dataValidation';
import { fetchJobsFromRemotive } from './services/jobService';
import { InterviewPrepSection } from './components/interview/InterviewPrepSection';

const longJob = {
  id: 999,
  title: 'Frontend Intern',
  company_name: 'Test Company',
  category: 'Software Development',
  candidate_required_location: 'Remote',
  salary: 'Rp 1.000.000',
  tags: ['React', 'Docker', 'Linux', 'Go', 'Kotlin', 'Swift', 'Rust', 'Elixir'],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('TASK.md contracts', () => {
  it('loads the local fallback even when network requests fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const jobs = await fetchJobsFromFallback();
    expect(jobs).toHaveLength(15);
  });

  it('allows GHOSTED to return only to SCREENING', () => {
    expect(VALID_TRANSITIONS.GHOSTED).toEqual(['SCREENING']);
    expect(canTransition('GHOSTED', 'REJECTED')).toBe(false);
  });

  it('shows every missing job skill and a disabled saved action', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: [longJob] }),
    }));
    render(
      <JobExplorer
        kaptenSkills={['React']}
        onAddKaptenSkill={vi.fn()}
        onRemoveKaptenSkill={vi.fn()}
        applications={[{ ...INITIAL_APPLICATIONS[0], company: longJob.company_name, role: longJob.title }]}
        onSaveToWishlist={vi.fn()}
      />
    );
    const article = await screen.findByRole('article');
    for (const skill of longJob.tags.slice(1)) {
      expect(within(article).getByText(skill)).toBeTruthy();
    }
    const button = within(article).getByRole('button', { name: /Sudah Dilamar/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('describes the undo deadline as expiry, not automatic restoration', () => {
    render(<UndoToast deletedApp={INITIAL_APPLICATIONS[0]} onUndo={vi.fn()} onDismiss={vi.fn()} secondsRemaining={5} />);
    expect(screen.getByText(/urungkan dalam 5 detik/i)).toBeTruthy();
    expect(screen.queryByText(/dipulihkan otomatis/i)).toBeNull();
  });

  it('cannot undo a pre-reset deletion into the reset dataset', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus lamaran Garuda FinTech' }));
    expect(screen.getByRole('button', { name: /Urungkan/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Kembalikan data demo/i }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Urungkan/i })).toBeNull());
    expect(screen.getAllByText('Garuda FinTech').length).toBeGreaterThan(0);
  });
});

const appWith = (changes: Partial<Application>): Application => ({
  ...INITIAL_APPLICATIONS[0],
  activityLogs: [],
  ...changes,
});

describe('TASK.md new business rules', () => {
  it('counts responses and interviews from history over submitted applications only', () => {
    const apps = [
      appWith({ id: 'wish', status: 'WISHLIST' }),
      appWith({ id: 'applied', status: 'APPLIED' }),
      appWith({ id: 'rejected', status: 'REJECTED' }),
      appWith({ id: 'ghosted', status: 'GHOSTED', activityLogs: [
        { id: '1', timestamp: '', message: 'Status berubah: APPLIED menjadi SCREENING' },
      ] }),
      appWith({ id: 'past-interview', status: 'REJECTED', activityLogs: [
        { id: '2', timestamp: '', message: 'Pindah ke INTERVIEW (Jadwal: 10:00)' },
      ] }),
      appWith({ id: 'offer', status: 'OFFER' }),
    ];
    expect(calculateDashboardStats(apps, Date.now())).toMatchObject({
      totalApplications: 6,
      submittedCount: 5,
      responseCount: 4,
      responseRate: 80,
      interviewCount: 2,
      interviewRate: 40,
      offerCount: 1,
    });
    expect(calculateDashboardStats([apps[0]], Date.now())).toMatchObject({ responseRate: 0, interviewRate: 0 });
  });

  it('does not treat a CV filename as an interview or response', () => {
    const applied = appWith({ id: 'cv', status: 'APPLIED', activityLogs: [
      { id: 'cv-log', timestamp: '', message: 'Pindah ke APPLIED (CV: interview-v2.pdf, Tgl: 2026-11-27)' },
    ] });
    expect(calculateDashboardStats([applied])).toMatchObject({
      submittedCount: 1, responseCount: 0, interviewCount: 0,
    });
  });

  it('normalizes salary against the higher offer without rounding intermediate scores', () => {
    const a = appWith({ id: 'a', status: 'OFFER', salaryOffer: 6000000, workMode: 'Remote', requiredSkills: ['React', 'Go', 'Rust'] });
    const b = appWith({ id: 'b', status: 'OFFER', salaryOffer: 4500000, workMode: 'Hybrid', requiredSkills: ['React'] });
    const result = compareOffers(a, b, ['React']);
    if (!result) throw new Error('Expected valid offers to be comparable');
    expect(result.resultA.salaryScore).toBe(50);
    expect(result.resultB.salaryScore).toBe(37.5);
    expect(result.resultA.skillMatchScore).toBeCloseTo(25 / 3, 10);
    expect(result.bestOfferId).toBe('a');
  });

  it('rejects invalid or identical offers and shows a tie at equal scores', () => {
    const offer = appWith({ id: 'offer', status: 'OFFER', salaryOffer: 1000 });
    const other = appWith({ id: 'other', status: 'OFFER', salaryOffer: 1000 });
    expect(compareOffers(offer, other, [])?.bestOfferId).toBeNull();
    expect(compareOffers(offer, offer, [])).toBeNull();
    expect(compareOffers({ ...offer, salaryOffer: 0 }, other, [])).toBeNull();
    expect(compareOffers({ ...offer, salaryOffer: Number.NaN }, other, [])).toBeNull();
    render(<OfferComparatorView applications={[offer, { ...other, salaryOffer: 0 }]} kaptenSkills={[]} onGoToPipeline={vi.fn()} />);
    expect(screen.getByText(/butuh dua offer/i)).toBeTruthy();
  });

  it('rejects inherited work-mode names without producing NaN', () => {
    const valid = appWith({ id: 'a', status: 'OFFER', salaryOffer: 1000 });
    const invalid = appWith({ id: 'b', status: 'OFFER', salaryOffer: 1000, workMode: 'toString' as Application['workMode'] });
    expect(compareOffers(valid, invalid, [])).toBeNull();
    render(<OfferComparatorView applications={[valid, invalid]} kaptenSkills={[]} onGoToPipeline={vi.fn()} />);
    expect(screen.getByText(/butuh dua offer/i)).toBeTruthy();
  });

  it('displays only the final score rounded to one decimal place', () => {
    const offerA = appWith({ id: 'a', status: 'OFFER', salaryOffer: 6000000, requiredSkills: ['React', 'Go', 'Rust'] });
    const offerB = appWith({ id: 'b', status: 'OFFER', salaryOffer: 4500000, requiredSkills: ['React'] });
    render(<OfferComparatorView applications={[offerA, offerB]} kaptenSkills={['React']} onGoToPipeline={vi.fn()} />);
    expect(screen.getByText('83.3')).toBeTruthy();
    expect(screen.queryByText('8.3 / 25')).toBeNull();
  });

  it('deduplicates required skills and handles an empty list', () => {
    expect(calculateSkillMatch([' react '], ['React', ' REACT ', '', 'Go'])).toMatchObject({
      score: 50, totalRequired: 2, matchedSkills: ['React'], missingSkills: ['Go'],
    });
    expect(calculateSkillMatch([], ['', ' ']).score).toBe(0);
  });

  it('uses strict 14-day and 60-minute boundaries', () => {
    const now = Date.parse('2026-11-28T12:00:00Z');
    const app = appWith({ status: 'APPLIED', lastUpdatedAt: new Date(now - 14 * 86400000).toISOString() });
    expect(isGhostingRisk(app, now)).toBe(false);
    expect(isGhostingRisk(app, now + 1)).toBe(true);
    const a = appWith({ id: 'a', status: 'INTERVIEW', interviewDateTime: '2026-11-28T10:00' });
    expect(detectInterviewConflicts([a, appWith({ id: 'b', status: 'INTERVIEW', interviewDateTime: '2026-11-28T11:00' })])).toHaveLength(0);
    expect(detectInterviewConflicts([a, appWith({ id: 'b', status: 'INTERVIEW', interviewDateTime: '2026-11-28T10:59:59' })])).toHaveLength(1);
    expect(detectInterviewConflicts([a, appWith({ id: 'b', status: 'INTERVIEW', interviewDateTime: '2026-11-28T10:00' })])).toHaveLength(1);
  });

  it('does not reset ghosting age on checklist or note changes', () => {
    const app = appWith({ status: 'APPLIED', lastUpdatedAt: '2026-11-01T12:00:00.000Z' });
    const onUpdateApplication = vi.fn();
    const { container } = render(<ApplicationDetailModal application={app} isOpen onClose={vi.fn()} onUpdateApplication={onUpdateApplication} onDeleteApplication={vi.fn()} />);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(onUpdateApplication.mock.lastCall?.[0].lastUpdatedAt).toBe(app.lastUpdatedAt);
    fireEvent.change(screen.getByPlaceholderText('Tambah tugas persiapan'), { target: { value: ' Review ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));
    expect(onUpdateApplication.mock.lastCall?.[0].lastUpdatedAt).toBe(app.lastUpdatedAt);
    fireEvent.change(screen.getByPlaceholderText('Tulis catatan'), { target: { value: ' Follow up ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Catat' }));
    expect(onUpdateApplication.mock.lastCall?.[0].lastUpdatedAt).toBe(app.lastUpdatedAt);
  });

  it('deduplicates required skills on manual creation', () => {
    const onAddApplication = vi.fn();
    render(<AddApplicationModal isOpen onClose={vi.fn()} onAddApplication={onAddApplication} existingApplications={[]} />);
    fireEvent.change(screen.getByLabelText(/Nama perusahaan/), { target: { value: '  Example  ' } });
    fireEvent.change(screen.getByLabelText(/Posisi/), { target: { value: '  Intern  ' } });
    fireEvent.change(screen.getByLabelText(/Skill yang diminta/), { target: { value: 'React, react, , Go' } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan lamaran/i }));
    expect(onAddApplication.mock.lastCall?.[0]).toMatchObject({ company: 'Example', role: 'Intern', requiredSkills: ['React', 'Go'] });
  });

  it('assigns distinct IDs to two wishlist saves in the same millisecond', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(12345);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: [longJob, { ...longJob, id: 1000, title: 'Backend Intern' }] }),
    }));
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Lowongan' })[0]);
    fireEvent.click(await screen.findByRole('button', { name: /Simpan Frontend Intern di Test Company ke wishlist/i }));
    fireEvent.click(screen.getByRole('button', { name: /Simpan Backend Intern di Test Company ke wishlist/i }));
    const saved: Application[] = JSON.parse(window.localStorage.getItem('kapten_applications_v1')!);
    expect(saved.filter((app) => app.company === 'Test Company')).toHaveLength(2);
    expect(new Set(saved.map((app) => app.id)).size).toBe(saved.length);
  });

  it('reassigns a manual application ID that collides with existing data', () => {
    const generatedId = 'same-generated-id';
    vi.spyOn(window.crypto, 'randomUUID').mockReturnValue(generatedId as ReturnType<Crypto['randomUUID']>);
    window.localStorage.setItem('kapten_applications_v1', JSON.stringify([
      ...INITIAL_APPLICATIONS,
      appWith({ id: generatedId, company: 'Existing', role: 'Existing Role' }),
    ]));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Catat lamaran/i }));
    fireEvent.change(screen.getByLabelText(/Nama perusahaan/), { target: { value: 'New Company' } });
    fireEvent.change(screen.getByLabelText(/Posisi/), { target: { value: 'New Role' } });
    fireEvent.change(screen.getByLabelText(/Skill yang diminta/), { target: { value: 'React' } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan lamaran/i }));
    const saved: Application[] = JSON.parse(window.localStorage.getItem('kapten_applications_v1')!);
    expect(saved.find((app) => app.company === 'New Company')?.id).not.toBe(generatedId);
    expect(new Set(saved.map((app) => app.id)).size).toBe(saved.length);
  });

  it('only permits undo of the most recent of two rapid deletions', () => {
    vi.useFakeTimers();
    try {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Hapus lamaran Garuda FinTech' }));
      vi.advanceTimersByTime(1000);
      fireEvent.click(screen.getByRole('button', { name: 'Hapus lamaran Bintang Commerce' }));
      vi.advanceTimersByTime(4000);
      expect(screen.getByRole('button', { name: /Urungkan/i })).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: /Urungkan/i }));
      const apps: Application[] = JSON.parse(window.localStorage.getItem('kapten_applications_v1')!);
      expect(apps.some((app) => app.company === 'Garuda FinTech')).toBe(false);
      expect(apps.filter((app) => app.company === 'Bintang Commerce')).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears pending undo timers when App unmounts', () => {
    vi.useFakeTimers();
    try {
      const { unmount } = render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Hapus lamaran Garuda FinTech' }));
      expect(vi.getTimerCount()).toBe(2);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not restore a duplicate app ID when another tab has already restored it', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus lamaran Garuda FinTech' }));
    const apps: Application[] = JSON.parse(window.localStorage.getItem('kapten_applications_v1')!);
    const restored = [INITIAL_APPLICATIONS[0], ...apps];
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'kapten_applications_v1', newValue: JSON.stringify(restored),
    }));
    fireEvent.click(screen.getByRole('button', { name: /Urungkan/i }));
    expect(JSON.parse(window.localStorage.getItem('kapten_applications_v1')!).filter(
      (app: Application) => app.id === INITIAL_APPLICATIONS[0].id
    )).toHaveLength(1);
  });

  it('uses demo defaults when persisted applications are malformed', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem('kapten_applications_v1', '{not-json');
    render(<App />);
    expect(screen.getByRole('button', { name: 'Hapus lamaran Garuda FinTech' })).toBeTruthy();
  });

  it('rejects malformed backups without accepting partial data', () => {
    expect(parseBackup({ applications: [{ id: 'broken' }], kaptenSkills: [] })).toBeNull();
    expect(parseBackup({ applications: INITIAL_APPLICATIONS, kaptenSkills: [123] })).toBeNull();
    expect(parseBackup({ applications: INITIAL_APPLICATIONS, kaptenSkills: ['React'] })?.applications).toHaveLength(6);
  });

  it('rejects duplicate application IDs in backups and persisted arrays', () => {
    const a = appWith({ id: 'same', status: 'OFFER', salaryOffer: 1000 });
    const b = appWith({ id: 'same', status: 'OFFER', salaryOffer: 2000 });
    expect(parseBackup({ applications: [a, b], kaptenSkills: [] })).toBeNull();
    expect(isApplicationArray([a, b])).toBe(false);
    expect(isApplicationArray([a, { ...b, id: 'other', role: 'Other Role' }])).toBe(true);
    render(<OfferComparatorView applications={[a, b]} kaptenSkills={[]} onGoToPipeline={vi.fn()} />);
    expect(screen.getByText(/butuh dua offer/i)).toBeTruthy();
  });

  it('rejects duplicate company and role pairs in backups and persisted arrays', () => {
    const first = appWith({ id: 'first', company: ' Google ', role: 'Frontend Intern' });
    const second = appWith({ id: 'second', company: 'google', role: ' frontend intern ' });
    expect(isApplicationArray([first, second])).toBe(false);
    expect(parseBackup({ applications: [first, second], kaptenSkills: [] })).toBeNull();
    expect(parseBackup([first, second])).toBeNull();
    expect(isApplicationArray([first, { ...second, role: 'Backend Intern' }])).toBe(true);
  });

  it('rejects HTTP failures and malformed API responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: 'Unavailable' }));
    await expect(fetchJobsFromRemotive()).rejects.toThrow(/503/);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ jobs: null }) }));
    await expect(fetchJobsFromRemotive()).rejects.toThrow(/tidak valid/);
  });

  it('stops the interview timer at zero and clears it on unmount', () => {
    vi.useFakeTimers();
    try {
      const { unmount } = render(<InterviewPrepSection />);
      fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
      act(() => vi.advanceTimersByTime(121000));
      expect(screen.getByRole('timer').textContent).toBe('00:00');
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
