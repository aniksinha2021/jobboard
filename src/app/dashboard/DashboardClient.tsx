'use client';

import { useState } from 'react';
import SavedSearchCard from '@/components/SavedSearchCard';
import AlertCard from '@/components/AlertCard';
import { SavedSearchData, AlertData } from '@/lib/types';

interface DashboardClientProps {
  initialSavedSearches: SavedSearchData[];
  initialAlerts: AlertData[];
  userName: string;
}

export default function DashboardClient({
  initialSavedSearches,
  initialAlerts,
  userName,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'searches' | 'alerts'>('searches');
  const [savedSearches, setSavedSearches] = useState<SavedSearchData[]>(initialSavedSearches);
  const [alerts, setAlerts] = useState<AlertData[]>(initialAlerts);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleDeleteSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSearch = (id: string, data: Partial<SavedSearchData>) => {
    setSavedSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  };

  const handleMarkAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
  };

  const markAllRead = async () => {
    const unreadAlerts = alerts.filter((a) => !a.isRead);
    await Promise.all(
      unreadAlerts.map((a) =>
        fetch('/api/alerts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId: a.id, isRead: true }),
        })
      )
    );
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {userName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Saved Searches</p>
          <p className="text-3xl font-bold text-gray-900">{savedSearches.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Active Alerts</p>
          <p className="text-3xl font-bold text-gray-900">
            {savedSearches.filter((s) => s.alertEnabled).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Unread Notifications</p>
          <p className="text-3xl font-bold text-blue-600">{unreadCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('searches')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'searches'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Saved Searches
            {savedSearches.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                {savedSearches.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Alerts
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-600 text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'searches' ? (
        <div className="space-y-4">
          {savedSearches.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No saved searches yet</h3>
              <p className="text-gray-500 mb-4">
                Go to the job board, apply filters, and save your search to get started.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </a>
            </div>
          ) : (
            savedSearches.map((search) => (
              <SavedSearchCard
                key={search.id}
                savedSearch={search}
                onDelete={handleDeleteSearch}
                onUpdate={handleUpdateSearch}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No alerts yet</h3>
              <p className="text-gray-500">
                Enable email alerts on a saved search to receive notifications about new matching jobs.
              </p>
            </div>
          ) : (
            <>
              {unreadCount > 0 && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={markAllRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkRead={handleMarkAlertRead}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
