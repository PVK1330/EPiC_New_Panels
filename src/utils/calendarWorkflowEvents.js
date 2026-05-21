/**
 * Map API workflow calendar events to the shape used by calendar page components.
 */
export function mapWorkflowEventsToCalendar(apiEvents = []) {
  return apiEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    date: new Date(ev.start),
    endDate: new Date(ev.end),
    type: ev.type,
    location: ev.location || "",
    attendees: Array.isArray(ev.attendees) ? ev.attendees : [],
    description: ev.description || "",
    color: ev.color || "bg-gray-500",
    completed: Boolean(ev.completed),
    caseId: ev.caseId || null,
    isTask: Boolean(ev.isTask),
    isBiometric: Boolean(ev.isBiometric),
    taskId: ev.taskId,
    joinUrl: ev.joinUrl,
    meeting_url: ev.meeting_url,
    isTeamsMeeting: ev.isTeamsMeeting,
  }));
}
