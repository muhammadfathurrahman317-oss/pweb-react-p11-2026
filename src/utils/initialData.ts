import { Application } from '../types';

export const INITIAL_KAPTEN_SKILLS: string[] = [
  'React',
  'TypeScript',
  'CSS',
  'Git',
  'REST API',
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-init-1',
    company: 'Garuda FinTech',
    role: 'Full-Stack Web Developer Intern',
    workMode: 'Remote',
    status: 'INTERVIEW',
    requiredSkills: ['React', 'TypeScript', 'PostgreSQL', 'Express', 'Prisma'],
    cvVersion: 'CV-Kapten-v2.pdf',
    appliedDate: '2026-11-10',
    interviewDateTime: '2026-11-28T10:00',
    lastUpdatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    checklist: [
      { id: 'chk-1', text: 'Sesuaikan CV dengan proyek React + TypeScript', done: true },
      { id: 'chk-2', text: 'Riset produk & tech-stack Garuda FinTech', done: true },
      { id: 'chk-3', text: 'Latihan soal teknis React Hooks & REST API', done: true },
      { id: 'chk-4', text: 'Siapkan pertanyaan balik untuk pewawancara', done: false },
    ],
    activityLogs: [
      { id: 'log-1', timestamp: '2026-11-09T09:05:00.000Z', message: 'Disimpan ke Wishlist dari Katalog' },
      { id: 'log-2', timestamp: '2026-11-10T14:20:00.000Z', message: 'Lamaran dikirim (CV: CV-Kapten-v2.pdf)' },
      { id: 'log-3', timestamp: '2026-11-15T10:00:00.000Z', message: 'Lolos tahap Screening' },
      { id: 'log-4', timestamp: '2026-11-19T16:15:00.000Z', message: 'Pindah ke Interview (jadwal: 28 Nov 2026, 10:00)' },
    ],
  },
  {
    id: 'app-init-2',
    company: 'Bintang Commerce',
    role: 'Software Engineer Intern (Web Platform)',
    workMode: 'Remote',
    status: 'OFFER',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'Git', 'Testing'],
    cvVersion: 'CV-Kapten-v2.pdf',
    appliedDate: '2026-11-05',
    interviewDateTime: '2026-11-18T14:00',
    salaryOffer: 6000000,
    lastUpdatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    checklist: [
      { id: 'chk-21', text: 'Pelajari Cypress & Jest testing suite', done: true },
      { id: 'chk-22', text: 'Kirim dokumen penawaran kontrak magang', done: true },
    ],
    activityLogs: [
      { id: 'log-21', timestamp: '2026-11-05T08:00:00.000Z', message: 'Lamaran dikirim ke Bintang Commerce' },
      { id: 'log-22', timestamp: '2026-11-12T11:00:00.000Z', message: 'Lolos Screening dan lanjut Interview' },
      { id: 'log-23', timestamp: '2026-11-20T15:30:00.000Z', message: 'Mendapat Surat Penawaran (Offer Rp 6.000.000)' },
    ],
  },
  {
    id: 'app-init-3',
    company: 'Nusantara Cloud Tech',
    role: 'Frontend Engineering Intern (React & TypeScript)',
    workMode: 'Hybrid',
    status: 'OFFER',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'Git', 'REST API'],
    cvVersion: 'CV-Kapten-v1.pdf',
    appliedDate: '2026-11-02',
    interviewDateTime: '2026-11-14T09:30',
    salaryOffer: 4500000,
    lastUpdatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    checklist: [
      { id: 'chk-31', text: 'Review arsitektur Micro-Frontend', done: true },
      { id: 'chk-32', text: 'Bandingkan dengan tawaran lain di Offer Comparator', done: false },
    ],
    activityLogs: [
      { id: 'log-31', timestamp: '2026-11-02T10:00:00.000Z', message: 'Lamaran dikirim' },
      { id: 'log-32', timestamp: '2026-11-16T17:00:00.000Z', message: 'Menerima tawaran OFFER (Rp 4.500.000)' },
    ],
  },
  {
    id: 'app-init-4',
    company: 'AwanMerdeka Cloud',
    role: 'DevOps & Cloud Infrastructure Intern',
    workMode: 'Remote',
    status: 'SCREENING',
    requiredSkills: ['Git', 'PostgreSQL', 'Linux', 'Docker', 'CI/CD'],
    cvVersion: 'CV-Kapten-v2.pdf',
    appliedDate: '2026-11-08',
    // 16 days ago -> will trigger Rawan Ghosting by default!
    lastUpdatedAt: new Date(Date.now() - 16 * 86400000).toISOString(),
    checklist: [
      { id: 'chk-41', text: 'Pelajari dasar Docker Compose', done: true },
      { id: 'chk-42', text: 'Follow-up HRD jika belum ada kabar', done: false },
    ],
    activityLogs: [
      { id: 'log-41', timestamp: '2026-11-08T09:00:00.000Z', message: 'Lamaran dikirim' },
      { id: 'log-42', timestamp: '2026-11-10T11:00:00.000Z', message: 'Masuk tahap Screening HR' },
    ],
  },
  {
    id: 'app-init-5',
    company: 'Tokopay Nusantara',
    role: 'Backend Engineering Intern (Go & Node.js)',
    workMode: 'Onsite',
    status: 'APPLIED',
    requiredSkills: ['Go', 'Node.js', 'PostgreSQL', 'Docker', 'REST API'],
    cvVersion: 'CV-Kapten-v1.pdf',
    appliedDate: '2026-11-06',
    // 18 days ago -> also Rawan Ghosting by default!
    lastUpdatedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    checklist: [
      { id: 'chk-51', text: 'Review konsep RESTful API dan Database Indexing', done: false },
    ],
    activityLogs: [
      { id: 'log-51', timestamp: '2026-11-06T13:30:00.000Z', message: 'Lamaran dikirim melalui website karir' },
    ],
  },
  {
    id: 'app-init-6',
    company: 'EduSpark Indonesia',
    role: 'Frontend Web Intern (Next.js)',
    workMode: 'Remote',
    status: 'WISHLIST',
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Tailwind CSS'],
    lastUpdatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    checklist: [
      { id: 'chk-61', text: 'Siapkan portfolio Next.js App Router', done: false },
    ],
    activityLogs: [
      { id: 'log-61', timestamp: '2026-11-25T14:00:00.000Z', message: 'Disimpan ke Wishlist' },
    ],
  },
];
