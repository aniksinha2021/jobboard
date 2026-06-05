'use client';

import Link from 'next/link';
import { AlertData } from '@/lib/types';

interface AlertCardProps {
  alert: AlertData;
  onMarkRead: (id: string) => void;
}

export default function AlertCard({ alert, onMarkRead }: AlertCardProps) {
  const handleMarkRead = async () => {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId: alert.id, isRead: true }),
    });
    if (res.ok) {
      onMarkRead(alert.id);
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${alert.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!alert.isRead && (
              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
            )}
            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Link href={`/jobs/${alert.job.id}`} className="text-blue-600 hover:underline">
              View job →
            </Link>
            <span>Search: {alert.savedSearch.name}</span>
            <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {!alert.isRead && (
          <button
            onClick={handleMarkRead}
            className="ml-3 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 flex-shrink-0"
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}
