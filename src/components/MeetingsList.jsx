import { useState, useEffect } from 'react';
import { getTeamsMeetings, cancelTeamsMeeting, syncTeamsMeetings } from '../services/teamsApi';
import { Video, Calendar, Clock, Users, ExternalLink, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import Button from './Button';

const MeetingsList = ({ userId }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchMeetings();
  }, [filter]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filter === 'upcoming') {
        params.start_date = new Date().toISOString();
        params.end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      const response = await getTeamsMeetings(params);
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncTeamsMeetings();
      await fetchMeetings();
    } catch (error) {
      console.error('Failed to sync meetings:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleCancel = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) {
      return;
    }

    try {
      await cancelTeamsMeeting(meetingId);
      await fetchMeetings();
    } catch (error) {
      console.error('Failed to cancel meeting:', error);
      alert('Failed to cancel meeting');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const isMeetingPast = (endTime) => {
    return new Date(endTime) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Teams Meetings</h2>
          <p className="text-sm text-gray-500">Manage your Microsoft Teams meetings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {['all', 'upcoming', 'past'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No meetings found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'upcoming' ? 'No upcoming meetings scheduled' : 'Create your first meeting to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings
            .filter(meeting => {
              if (filter === 'upcoming') return !isMeetingPast(meeting.end_time);
              if (filter === 'past') return isMeetingPast(meeting.end_time);
              return true;
            })
            .map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{meeting.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>

                    {meeting.description && (
                      <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(meeting.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(meeting.end_time) - new Date(meeting.start_time) > 0
                            ? `${Math.round((new Date(meeting.end_time) - new Date(meeting.start_time)) / 60000)} min`
                            : 'Duration not set'}
                        </span>
                      </div>
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {meeting.join_url && (
                      <div className="mt-4">
                        <a
                          href={meeting.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <Video className="w-4 h-4" />
                          Join Meeting
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {meeting.status === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(meeting.id)}
                      className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MeetingsList;
