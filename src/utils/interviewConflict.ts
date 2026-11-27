import { Application, InterviewConflict } from '../types';

export const detectInterviewConflicts = (
  applications: Application[]
): InterviewConflict[] => {
  // Only consider applications with status === 'INTERVIEW' and valid interviewDateTime
  const interviewApps = applications.filter(
    (app) => app.status === 'INTERVIEW' && Boolean(app.interviewDateTime)
  );

  const conflicts: InterviewConflict[] = [];

  for (let i = 0; i < interviewApps.length; i++) {
    for (let j = i + 1; j < interviewApps.length; j++) {
      const app1 = interviewApps[i];
      const app2 = interviewApps[j];

      const time1 = new Date(app1.interviewDateTime!).getTime();
      const time2 = new Date(app2.interviewDateTime!).getTime();

      if (isNaN(time1) || isNaN(time2)) continue;

      const exactDiffMinutes = Math.abs(time1 - time2) / (1000 * 60);

      if (exactDiffMinutes < 60) {
        conflicts.push({
          app1,
          app2,
          diffMinutes: Math.round(exactDiffMinutes),
        });
      }
    }
  }

  return conflicts;
};
