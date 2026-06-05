import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import SaveSearchButton from './SaveSearchButton';
import { JobListing } from '@/lib/types';

interface PageProps {
  searchParams: {
    search?: string;
    jobType?: string | string[];
    locationType?: string | string[];
    experienceLevel?: string | string[];
    salaryMin?: string;
    salaryMax?: string;
    page?: string;
  };
}

async function getJobs(searchParams: PageProps['searchParams']) {
  const search = searchParams.search || '';
  const jobTypes = Array.isArray(searchParams.jobType)
    ? searchParams.jobType
    : searchParams.jobType
    ? [searchParams.jobType]
    : [];
  const locationTypes = Array.isArray(searchParams.locationType)
    ? searchParams.locationType
    : searchParams.locationType
    ? [searchParams.locationType]
    : [];
  const experienceLevels = Array.isArray(searchParams.experienceLevel)
    ? searchParams.experienceLevel
    : searchParams.experienceLevel
    ? [searchParams.experienceLevel]
    : [];
  const salaryMin = searchParams.salaryMin ? parseInt(searchParams.salaryMin) : null;
  const salaryMax = searchParams.salaryMax ? parseInt(searchParams.salaryMax) : null;
  const page = parseInt(searchParams.page || '1');
  const pageSize = 10;

  const where: Prisma.JobWhereInput = { isActive: true };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { company: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (jobTypes.length > 0) where.jobType = { in: jobTypes };
  if (locationTypes.length > 0) where.locationType = { in: locationTypes };
  if (experienceLevels.length > 0) where.experienceLevel = { in: experienceLevels };
  if (salaryMin) where.salaryMax = { gte: salaryMin };
  if (salaryMax) where.salaryMin = { lte: salaryMax };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export default async function HomePage({ searchParams }: PageProps) {
  const { jobs, total, page, pageSize, totalPages } = await getJobs(searchParams);

  const currentFilters = {
    search: searchParams.search,
    jobType: Array.isArray(searchParams.jobType)
      ? searchParams.jobType
      : searchParams.jobType
      ? [searchParams.jobType]
      : [],
    locationType: Array.isArray(searchParams.locationType)
      ? searchParams.locationType
      : searchParams.locationType
      ? [searchParams.locationType]
      : [],
    experienceLevel: Array.isArray(searchParams.experienceLevel)
      ? searchParams.experienceLevel
      : searchParams.experienceLevel
      ? [searchParams.experienceLevel]
      : [],
    salaryMin: searchParams.salaryMin ? parseInt(searchParams.salaryMin) : undefined,
    salaryMax: searchParams.salaryMax ? parseInt(searchParams.salaryMax) : undefined,
  };

  const hasFilters =
    !!currentFilters.search ||
    currentFilters.jobType.length > 0 ||
    currentFilters.locationType.length > 0 ||
    currentFilters.experienceLevel.length > 0 ||
    !!currentFilters.salaryMin ||
    !!currentFilters.salaryMax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Find Your Next Opportunity
        </h1>
        <p className="text-lg text-gray-600">
          Browse {total}+ jobs across engineering, design, product, and more
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <div className="w-64 flex-shrink-0">
          <Suspense>
            <JobFilters />
          </Suspense>
        </div>

        {/* Job listings */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{total}</span> jobs found
              {searchParams.search && (
                <span> for &quot;{searchParams.search}&quot;</span>
              )}
            </p>
            {hasFilters && (
              <Suspense>
                <SaveSearchButton filters={currentFilters} />
              </Suspense>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job as unknown as JobListing} />
              ))}
            </div>
          )}

          <Suspense>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
