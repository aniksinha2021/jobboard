'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { JOB_TYPES, LOCATION_TYPES, EXPERIENCE_LEVELS } from '@/lib/types';

export default function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedJobTypes = searchParams.getAll('jobType');
  const selectedLocationTypes = searchParams.getAll('locationType');
  const selectedExperienceLevels = searchParams.getAll('experienceLevel');
  const salaryMin = searchParams.get('salaryMin') || '';
  const salaryMax = searchParams.get('salaryMax') || '';

  const updateParam = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.getAll(key);
    params.delete(key);
    if (checked) {
      [...existing, value].forEach((v) => params.append(key, v));
    } else {
      existing.filter((v) => v !== value).forEach((v) => params.append(key, v));
    }
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  };

  const updateSalary = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    router.push(`/?${params.toString()}`);
  };

  const hasFilters =
    selectedJobTypes.length > 0 ||
    selectedLocationTypes.length > 0 ||
    selectedExperienceLevels.length > 0 ||
    salaryMin ||
    salaryMax;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Job Type */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Job Type</h4>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {JOB_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedJobTypes.includes(type)}
                onChange={(e) => updateParam('jobType', type, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Type */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
        <div className="space-y-1.5">
          {LOCATION_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLocationTypes.includes(type)}
                onChange={(e) => updateParam('locationType', type, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h4>
        <div className="space-y-1.5">
          {EXPERIENCE_LEVELS.map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedExperienceLevels.includes(level)}
                onChange={(e) => updateParam('experienceLevel', level, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Salary Range (USD/yr)</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Salary</label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => updateSalary('salaryMin', e.target.value)}
              placeholder="e.g. 60000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max Salary</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => updateSalary('salaryMax', e.target.value)}
              placeholder="e.g. 150000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
