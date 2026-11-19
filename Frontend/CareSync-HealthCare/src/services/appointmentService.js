import apiClient from './api';

export const appointmentService = {
  getAllAppointments: async () => {
    const response = await apiClient.get('/api/appointments');
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await apiClient.get(`/api/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data) => {
    const response = await apiClient.post('/api/appointments', data);
    return response.data;
  },

  updateAppointment: async (id, data) => {
    const response = await apiClient.put(`/api/appointments/${id}`, data);
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await apiClient.patch(`/api/appointments/${id}/cancel`);
    return response.data;
  },

  confirmAppointment: async (id) => {
    const response = await apiClient.patch(`/api/appointments/${id}/confirm`);
    return response.data;
  },

  completeAppointment: async (id) => {
    const response = await apiClient.patch(`/api/appointments/${id}/complete`);
    return response.data;
  },

  getAppointmentsByStatus: async (status) => {
    const response = await apiClient.get(`/api/appointments/status?status=${status}`);
    return response.data;
  },

  getPatientHistory: async (patientId) => {
    const response = await apiClient.get(`/api/appointments/patients/${patientId}/history`);
    return response.data;
  },

  getDoctorHistory: async (doctorId) => {
    const response = await apiClient.get(`/api/appointments/doctors/${doctorId}/appointment/history`);
    return response.data;
  },

  getDoctorAvailability: async (doctorId, date) => {
    const response = await apiClient.get(`/api/appointments/doctor/${doctorId}/availability?availabilityDate=${date}`);
    return response.data;
  },

  findAvailableDoctors: async (department, speciality, date) => {
    const response = await apiClient.get(
      `/api/appointments/doctor/availability/search?department=${encodeURIComponent(department)}&speciality=${encodeURIComponent(speciality)}&availabilityDate=${date}`
    );
    return response.data;
  },

  createDoctorAvailability: async (doctorId, data) => {
    const response = await apiClient.post(`/api/appointments/doctors/${doctorId}/availability`, data);
    return response.data;
  },
};
