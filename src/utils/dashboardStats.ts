import { Application } from '../types';
import { isGhostingRisk } from './ghosting';

const reachedStage = (app: Application, stage: string): boolean =>
  app.activityLogs.some(({ message }) => {
    const transition = message.match(/^Status berubah: \w+ menjadi (\w+)\b/i);
    if (transition) return transition[1].toUpperCase() === stage;
    if (stage === 'INTERVIEW') {
      return /^Pindah ke INTERVIEW\b|^Lolos Screening dan lanjut Interview\b/i.test(message);
    }
    if (stage === 'SCREENING') {
      return /^Pindah ke SCREENING\b|^Dipulihkan dari GHOSTED kembali ke SCREENING\b|^(?:Masuk|Lolos) tahap Screening\b|^Lolos Screening dan lanjut Interview\b/i.test(message);
    }
    if (stage === 'OFFER') {
      return /^Menerima (?:penawaran OFFER|tawaran OFFER)\b|^Mendapat Surat Penawaran\b/i.test(message);
    }
    return stage === 'REJECTED' && /^Lamaran ditolak\b/i.test(message);
  });

const hasResponse = (app: Application): boolean =>
  ['SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(app.status) ||
  ['SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'].some((stage) => reachedStage(app, stage));

const hasInterview = (app: Application): boolean =>
  ['INTERVIEW', 'OFFER'].includes(app.status) ||
  ['INTERVIEW', 'OFFER'].some((stage) => reachedStage(app, stage));

export const calculateDashboardStats = (applications: Application[], now = Date.now()) => {
  const submitted = applications.filter((app) => app.status !== 'WISHLIST');
  const responseCount = submitted.filter(hasResponse).length;
  const interviewCount = submitted.filter(hasInterview).length;
  const submittedCount = submitted.length;

  return {
    totalApplications: applications.length,
    activeInPipeline: applications.filter(
      (app) => app.status !== 'OFFER' && app.status !== 'REJECTED'
    ).length,
    submittedCount,
    responseCount,
    responseRate: submittedCount ? Math.round((responseCount / submittedCount) * 100) : 0,
    interviewCount,
    interviewRate: submittedCount ? Math.round((interviewCount / submittedCount) * 100) : 0,
    ghostingRiskCount: applications.filter((app) => isGhostingRisk(app, now)).length,
    offerCount: applications.filter((app) => app.status === 'OFFER').length,
  };
};