import api from "./api";

export const getMyAppointments = () => api.get("/api/appointments/my");
export const getAvailableStaff = () => api.get("/api/appointments/staff");

export const createAppointment = (data) => api.post("/api/appointments", data);

export const updateAppointmentStatus = (id, status) => 
  api.patch(`/api/appointments/${id}/status`, { status });

export const deleteAppointment = (id) => api.delete(`/api/appointments/${id}`);
