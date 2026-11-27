import { ApplicationStatus } from '../types';

export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  WISHLIST: ['APPLIED'],
  APPLIED: ['SCREENING', 'REJECTED', 'GHOSTED'],
  SCREENING: ['INTERVIEW', 'REJECTED', 'GHOSTED'],
  INTERVIEW: ['OFFER', 'REJECTED', 'GHOSTED'],
  GHOSTED: ['SCREENING', 'REJECTED'],
  OFFER: [],
  REJECTED: [],
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  GHOSTED: 'Ghosted',
};

export const canTransition = (
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
};

export const getNextStatuses = (
  currentStatus: ApplicationStatus
): ApplicationStatus[] => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

export interface TransitionValidationResult {
  valid: boolean;
  errorMessage?: string;
}

export const validateTransitionRequirements = (
  targetStatus: ApplicationStatus,
  data: {
    cvVersion?: string;
    appliedDate?: string;
    interviewDateTime?: string;
    salaryOffer?: number;
    workMode?: string;
  }
): TransitionValidationResult => {
  if (targetStatus === 'APPLIED') {
    if (!data.cvVersion || data.cvVersion.trim() === '') {
      return { valid: false, errorMessage: 'Versi CV (cvVersion) wajib diisi untuk status APPLIED.' };
    }
    if (!data.appliedDate || data.appliedDate.trim() === '') {
      return { valid: false, errorMessage: 'Tanggal melamar (appliedDate) wajib diisi untuk status APPLIED.' };
    }
  }

  if (targetStatus === 'INTERVIEW') {
    if (!data.interviewDateTime || data.interviewDateTime.trim() === '') {
      return { valid: false, errorMessage: 'Jadwal interview (interviewDateTime) wajib diisi untuk status INTERVIEW.' };
    }
    const parsed = Date.parse(data.interviewDateTime);
    if (isNaN(parsed)) {
      return { valid: false, errorMessage: 'Format jadwal interview tidak valid.' };
    }
  }

  if (targetStatus === 'OFFER') {
    if (data.salaryOffer === undefined || data.salaryOffer === null || data.salaryOffer <= 0) {
      return { valid: false, errorMessage: 'Nominal gaji/uang saku (salaryOffer) wajib lebih dari 0 untuk status OFFER.' };
    }
    if (!data.workMode || data.workMode.trim() === '') {
      return { valid: false, errorMessage: 'Mode kerja (workMode) wajib dipilih untuk status OFFER.' };
    }
  }

  return { valid: true };
};
