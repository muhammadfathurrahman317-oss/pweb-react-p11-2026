import {
  ActivityLog,
  Application,
  ApplicationStatus,
  ChecklistItem,
  WorkMode,
} from '../types';

const WORK_MODES: readonly WorkMode[] = ['Remote', 'Hybrid', 'Onsite'];

const APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'GHOSTED',
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isWorkMode = (value: unknown): value is WorkMode =>
  typeof value === 'string' && (WORK_MODES as readonly string[]).includes(value);

const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  typeof value === 'string' &&
  (APPLICATION_STATUSES as readonly string[]).includes(value);

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === 'string';

const isOptionalFiniteNumber = (value: unknown): boolean =>
  value === undefined ||
  (typeof value === 'number' && Number.isFinite(value));

const isChecklistItem = (value: unknown): value is ChecklistItem =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.text === 'string' &&
  typeof value.done === 'boolean';

const isActivityLog = (value: unknown): value is ActivityLog =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.timestamp === 'string' &&
  typeof value.message === 'string';

export const isApplication = (value: unknown): value is Application =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.company === 'string' &&
  typeof value.role === 'string' &&
  isWorkMode(value.workMode) &&
  isApplicationStatus(value.status) &&
  Array.isArray(value.requiredSkills) &&
  value.requiredSkills.every((skill) => typeof skill === 'string') &&
  isOptionalString(value.cvVersion) &&
  isOptionalString(value.appliedDate) &&
  isOptionalString(value.interviewDateTime) &&
  isOptionalFiniteNumber(value.salaryOffer) &&
  typeof value.lastUpdatedAt === 'string' &&
  Array.isArray(value.checklist) &&
  value.checklist.every(isChecklistItem) &&
  Array.isArray(value.activityLogs) &&
  value.activityLogs.every(isActivityLog);

export const isApplicationArray = (value: unknown): value is Application[] => {
  if (!Array.isArray(value) || !value.every(isApplication)) return false;
  const ids = value.map((app: Application) => app.id);
  return new Set(ids).size === ids.length;
};

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';

export interface BackupPayload {
  applications: Application[];
  kaptenSkills: string[] | null;
}

export const parseBackup = (value: unknown): BackupPayload | null => {
  // Older backups were exported as a bare array of applications.
  if (Array.isArray(value)) {
    return isApplicationArray(value)
      ? { applications: value, kaptenSkills: null }
      : null;
  }

  if (!isRecord(value)) return null;

  const applications = value.applications;
  if (!isApplicationArray(applications)) return null;

  const skills = value.kaptenSkills;
  if (skills === undefined) {
    return { applications, kaptenSkills: null };
  }

  if (!isStringArray(skills)) return null;

  return { applications, kaptenSkills: skills };
};
