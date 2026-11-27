export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite';

export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'GHOSTED';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string or readable format
  message: string;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];
  cvVersion?: string;
  appliedDate?: string;
  interviewDateTime?: string; // Format YYYY-MM-DDTHH:mm
  salaryOffer?: number; // Nominal in Rp
  lastUpdatedAt: string; // ISO date string
  checklist: ChecklistItem[];
  activityLogs: ActivityLog[];
}

export interface JobListing {
  id: number | string;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  tags: string[];
  url?: string;
}

export interface RemotiveApiResponse {
  '0-legal-notice'?: string;
  'job-count'?: number;
  jobs?: JobListing[];
}

export interface InterviewConflict {
  app1: Application;
  app2: Application;
  diffMinutes: number;
}

export interface OfferComparisonResult {
  offer: Application;
  salaryScore: number; // Max 50
  workModeScore: number; // Max 25
  skillMatchScore: number; // Max 25
  totalScore: number; // Max 100
  matchedSkillsCount: number;
  totalSkillsCount: number;
  matchPercentage: number;
}
