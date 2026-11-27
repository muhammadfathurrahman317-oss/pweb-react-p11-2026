import { useCallback, useEffect, useState } from 'react';
import { JobListing } from '../types';
import { fetchJobs, JobDataSource } from '../services/jobService';

interface UseJobsResult {
  jobs: JobListing[];
  isLoading: boolean;
  errorMessage: string | null;
  retry: () => void;
}

export function useJobs(source: JobDataSource): UseJobsResult {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<number>(0);

  const retry = useCallback(() => {
    setAttempt((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // The controller lives inside the effect so the cleanup runs while the
    // request is still in flight. Returning it from an async function (the old
    // approach) only aborts after the response already arrived.
    const controller = new AbortController();
    let cancelled = false;

    setIsLoading(true);
    setErrorMessage(null);

    fetchJobs(source, controller.signal)
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch((error: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memuat lowongan.'
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [source, attempt]);

  return { jobs, isLoading, errorMessage, retry };
}
