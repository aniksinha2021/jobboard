import { Suspense } from 'react';
import JobFilters from '@/components/JobFilters';
import SearchBar from '@/components/SearchBar';
import JobSearch from '@/components/JobSearch';
import SaveSearchButton from './SaveSearchButton';

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

export default function HomePage({ searchParams }: PageProps) {
  const hasFilters =
    !!searchParams.search ||
    !!searchParams.jobType ||
    !!searchParams.locationType ||
    !!searchParams.experienceLevel ||
    !!searchParams.salaryMin ||
    !!searchParams.salaryMax;

  const currentFilters = {
    search: searchParams.search,
    jobType: Array.isArray(searchParams.jobType)
      ? searchParams.jobType
      : searchParams.jobType ? [searchParams.jobType] : [],
    locationType: Array.isArray(searchParams.locationType)
      ? searchParams.locationType
      : searchParams.locationType ? [searchParams.locationType] : [],
    experienceLevel: Array.isArray(searchParams.experienceLevel)
      ? searchParams.experienceLevel
      : searchParams.experienceLevel ? [searchParams.experienceLevel] : [],
    salaryMin: searchParams.salaryMin ? parseInt(searchParams.salaryMin) : undefined,
    salaryMax: searchParams.salaryMax ? parseInt(searchParams.salaryMax) : undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Find Your Next Opportunity</h1>
        <p className="text-lg text-gray-600">Search across engineering, design, product, and more</p>
      </div>

      <div className="mb-6">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <Suspense>
            <JobFilters />
          </Suspense>
        </div>

        <div className="flex-1 min-w-0">
          {hasFilters && (
            <div className="flex justify-end mb-4">
              <Suspense>
                <SaveSearchButton filters={currentFilters} />
              </Suspense>
            </div>
          )}
          <Suspense>
            <JobSearch />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
