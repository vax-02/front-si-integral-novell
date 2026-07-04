const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/login`,
  },
  users: `${API_BASE_URL}/users`,
  degrees: `${API_BASE_URL}/degrees`,
  docentes: `${API_BASE_URL}/docentes`,
  carrers: {
    index: `${API_BASE_URL}/careers`,
    downloadTemplate: `${API_BASE_URL}/careers/download-template`
  } 



} as const;
