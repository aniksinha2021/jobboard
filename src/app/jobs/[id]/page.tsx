import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: { id: string };
}

export default async function JobDetailPage({ params }: PageProps) {
  const job = await prisma.job.findUnique({ where: { id: params.id } });

  if (!job) notFound();

  const locationTypeColors: Record<string, string> = {
    REMOTE: 'bg-green-100 text-green-800',
    ONSITE: 'bg-blue-100 text-blue-800',
    HYBRID: 'bg-purple-100 text-purple-800',
  };

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
    return `${fmt(min)} – ${fmt(max)} / year`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to jobs
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
            <p className="text-lg text-gray-600 font-medium">{job.company}</p>
          </div>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Now
          </a>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatSalary(job.salaryMin, job.salaryMax)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            {job.jobType}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${locationTypeColors[job.locationType] || 'bg-gray-100 text-gray-700'}`}>
            {job.locationType}
          </span>
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 capitalize">
            {job.experienceLevel} Level
          </span>
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
            Posted {new Date(job.postedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="prose prose-gray max-w-none">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About the Role</h2>
          <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">
            {job.description}
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
            {job.requirements}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Apply for this position
          </a>
        </div>
      </div>
    </div>
  );
}
