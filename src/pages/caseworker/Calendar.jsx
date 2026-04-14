import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Settings, Grid3x3, List, Calendar as CalendarIcon, Clock, MapPin, Users, Video, Phone, X, Edit, Trash2, Eye, UserCheck } from "lucide-react";
import MicrosoftConnect from "../../components/MicrosoftConnect";
import CreateMeetingModal from "../../components/CreateMeetingModal";
import { getUpcomingMeetings } from "../../services/teamsApi";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [teamsMeetings, setTeamsMeetings] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Fetch Teams meetings on component mount
  useEffect(() => {
    fetchTeamsMeetings();
  }, []);

  const fetchTeamsMeetings = async () => {
    try {
      setLoadingTeams(true);
      const response = await getUpcomingMeetings(30); // Get next 30 days
      setTeamsMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Failed to fetch Teams meetings:', error);
      setTeamsMeetings([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Mock events data
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Client Meeting - Ahmed Al-Rashid",
      date: new Date(2024, 3, 15, 10, 0),
      endDate: new Date(2024, 3, 15, 11, 0),
      type: "meeting",
      location: "Office Room 101",
      attendees: ["Ahmed Al-Rashid", "Caseworker"],
      description: "Discuss visa application progress",
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Document Review - Priya Sharma",
      date: new Date(2024, 3, 15, 14, 0),
      endDate: new Date(2024, 3, 15, 15, 0),
      type: "task",
      location: "Virtual",
      attendees: ["Priya Sharma"],
      description: "Review submitted documents",
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "UKVI Deadline - Carlos Mendes",
      date: new Date(2024, 3, 18, 23, 59),
      endDate: new Date(2024, 3, 18, 23, 59),
      type: "deadline",
      location: "System",
      attendees: ["Carlos Mendes"],
      description: "Application submission deadline",
      color: "bg-red-500"
    },
    {
      id: 4,
      title: "Team Meeting",
      date: new Date(2024, 3, 20, 9, 0),
      endDate: new Date(2024, 3, 20, 10, 0),
      type: "meeting",
      location: "Conference Room",
      attendees: ["Team"],
      description: "Weekly team sync",
      color: "bg-purple-500"
    },
    {
      id: 5,
      title: "Client Call - Mei Lin Chen",
      date: new Date(2024, 3, 22, 15, 30),
      endDate: new Date(2024, 3, 22, 16, 0),
      type: "call",
      location: "Phone",
      attendees: ["Mei Lin Chen"],
      description: "Follow-up call regarding application",
      color: "bg-amber-500"
    }
  ]);

  // Convert Teams meetings to event format
  const teamsEvents = teamsMeetings.map(meeting => ({
    id: `teams-${meeting.id}`,
    title: meeting.subject,
    date: new Date(meeting.start_time),
    endDate: new Date(meeting.end_time),
    type: 'teams',
    location: 'Microsoft Teams',
    attendees: meeting.attendees?.map(a => a.email) || [],
    description: meeting.description || '',
    color: 'bg-purple-500',
    joinUrl: meeting.join_url,
    isTeamsMeeting: true
  }));

  // Combine local events with Teams meetings
  const allEvents = [...events, ...teamsEvents];

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    duration: "30",
    type: "meeting",
    location: "",
    attendees: "",
    description: ""
  });

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Get events for a specific day
  const getEventsForDay = (day) => {
    if (!day) return [];
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Format month name
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get week days
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle day click
  const handleDayClick = (day) => {
    if (day) {
      setSelectedDate(day);
      setShowEventModal(true);
      setNewEvent(prev => ({
        ...prev,
        date: day.toISOString().split('T')[0],
        time: '09:00'
      }));
    }
  };

  // Handle event creation
  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const eventDateTime = new Date(`${newEvent.date}T${newEvent.time}`);
      const duration = parseInt(newEvent.duration);
      const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);
      
      const event = {
        id: events.length + 1,
        title: newEvent.title,
        date: eventDateTime,
        endDate: endDateTime,
        type: newEvent.type,
        location: newEvent.location,
        attendees: newEvent.attendees.split(',').map(a => a.trim()),
        description: newEvent.description,
        color: newEvent.type === 'meeting' ? 'bg-blue-500' : 
                newEvent.type === 'deadline' ? 'bg-red-500' : 
                newEvent.type === 'call' ? 'bg-amber-500' : 'bg-green-500'
      };
      
      setEvents([...events, event]);
      setShowEventModal(false);
      setNewEvent({
        title: "",
        date: "",
        time: "",
        duration: "30",
        type: "meeting",
        location: "",
        attendees: "",
        description: ""
      });
    }
  };

  // Handle event detail viewing
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  // Handle event deletion
  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
    setShowEventDetailModal(false);
  };

  // Format event time
  const formatEventTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get event type icon
  const getEventIcon = (type) => {
    switch(type) {
      case 'meeting': return <Users size={14} />;
      case 'call': return <Phone size={14} />;
      case 'deadline': return <Clock size={14} />;
      case 'teams': return <Video size={14} />;
      default: return <CalendarIcon size={14} />;
    }
  };

  // Filter events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return allEvents;
    return allEvents.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allEvents, searchQuery]);

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary">Calendar</h1>
          <p className="text-gray-500 mt-1">Schedule events, meetings, and deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => setShowTeamsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Video size={16} />
            Create Teams Meeting
          </button> */}
          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors"
          >
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      {/* Microsoft Teams Connection */}
      <MicrosoftConnect />

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-secondary min-w-[200px] text-center">
              {formatMonth(currentDate)}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* View Options */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'day' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'week' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'month' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              Month
            </button>
          </div>

          {/* Settings */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day && day.toDateString() === new Date().toDateString();
            const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 ${
                  !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                } ${isToday ? 'bg-blue-50' : ''} transition-colors`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-bold mb-2 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className={`text-xs p-1.5 rounded-md text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${event.color}`}
                          title={event.title}
                        >
                          <span className="flex items-center gap-1">
                            {getEventIcon(event.type)}
                            {event.title}
                          </span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div 
                          className="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                          onClick={() => handleDayClick(day)}
                        >
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-secondary">Upcoming Events</h3>
          <span className="text-xs text-gray-500">{filteredEvents.length} total events</span>
        </div>
        <div className="space-y-3">
          {filteredEvents
            .sort((a, b) => a.date - b.date)
            .slice(0, 5)
            .map(event => (
              <div 
                key={event.id} 
                onClick={() => handleEventClick(event)}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100 hover:border-gray-200"
              >
                <div className={`w-4 h-4 rounded-full ${event.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{event.title}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {event.date.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatEventTime(event.date)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <UserCheck size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {event.attendees.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                    event.type === 'call' ? 'bg-amber-100 text-amber-700' :
                    event.type === 'deadline' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {event.type}
                  </span>
                  <Eye size={14} className="text-gray-400" />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">New Event</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                    <select
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="call">Phone Call</option>
                      <option value="task">Task</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Office, Virtual, Phone, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Enter names separated by commas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    rows={3}
                    placeholder="Add event description..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">Event Details</h3>
                <button
                  onClick={() => setShowEventDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Event Header */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${selectedEvent.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {getEventIcon(selectedEvent.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedEvent.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                        selectedEvent.type === 'call' ? 'bg-amber-100 text-amber-700' :
                        selectedEvent.type === 'deadline' ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {selectedEvent.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedEvent.date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatEventTime(selectedEvent.date)} - {formatEventTime(selectedEvent.endDate)}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-bold text-gray-900">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.isTeamsMeeting && selectedEvent.joinUrl && (
                    <div className="flex items-center gap-3">
                      <Video size={16} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Join Meeting</p>
                        <a
                          href={selectedEvent.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-purple-600 hover:text-purple-700 underline"
                        >
                          {selectedEvent.joinUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Users size={16} className="text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Attendees</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedEvent.attendees.map((attendee, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                              {attendee}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Description</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowEventDetailModal(false);
                      // TODO: Implement edit functionality
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Teams Meeting Modal */}
      <CreateMeetingModal
        isOpen={showTeamsModal}
        onClose={() => setShowTeamsModal(false)}
        onSuccess={() => {
          fetchTeamsMeetings();
          setShowTeamsModal(false);
        }}
      />
    </div>
  );
};

export default Calendar;
