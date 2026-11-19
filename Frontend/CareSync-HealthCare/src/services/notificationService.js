import apiClient from './api';

export const notificationService = {
  createNotification: async (data) => {
    const response = await apiClient.post('/api/notifications', data);
    return response.data;
  },
};
