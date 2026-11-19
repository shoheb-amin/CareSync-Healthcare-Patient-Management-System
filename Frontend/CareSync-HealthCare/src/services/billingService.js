import apiClient from './api';

export const billingService = {
  getAllPayments: async () => {
    const response = await apiClient.get('/api/payments');
    return response.data;
  },

  createPayment: async (data) => {
    const response = await apiClient.post('/api/payments', data);
    return response.data;
  },

  getPaymentHistory: async (patientId) => {
    const response = await apiClient.get(`/api/payments/patient/${patientId}`);
    return response.data;
  },

  updatePaymentStatus: async (paymentId, status) => {
    const response = await apiClient.patch(`/api/payments/${paymentId}/status?paymentStatus=${status}`);
    return response.data;
  },
};
