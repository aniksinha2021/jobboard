'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SavedSearchData, ALERT_FREQUENCIES } from '@/lib/types';

interface SavedSearchCardProps {
  savedSearch: SavedSearchData;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<SavedSearchData>) => void;
}

export default function SavedSearchCard({ savedSearch, onDelete, onUpdate }: SavedSearchCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/saved-searches/${savedSearch.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDelete(savedSearch.id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAlert = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/saved-searches/${savedSearch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertEnabled: !savedSearch.alertEnabled }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(savedSearch.id, updated);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFrequencyChange = async (freq: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/saved-searches/${savedSearch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertFrequency: freq }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(savedSearch.id, updated);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const applySearch = () => {
    const filters = savedSearch.filters;
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.jobType?.length) filters.jobType.forEach((t) => params.append('jobType', t));
    if (filters.locationType?.length) filters.locationType.forEach((t) => params.append('locationType', t));
    if (filters.experienceLevel?.length) filters.experienceLevel.forEach((t) => params.append('experienceLevel', t));
    if (filters.salaryMin) params.set('salaryMin', filters.salaryMin.toString());
    if (filters.salaryMax) params.set('salaryMax', filters.salaryMax.toString());
    router.push(`/?${params.toString()}`);
  };

  const filterSummary = () => {
    const parts: string[] = [];
    if (savedSearch.filters.search) parts.push(`"${savedSearch.filters.search}"`);
    if (savedSearch.filters.jobType?.length) parts.push(savedSearch.filters.jobType.join(', '));
    if (savedSearch.filters.locationType?.length) parts.push(savedSearch.filters.locationType.join(', '));
    if (savedSearch.filters.experienceLevel?.length) parts.push(savedSearch.filters.experienceLevel.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', '));
    if (savedSearch.filters.salaryMin || savedSearch.filters.salaryMax) {
      const min = savedSearch.filters.salaryMin ? `$${(savedSearch.filters.salaryMin / 1000).toFixed(0)}k` : 'any';
      const max = savedSearch.filters.salaryMax ? `$${(savedSearch.filters.salaryMax / 1000).toFixed(0)}k` : 'any';
      parts.push(`${min}–${max}`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'No filters';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{savedSearch.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{filterSummary()}</p>
        </div>
        <div className="flex gap-2 ml-2">
          <button
            onClick={applySearch}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isDeleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={handleToggleAlert}
            className={`relative w-10 h-5 rounded-full transition-colors ${savedSearch.alertEnabled ? 'bg-blue-600' : 'bg-gray-300'} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${savedSearch.alertEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-gray-600">Email alerts</span>
        </label>

        {savedSearch.alertEnabled && (
          <select
            value={savedSearch.alertFrequency}
            onChange={(e) => handleFrequencyChange(e.target.value)}
            disabled={isUpdating}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {ALERT_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        )}

        <span className="text-xs text-gray-400 ml-auto">
          Saved {new Date(savedSearch.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
