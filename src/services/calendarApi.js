import api from "./api";

/** Tasks + biometric bookings for calendar (candidate, admin, caseworker). */
export const getWorkflowCalendarEvents = () =>
  api.get("/api/calendar/workflow-events");
