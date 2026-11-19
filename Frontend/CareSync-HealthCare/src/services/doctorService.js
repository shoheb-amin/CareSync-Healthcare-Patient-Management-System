import apiClient from './api';

export const doctorService = {
  getDoctors: async () => {
    const response = await apiClient.get('/api/doctors');
    return response.data;
  },

  createDoctor: async (doctorData) => {
    const response = await apiClient.post('/api/doctors', doctorData);
    return response.data;
  },

  updateDoctor: async (id, doctorData) => {
    const response = await apiClient.put(`/api/doctors/${id}`, doctorData);
    return response.data;
  },

  deleteDoctor: async (id) => {
    const response = await apiClient.delete(`/api/doctors/${id}`);
    return response.data;
  },
};
