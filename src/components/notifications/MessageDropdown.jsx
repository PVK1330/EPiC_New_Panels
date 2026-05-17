import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X } from 'lucide-react';
import useMessaging from '../../hooks/useMessaging';

const MessageDropdown = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { threads, loading, fetchConversations, markThreadAsRead } = useMessaging();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Calculate total unread from threads
  const unreadCount = threads.reduce((acc, thread) => acc + (thread.unread || 0), 0);

  useEffect(() => {
    // Initial fetch handled by useMessaging for logged in user
    const interval = setInterval(() => {
      fetchConversations();
    }, 30000); // Poll every 30s as a fallback, sockets also update it

    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate(`/${user?.role || 'admin'}/messages`);
  };

  const handleThreadClick = (thread) => {
    setIsOpen(false);
    if (thread.unread > 0) {
      markThreadAsRead(thread.id);
    }
    navigate(`/${user?.role || 'admin'}/messages`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Messages"
      >
        <MessageSquare className="w-5 h-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full min-w-[1.25rem] h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Thread List */}
          <div className="max-h-[24rem] overflow-y-auto">
            {loading && threads.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading messages...</div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {threads.map((thread) => (
                  <div
                    key={thread.conversationId || thread.id}
                    onClick={() => handleThreadClick(thread)}
                    className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      thread.unread > 0 ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${thread.avatarClass || 'bg-blue-600'}`}>
                        {thread.initials}
                      </div>
                      {thread.unread > 0 && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${thread.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {thread.name}
                        </p>
                        <p className="text-xs text-gray-500">{thread.time}</p>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${thread.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {thread.preview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 mt-auto">
            <button
              onClick={handleViewAll}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;
