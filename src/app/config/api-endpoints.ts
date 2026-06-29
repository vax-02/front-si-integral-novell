const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/login`,
  },
} as const;
