import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Settings, Grid3x3, List, Calendar as CalendarIcon, Clock, MapPin, Users, Video, Phone, X, Edit, Trash2, Eye, UserCheck, CheckCircle2 } from "lucide-react";
import MicrosoftConnect from "../../components/MicrosoftConnect";
import CreateMeetingModal from "../../components/CreateMeetingModal";
import { getUpcomingMeetings } from "../../services/teamsApi";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [teamsMeetings, setTeamsMeetings] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const today = new Date();

  useEffect(() => {
    fetchTeamsMeetings();
  }, []);

  const fetchTeamsMeetings = async () => {
    try {
      setLoadingTeams(true);
      const response = await getUpcomingMeetings(30);
      setTeamsMeetings(response.data.meetings || []);
    } catch (error) {
      console.error("Failed to fetch Teams meetings:", error);
      setTeamsMeetings([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Mock events data — includes past months for completed meetings display
  const [events, setEvents] = useState([
    // ── Past / Completed events (previous months) ──────────────────────────
    {
      id: 101,
      title: "Visa Consultation - Omar Hassan",
      date: new Date(today.getFullYear(), today.getMonth() - 1, 5, 10, 0),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 5, 11, 0),
      type: "meeting",
      location: "Office Room 101",
      attendees: ["Omar Hassan", "Caseworker"],
      description: "Initial visa consultation",
      color: "bg-blue-500",
      completed: true,
    },
    {
      id: 102,
      title: "Document Submission - Fatima Al-Zahra",
      date: new Date(today.getFullYear(), today.getMonth() - 1, 12, 14, 0),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 12, 15, 0),
      type: "task",
      location: "Virtual",
      attendees: ["Fatima Al-Zahra"],
      description: "Document submission review",
      color: "bg-green-500",
      completed: true,
    },
    {
      id: 103,
      title: "Team Sync",
      date: new Date(today.getFullYear(), today.getMonth() - 1, 18, 9, 0),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 18, 10, 0),
      type: "meeting",
      location: "Conference Room",
      attendees: ["Team"],
      description: "Monthly team meeting",
      color: "bg-purple-500",
      completed: true,
    },
    {
      id: 104,
      title: "Client Call - Ibrahim Khalil",
      date: new Date(today.getFullYear(), today.getMonth() - 1, 22, 15, 0),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 22, 15, 30),
      type: "call",
      location: "Phone",
      attendees: ["Ibrahim Khalil"],
      description: "Follow-up on pending documents",
      color: "bg-amber-500",
      completed: true,
    },
    {
      id: 105,
      title: "UKVI Deadline - Sara Youssef",
      date: new Date(today.getFullYear(), today.getMonth() - 1, 28, 23, 59),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 28, 23, 59),
      type: "deadline",
      location: "System",
      attendees: ["Sara Youssef"],
      description: "Application deadline — completed",
      color: "bg-red-500",
      completed: true,
    },

    // ── Current & upcoming events ─────────────────────────────────────────
    {
      id: 1,
      title: "Client Meeting - Ahmed Al-Rashid",
      date: new Date(today.getFullYear(), today.getMonth(), 15, 10, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), 15, 11, 0),
      type: "meeting",
      location: "Office Room 101",
      attendees: ["Ahmed Al-Rashid", "Caseworker"],
      description: "Discuss visa application progress",
      color: "bg-blue-500",
      completed: false,
    },
    {
      id: 2,
      title: "Document Review - Priya Sharma",
      date: new Date(today.getFullYear(), today.getMonth(), 15, 14, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), 15, 15, 0),
      type: "task",
      location: "Virtual",
      attendees: ["Priya Sharma"],
      description: "Review submitted documents",
      color: "bg-green-500",
      completed: false,
    },
    {
      id: 3,
      title: "UKVI Deadline - Carlos Mendes",
      date: new Date(today.getFullYear(), today.getMonth(), 18, 23, 59),
      endDate: new Date(today.getFullYear(), today.getMonth(), 18, 23, 59),
      type: "deadline",
      location: "System",
      attendees: ["Carlos Mendes"],
      description: "Application submission deadline",
      color: "bg-red-500",
      completed: false,
    },
    {
      id: 4,
      title: "Team Meeting",
      date: new Date(today.getFullYear(), today.getMonth(), 20, 9, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), 20, 10, 0),
      type: "meeting",
      location: "Conference Room",
      attendees: ["Team"],
      description: "Weekly team sync",
      color: "bg-purple-500",
      completed: false,
    },
    {
      id: 5,
      title: "Client Call - Mei Lin Chen",
      date: new Date(today.getFullYear(), today.getMonth(), 22, 15, 30),
      endDate: new Date(today.getFullYear(), today.getMonth(), 22, 16, 0),
      type: "call",
      location: "Phone",
      attendees: ["Mei Lin Chen"],
      description: "Follow-up call regarding application",
      color: "bg-amber-500",
      completed: false,
    },
  ]);

  // Auto-mark past events as completed
  const eventsWithCompletion = useMemo(() =>
    events.map((e) => ({
      ...e,
      completed: e.completed || new Date(e.endDate) < today,
    })),
    [events]
  );

  // Convert Teams meetings to event format
  const teamsEvents = teamsMeetings.map((meeting) => ({
    id: `teams-${meeting.id}`,
    title: meeting.subject,
    date: new Date(meeting.start_time),
    endDate: new Date(meeting.end_time),
    type: "teams",
    location: "Microsoft Teams",
    attendees: meeting.attendees?.map((a) => a.email) || [],
    description: meeting.description || "",
    color: "bg-purple-500",
    joinUrl: meeting.join_url,
    isTeamsMeeting: true,
    completed: new Date(meeting.end_time) < today,
  }));

  const allEvents = useMemo(
    () => [...eventsWithCompletion, ...teamsEvents],
    [eventsWithCompletion, teamsEvents]
  );

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    duration: "30",
    type: "meeting",
    location: "",
    attendees: "",
    description: "",
  });

  // ── Calendar helpers ───────────────────────────────────────────────────

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    return allEvents.filter(
      (event) =>
        new Date(event.date).toDateString() === day.toDateString()
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  const formatMonth = (date) =>
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayClick = (day) => {
    if (day) {
      setSelectedDate(day);
      setShowEventModal(true);
      setNewEvent((prev) => ({
        ...prev,
        date: day.toISOString().split("T")[0],
        time: "09:00",
      }));
    }
  };

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const eventDateTime = new Date(`${newEvent.date}T${newEvent.time}`);
      const endDateTime = new Date(
        eventDateTime.getTime() + parseInt(newEvent.duration) * 60000
      );

      const colorMap = {
        meeting: "bg-blue-500",
        deadline: "bg-red-500",
        call: "bg-amber-500",
        task: "bg-green-500",
      };

      const event = {
        id: Date.now(),
        title: newEvent.title,
        date: eventDateTime,
        endDate: endDateTime,
        type: newEvent.type,
        location: newEvent.location,
        attendees: newEvent.attendees
          ? newEvent.attendees.split(",").map((a) => a.trim())
          : [],
        description: newEvent.description,
        color: colorMap[newEvent.type] || "bg-blue-500",
        completed: endDateTime < today,
      };

      setEvents((prev) => [...prev, event]);
      setShowEventModal(false);
      setNewEvent({
        title: "",
        date: "",
        time: "",
        duration: "30",
        type: "meeting",
        location: "",
        attendees: "",
        description: "",
      });
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setShowEventDetailModal(false);
  };

  const formatEventTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const getEventIcon = (type) => {
    switch (type) {
      case "meeting": return <Users size={12} />;
      case "call":    return <Phone size={12} />;
      case "deadline":return <Clock size={12} />;
      case "teams":   return <Video size={12} />;
      default:        return <CalendarIcon size={12} />;
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return allEvents;
    const q = searchQuery.toLowerCase();
    return allEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [allEvents, searchQuery]);

  // Separate upcoming vs completed for the list section
  const upcomingEvents = useMemo(
    () =>
      filteredEvents
        .filter((e) => !e.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [filteredEvents]
  );

  const completedEvents = useMemo(
    () =>
      filteredEvents
        .filter((e) => e.completed)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredEvents]
  );

  const days = getDaysInMonth(currentDate);
  const isPastMonth =
    currentDate.getFullYear() < today.getFullYear() ||
    (currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() < today.getMonth());

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary">Calendar</h1>
          <p className="text-gray-500 mt-1">
            Schedule events, meetings, and deadlines
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-secondary min-w-[200px] text-center">
              {formatMonth(currentDate)}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Today
          </button>

          {isPastMonth && (
            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
              <CheckCircle2 size={12} className="text-green-500" />
              Showing completed meetings
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                  viewMode === mode
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday =
              day && day.toDateString() === today.toDateString();
            const isPast = day && day < today && !isToday;
            const isCurrentMonth =
              day && day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={index}
                onClick={() => day && !isPast && handleDayClick(day)}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 transition-colors
                  ${!day ? "bg-gray-50" : ""}
                  ${day && isPast ? "bg-gray-50/60 cursor-default" : ""}
                  ${day && !isPast ? "bg-white hover:bg-gray-50 cursor-pointer" : ""}
                  ${isToday ? "bg-blue-50" : ""}
                `}
              >
                {day && (
                  <>
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday ? "bg-blue-600 text-white" : ""}
                          ${!isToday && isPast ? "text-gray-400" : ""}
                          ${!isToday && !isPast && isCurrentMonth ? "text-gray-900" : ""}
                          ${!isCurrentMonth && !isToday ? "text-gray-300" : ""}
                        `}
                      >
                        {day.getDate()}
                      </span>
                      {isPast && dayEvents.length > 0 && (
                        <CheckCircle2 size={11} className="text-green-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className={`text-xs p-1 rounded-md text-white truncate cursor-pointer transition-opacity
                            ${event.color}
                            ${event.completed ? "opacity-50 line-through-none" : "hover:opacity-80"}
                          `}
                          title={event.title}
                        >
                          <span className="flex items-center gap-1">
                            {event.completed
                              ? <CheckCircle2 size={10} className="flex-shrink-0" />
                              : getEventIcon(event.type)
                            }
                            <span className={`truncate ${event.completed ? "opacity-80" : ""}`}>
                              {event.title}
                            </span>
                          </span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div
                          className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 pl-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDayClick(day);
                          }}
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

      {/* Events List — Upcoming */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-secondary">Upcoming Events</h3>
          <span className="text-xs text-gray-500">
            {upcomingEvents.length} events
          </span>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No upcoming events. Click a date or press "New Event" to add one.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onClick={handleEventClick}
                formatEventTime={formatEventTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* Events List — Completed / Past */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-secondary">
              Completed Meetings
            </h3>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <span className="text-xs text-gray-500">
            {completedEvents.length} completed
          </span>
        </div>

        {completedEvents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No completed meetings yet.
          </p>
        ) : (
          <div className="space-y-3">
            {completedEvents.slice(0, 5).map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onClick={handleEventClick}
                formatEventTime={formatEventTime}
                isCompleted
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Event Creation Modal ──────────────────────────────────────────── */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (min)
                    </label>
                    <select
                      value={newEvent.duration}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, duration: e.target.value })
                      }
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, type: e.target.value })
                      }
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Office, Virtual, Phone, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendees
                  </label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, attendees: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Enter names separated by commas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
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

      {/* ── Event Detail Modal ────────────────────────────────────────────── */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">
                  Event Details
                </h3>
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
                  <div
                    className={`w-12 h-12 rounded-xl ${selectedEvent.color} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    {selectedEvent.completed
                      ? <CheckCircle2 size={20} />
                      : getEventIcon(selectedEvent.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">
                      {selectedEvent.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          selectedEvent.type === "meeting"
                            ? "bg-blue-100 text-blue-700"
                            : selectedEvent.type === "call"
                            ? "bg-amber-100 text-amber-700"
                            : selectedEvent.type === "deadline"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {selectedEvent.type}
                      </span>
                      {selectedEvent.completed && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(selectedEvent.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatEventTime(selectedEvent.date)} –{" "}
                        {formatEventTime(selectedEvent.endDate)}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-bold text-gray-900">
                          {selectedEvent.location}
                        </p>
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
                          className="text-sm font-bold text-purple-600 hover:text-purple-700 underline break-all"
                        >
                          {selectedEvent.joinUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedEvent.attendees &&
                    selectedEvent.attendees.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Users size={16} className="text-gray-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Attendees</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedEvent.attendees.map((attendee, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                              >
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

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowEventDetailModal(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  {!selectedEvent.isTeamsMeeting && (
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
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

// ── Shared Event Row Component ─────────────────────────────────────────────

const EventRow = ({ event, onClick, formatEventTime, isCompleted = false }) => {
  const typeColors = {
    meeting: "bg-blue-100 text-blue-700",
    call: "bg-amber-100 text-amber-700",
    deadline: "bg-red-100 text-red-700",
    teams: "bg-purple-100 text-purple-700",
    task: "bg-green-100 text-green-700",
  };

  return (
    <div
      onClick={() => onClick(event)}
      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors border
        ${isCompleted
          ? "bg-gray-50/60 border-gray-100 hover:bg-gray-100/60 opacity-80"
          : "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200"
        }
      `}
    >
      <div
        className={`w-4 h-4 rounded-full flex-shrink-0 ${event.color} ${isCompleted ? "opacity-60" : ""}`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${isCompleted ? "text-gray-500" : "text-gray-900"}`}>
          {event.title}
          {isCompleted && (
            <CheckCircle2
              size={12}
              className="inline-block ml-1 text-green-500"
            />
          )}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
          <span className="flex items-center gap-1">
            <CalendarIcon size={12} />
            {new Date(event.date).toLocaleDateString()}
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
            <span className="text-xs text-gray-500 truncate">
              {event.attendees.join(", ")}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            typeColors[event.type] || "bg-gray-100 text-gray-700"
          }`}
        >
          {event.type}
        </span>
        <Eye size={14} className="text-gray-400" />
      </div>
    </div>
  );
};

export default Calendar;
