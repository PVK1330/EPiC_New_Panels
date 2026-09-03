import React, { useState, useEffect, useCallback } from 'react';
import { getGlobalTimeline } from '../../services/timeline.service';
import socketService from '../../services/socket.service';
import { formatDateTime } from '../../utils/datetime';

const TimelineExplorer = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTimeline = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const res = await getGlobalTimeline({ page: pageNum, limit: 20 });
      if (res.data.length < 20) setHasMore(false);
      
      setEvents(prev => {
        const newEvents = res.data.filter(newEvent => !prev.some(e => e.id === newEvent.id));
        return pageNum === 1 ? res.data : [...prev, ...newEvents];
      });
    } catch (err) {
      console.error('Failed to fetch timeline', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline(1);
    
    // Real-time updates
    const handleNewTimelineEvent = (data) => {
      setEvents(prev => [data, ...prev]);
    };
    
    socketService.on('timeline:update', handleNewTimelineEvent);
    
    return () => {
      socketService.off('timeline:update', handleNewTimelineEvent);
    };
  }, [fetchTimeline]);

  return (
    <div className="p-6 max-w-4xl mx-auto dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Timeline Explorer</h1>
      
      {/* Filters Placeholder */}
      <div className="flex gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <input type="text" placeholder="Search events..." className="border p-2 rounded w-full dark:bg-gray-700 dark:border-gray-600" />
        <select className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600">
          <option value="">All Entities</option>
          <option value="case">Cases</option>
          <option value="candidate">Clients</option>
        </select>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {events.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-10">No events found.</div>
        )}
        
        {events.map((event) => (
          <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 p-4 rounded border border-slate-200 dark:border-gray-700 shadow">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-slate-900 dark:text-white">{event.action_type?.replace(/_/g, ' ').toUpperCase()}</div>
                <time className="font-caveat font-medium text-indigo-500">{formatDateTime(event.created_at)}</time>
              </div>
              <div className="text-slate-500 dark:text-gray-300">{event.description}</div>
              <div className="text-sm mt-2 text-gray-400">By: {event.performer?.first_name} {event.performer?.last_name}</div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center mt-6">
          <button 
            onClick={() => setPage(p => p + 1)} 
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineExplorer;
