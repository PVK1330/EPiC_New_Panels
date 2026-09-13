import api from "./api";

/** Tasks + biometric bookings for calendar (candidate, admin, caseworker). */
export const getWorkflowCalendarEvents = (params = {}) =>
  api.get("/api/calendar/workflow-events", { params });
