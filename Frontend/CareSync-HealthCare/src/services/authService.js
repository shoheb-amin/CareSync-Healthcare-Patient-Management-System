import apiClient from './api';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // { token: '...' }
  },

  validateToken: async () => {
    const response = await apiClient.get('/auth/validate');
    return response.status === 200;
  },
};
