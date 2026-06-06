'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import JobCard from './JobCard';
import Pagination from './Pagination';
import { JobListing } from '@/lib/types';

interface SearchResult {
  jobs: JobListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function JobSearch() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const hasFilters =
    !!searchParams.get('search') ||
    searchParams.getAll('jobType').length > 0 ||
    searchParams.getAll('locationType').length > 0 ||
    searchParams.getAll('experienceLevel').length > 0 ||
    !!searchParams.get('salaryMin') ||
    !!searchParams.get('salaryMax');

  const fetchJobs = useCallback(async () => {
    if (!hasFilters) {
      setResult(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/search?${searchParams.toString()}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setResult({ jobs: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams, hasFilters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  if (!hasFilters) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
        <svg className="w-14 h-14 text-blue-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Search for jobs to get started</h3>
        <p className="text-gray-500 text-sm">Type a keyword above or pick filters on the left to browse openings</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
        <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Searching for the latest jobs...</p>
      </div>
    );
  }

  if (!result || result.jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4 mb-4">
        {result.jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
