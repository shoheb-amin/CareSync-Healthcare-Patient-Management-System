import apiClient from './api';

export const analyticsService = {
  getPatientStats: async () => {
    const response = await apiClient.get('/api/analytics/patients/count');
    return response.data;
  },

  getAppointmentStats: async () => {
    const response = await apiClient.get('/api/analytics/appointments/count');
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await apiClient.get('/api/analytics/payments/statistics');
    return response.data;
  },

  getTotalRevenue: async () => {
    const response = await apiClient.get('/api/analytics/payments/revenue');
    return response.data;
  },

  getTotalDoctors: async () => {
    const response = await apiClient.get('/api/analytics/doctors/count');
    return response.data;
  },

  getAllDoctorsAnalytics: async () => {
    const response = await apiClient.get('/api/analytics/doctors');
    return response.data;
  },

  getDoctorsByDepartment: async (department) => {
    const response = await apiClient.get(`/api/analytics/doctors/department/${department}`);
    return response.data;
  },
};
