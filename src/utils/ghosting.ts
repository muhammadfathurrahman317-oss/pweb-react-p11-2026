import { Application } from '../types';

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export const isGhostingRisk = (app: Application, now = Date.now()): boolean => {
  if (app.status !== 'APPLIED' && app.status !== 'SCREENING') {
    return false;
  }

  const updatedTime = new Date(app.lastUpdatedAt).getTime();
  if (isNaN(updatedTime)) return false;

  return now - updatedTime > FOURTEEN_DAYS_MS;
};

export const getDaysSinceUpdate = (
  lastUpdatedAt: string,
  now = Date.now()
): number => {
  const updatedTime = new Date(lastUpdatedAt).getTime();
  if (isNaN(updatedTime)) return 0;
  const diffDays = Math.floor((now - updatedTime) / (24 * 60 * 60 * 1000));
  return Math.max(0, diffDays);
};
