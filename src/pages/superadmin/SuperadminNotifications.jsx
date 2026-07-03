import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RiNotification3Line, RiCheckDoubleLine, RiFilter3Line, RiSettings4Line, RiHistoryLine, RiCheckLine } from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  fetchPlatformNotifications,
  markPlatformNotificationRead,
  markAllPlatformNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../services/superadminNotification.service';
import { formatDateLong, formatDateTime } from '../../utils/datetime';

const DEFAULT_PREFS = {
  subscription_events: true,
  organisation_events: true,
  team_events:         true,
  security_alerts:     true,
  billing_alerts:      true,
  system_updates:      false,
};

const PAGE_SIZE = 15;

// Filter options mirror the PlatformNotification `type` ENUM. "" means no filter.
const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

const SuperadminNotifications = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_PREFS);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (!isPreferencesOpen) return;
    setPrefsLoading(true);
    getNotificationPreferences()
      .then((res) => {
        const prefs = res.data?.data?.preferences;
        if (prefs) setNotifPrefs(prefs);
      })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, [isPreferencesOpen]);

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await updateNotificationPreferences(notifPrefs);
      toast.success('Notification preferences saved');
      setIsPreferencesOpen(false);
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPlatformNotifications({
        unreadOnly: activeTab === 'Unread' ? 'true' : 'false',
        ...(typeFilter ? { type: typeFilter } : {}),
        page,
        limit: PAGE_SIZE,
      });
      const data = res.data?.data || {};
      setNotifications(data.notifications || []);
      const p = data.pagination || {};
      const total = p.total ?? (data.notifications || []).length;
      const limit = p.limit ?? PAGE_SIZE;
      setPagination({
        total,
        page: p.page ?? page,
        limit,
        pages: p.pages ?? (limit ? Math.ceil(total / limit) : 0),
      });
    } catch (e) {
      console.error("Failed to load platform notifications:", e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, typeFilter]);

  // Switching the All/Unread tab or the type filter restarts paging from page 1
  // so we never request a page index that no longer exists for the new set.
  useEffect(() => {
    setPage(1);
  }, [activeTab, typeFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Close the filter dropdown when clicking outside of it.
  useEffect(() => {
    if (!filterOpen) return undefined;
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      try {
        await markPlatformNotificationRead(notif.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllPlatformNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // Re-sync from the server (authoritative) — keeps the Unread tab and
      // pagination totals correct after the bulk update.
      loadNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
      toast.error("Failed to mark all notifications as read");
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black text-secondary tracking-tight">System Alerts</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Review alerts, system events, and platform updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleMarkAllRead} className="text-[10px] font-black uppercase tracking-widest px-4 py-2">
            <RiCheckDoubleLine size={16} className="inline mr-1" /> Mark All Read
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreferencesOpen(true)}
            className="text-[10px] font-black uppercase tracking-widest px-4 py-2"
          >
            <RiSettings4Line size={16} className="inline mr-1" /> Preferences
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col relative min-h-[500px] overflow-hidden">
        {/* Header Controls */}
        <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
            {['All', 'Unread'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? 'bg-secondary text-white shadow-md'
                    : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={filterOpen}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 ${
                typeFilter || filterOpen ? 'text-secondary' : 'text-gray-400 hover:text-secondary'
              }`}
            >
              <RiFilter3Line size={14} className="inline" />
              {typeFilter
                ? TYPE_FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label
                : 'Filter'}
            </button>

            {filterOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-100 bg-white shadow-lg z-20 py-1"
              >
                {TYPE_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value || 'all'}
                    type="button"
                    role="menuitemradio"
                    aria-checked={typeFilter === opt.value}
                    onClick={() => {
                      setTypeFilter(opt.value);
                      setFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold tracking-wide transition-colors ${
                      typeFilter === opt.value
                        ? 'text-secondary bg-secondary/5'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                    {typeFilter === opt.value && <RiCheckLine size={14} className="text-secondary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading platform alerts...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex items-start gap-4 transition-all cursor-pointer group relative ${!notif.isRead ? 'bg-primary/[0.02]' : 'hover:bg-gray-50/50'}`}
                >
                  {!notif.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-110 ${
                    notif.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' :
                    notif.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    notif.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 
                    'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    <RiNotification3Line size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-0.5">
                      <h3 className={`text-sm tracking-tight ${!notif.isRead ? 'font-black text-secondary' : 'font-bold text-gray-600'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
                        {notif.created_at ? formatDateLong(notif.created_at, { month: 'short' }) : "N/A"}
                      </span>
                    </div>
                    <p className={`text-xs ${!notif.isRead ? 'text-gray-600 font-semibold' : 'text-gray-400 font-medium'} leading-relaxed max-w-4xl truncate`}>
                      {notif.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4 border border-gray-100 shadow-inner">
                <RiNotification3Line size={32} />
              </div>
              {typeFilter ? (
                <>
                  <p className="text-xs font-black text-secondary uppercase tracking-widest">No matching alerts</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
                    No {TYPE_FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label} alerts to display
                  </p>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('')}
                    className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Clear filter
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs font-black text-secondary uppercase tracking-widest">You're all caught up</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">No system alerts to display</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Pagination (auto-hidden when there's a single page) */}
        {!loading && pagination.pages > 1 && (
          <div className="border-t border-gray-50 px-4 py-3 bg-gray-50/30">
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <Modal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title="Alert Details"
        subtitle="System generated event information"
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end w-full">
            <Button onClick={() => setSelectedNotification(null)} className="px-6 py-2 text-xs font-black uppercase tracking-widest">
              Close
            </Button>
          </div>
        }
      >
        {selectedNotification && (
          <div className="py-4 space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${
                selectedNotification.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' :
                selectedNotification.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                selectedNotification.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 
                'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                <RiNotification3Line size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-secondary tracking-tight">{selectedNotification.title}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  {selectedNotification.created_at ? formatDateTime(selectedNotification.created_at) : "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600 font-semibold leading-relaxed">
                {selectedNotification.desc}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-4">
              <RiHistoryLine size={14} />
              <span>Event Logged via System Controller</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Notification Preferences Modal */}
      <Modal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        title="Notification Preferences"
        subtitle="Choose which platform events generate alerts for your account."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPreferencesOpen(false)}
              disabled={savingPrefs}
              className="px-5 py-2 text-xs font-black uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSavePreferences}
              disabled={savingPrefs || prefsLoading}
              className="px-6 py-2 text-xs font-black uppercase tracking-widest"
            >
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {prefsLoading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mr-3" />
              <span className="text-xs font-bold uppercase tracking-widest">Loading preferences...</span>
            </div>
          )}
          {!prefsLoading && [
            { key: 'subscription_events', label: 'Subscription Events',   desc: 'New subscriptions, renewals, cancellations' },
            { key: 'organisation_events', label: 'Organisation Events',   desc: 'Onboarding, suspension, deletion' },
            { key: 'team_events',         label: 'Team Events',           desc: 'Member invites, role changes, removals' },
            { key: 'security_alerts',     label: 'Security Alerts',       desc: 'Login failures, IP blocks, MFA events' },
            { key: 'billing_alerts',      label: 'Billing Alerts',        desc: 'Failed payments, invoice overdue' },
            { key: 'system_updates',      label: 'System Updates',        desc: 'Deployments, migrations, maintenance' },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50/60 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-secondary">{label}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifPrefs[key]}
                onClick={() => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  notifPrefs[key] ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    notifPrefs[key] ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminNotifications;
