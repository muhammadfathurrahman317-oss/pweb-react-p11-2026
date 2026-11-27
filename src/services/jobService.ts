import { JobListing, RemotiveApiResponse } from '../types';

export const REMOTIVE_API_URL =
  'https://remotive.com/api/remote-jobs?category=software-dev&limit=30';
export const FALLBACK_LOCAL_URL = '/magang-fallback.json';

export type JobDataSource = 'remotive' | 'local';

export async function fetchJobsFromRemotive(
  signal?: AbortSignal
): Promise<JobListing[]> {
  const response = await fetch(REMOTIVE_API_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Gagal memuat lowongan dari Remotive API (Status: ${response.status} ${response.statusText})`
    );
  }

  const data = (await response.json()) as RemotiveApiResponse;
  if (!data.jobs || !Array.isArray(data.jobs)) {
    throw new Error('Format data Remotive API tidak valid.');
  }

  return data.jobs.map((job) => ({
    id: job.id,
    title: job.title || 'Posisi Magang',
    company_name: job.company_name || 'Perusahaan Teknologi',
    category: job.category || 'Software Development',
    candidate_required_location:
      job.candidate_required_location || 'Remote',
    salary: job.salary || 'Kompetitif',
    tags: Array.isArray(job.tags) ? job.tags : [],
    url: job.url,
  }));
}

export async function fetchJobsFromFallback(
  signal?: AbortSignal
): Promise<JobListing[]> {
  const response = await fetch(FALLBACK_LOCAL_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Gagal memuat dataset lokal fallback (Status: ${response.status})`
    );
  }

  const data = (await response.json()) as JobListing[];
  if (!Array.isArray(data)) {
    throw new Error('Format dataset lokal fallback tidak valid.');
  }

  return data;
}

export async function fetchJobs(
  source: JobDataSource,
  signal?: AbortSignal
): Promise<JobListing[]> {
  if (source === 'remotive') {
    return await fetchJobsFromRemotive(signal);
  } else {
    return await fetchJobsFromFallback(signal);
  }
}
