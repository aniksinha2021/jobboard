import Link from 'next/link';
import { JobListing } from '@/lib/types';

interface JobCardProps {
  job: JobListing;
}

const locationTypeColors: Record<string, string> = {
  REMOTE: 'bg-green-100 text-green-800',
  ONSITE: 'bg-blue-100 text-blue-800',
  HYBRID: 'bg-purple-100 text-purple-800',
};

const experienceColors: Record<string, string> = {
  entry: 'bg-yellow-100 text-yellow-800',
  mid: 'bg-orange-100 text-orange-800',
  senior: 'bg-red-100 text-red-800',
  lead: 'bg-pink-100 text-pink-800',
};

function formatSalary(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n >= 1000) return `$${Math.round(n / 1000)}k`;
    return `$${n}`;
  };
  return `${fmt(min)} – ${fmt(max)}`;
}

function timeAgo(date: string): string {
  const now = new Date();
  const posted = new Date(date);
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <Link
              href={`/jobs/${job.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate pr-2"
            >
              {job.title}
            </Link>
          </div>
          <p className="text-base text-gray-600 font-medium mb-3">{job.company}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {job.jobType}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${locationTypeColors[job.locationType] || 'bg-gray-100 text-gray-700'}`}>
              {job.locationType}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${experienceColors[job.experienceLevel] || 'bg-gray-100 text-gray-700'}`}>
              {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {timeAgo(job.postedAt)}
            </span>
          </div>
        </div>

        <div className="ml-4 flex-shrink-0">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply
          </a>
        </div>
      </div>
    </div>
  );
}
