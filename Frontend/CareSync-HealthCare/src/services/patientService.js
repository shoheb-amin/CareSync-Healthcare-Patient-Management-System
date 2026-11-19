import apiClient from './api';

export const patientService = {
  getPatients: async () => {
    const response = await apiClient.get('/api/patients');
    return response.data;
  },

  createPatient: async (patientData) => {
    const response = await apiClient.post('/api/patients', patientData);
    return response.data;
  },

  updatePatient: async (id, patientData) => {
    const response = await apiClient.put(`/api/patients/${id}`, patientData);
    return response.data;
  },

  deletePatient: async (id) => {
    const response = await apiClient.delete(`/api/patients/${id}`);
    return response.data;
  },
};
