import React, { useState, useEffect, useCallback } from 'react';
import { RiNotification3Line, RiCheckDoubleLine, RiFilter3Line, RiSettings4Line, RiHistoryLine } from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import { motion } from 'framer-motion';
import {
  fetchPlatformNotifications,
  markPlatformNotificationRead,
  markAllPlatformNotificationsRead
} from '../../services/superadminNotification.service';
import { formatDateLong, formatDateTime } from '../../utils/datetime';

const SuperadminNotifications = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPlatformNotifications({
        unreadOnly: activeTab === 'Unread' ? 'true' : 'false'
      });
      const list = res.data?.data?.notifications || [];
      setNotifications(list);
    } catch (e) {
      console.error("Failed to load platform notifications:", e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
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
          <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest px-4 py-2">
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
          <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors">
            <RiFilter3Line size={14} className="inline mr-1" /> Filter
          </button>
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
              <p className="text-xs font-black text-secondary uppercase tracking-widest">You're all caught up</p>
              <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">No system alerts to display</p>
            </div>
          )}
        </div>
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
    </div>
  );
};

export default SuperadminNotifications;
