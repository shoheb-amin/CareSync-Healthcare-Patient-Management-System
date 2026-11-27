import axios from 'axios';
import { sessionLogger } from './sessionLogger';

// In development, relative paths route through Vite's dev server proxy to port 4004,
// preventing browser CORS violations (since API Gateway does not enable CORS).
// In production, Nginx reverse proxy handles /api/ and /auth/ routes seamlessly.
const baseURL = import.meta.env.VITE_USE_DIRECT_API === 'true'
  ? (import.meta.env.VITE_API_BASE_URL || 'http://34.131.79.207:4004')
  : '';

export const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to automatically attach JWT token from sessionStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('caresync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to capture website mutations into the session log without exposing client PII
apiClient.interceptors.response.use(
  (response) => {
    try {
      const method = (response.config.method || 'get').toUpperCase();
      const url = response.config.url || '';

      // Skip internal session logging calls and notification dispatches (handled directly in NotificationsPage)
      if (
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) &&
        !url.includes('/api/session-logs') &&
        !url.includes('/api/notifications')
      ) {
        let module = 'SYSTEM';
        let recipientLabel = 'Clinical Service';
        let actionDescription = 'System transaction completed';

        let action = `${method}_RECORD`;
        if (url.includes('/status')) action = 'UPDATE_STATUS';
        else if (method === 'POST') action = 'CREATE_RECORD';
        else if (method === 'PUT') action = 'UPDATE_RECORD';
        else if (method === 'DELETE') action = 'DELETE_RECORD';

        if (url.includes('/api/patients')) {
          module = 'PATIENTS';
          recipientLabel = 'Patient Registry';
          actionDescription = method === 'POST' ? 'New patient profile registered' : 'Patient registry record updated';
        } else if (url.includes('/api/doctors')) {
          module = 'DOCTORS';
          recipientLabel = 'Doctor Registry';
          actionDescription = method === 'POST' ? 'New specialist registered on duty' : 'Physician record updated';
        } else if (url.includes('/api/appointments')) {
          module = 'APPOINTMENTS';
          recipientLabel = 'Appointment Service';
          actionDescription = url.includes('/status') ? 'Appointment status updated' : 'Appointment booking processed';
        } else if (url.includes('/api/billing') || url.includes('/api/payments')) {
          module = 'BILLING';
          recipientLabel = 'Billing Service';
          actionDescription = url.includes('/status') ? 'Payment status updated' : 'Payment invoice record created';
        } else if (url.includes('/auth/')) {
          module = 'AUTH';
          recipientLabel = 'Auth Service';
          actionDescription = 'Authentication session event processed';
        }

        sessionLogger.logEvent({
          module,
          action,
          status: 'SUCCESS',
          recipient: recipientLabel,
          details: actionDescription,
          metadata: `HTTP ${response.status} ${response.statusText || 'OK'}`,
        });
      }
    } catch {
      // Ignore background logging errors
    }
    return response;
  },
  (error) => {
    try {
      if (error.config) {
        const method = (error.config.method || 'get').toUpperCase();
        const url = error.config.url || '';

        if (
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) &&
          !url.includes('/api/session-logs') &&
          !url.includes('/api/notifications')
        ) {
          let module = 'SYSTEM';
          if (url.includes('/api/patients')) module = 'PATIENTS';
          else if (url.includes('/api/doctors')) module = 'DOCTORS';
          else if (url.includes('/api/appointments')) module = 'APPOINTMENTS';
          else if (url.includes('/api/billing') || url.includes('/api/payments')) module = 'BILLING';

          sessionLogger.logEvent({
            module,
            action: `${method}_FAILED`,
            status: 'FAILED',
            recipient: 'Clinical Gateway',
            details: 'Request was rejected or encountered an error',
            metadata: `HTTP ${error.response?.status || 'Error'}`,
          });
        }
      }
    } catch {
      // Ignore
    }

    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('caresync_token');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
