const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/login`,
  },
  institution : `${API_BASE_URL}/institutions`,
  users: `${API_BASE_URL}/users`,
  degrees: `${API_BASE_URL}/degrees`,
  docentes: `${API_BASE_URL}/docentes`,
  students: {
    index: `${API_BASE_URL}/students`,
  },
  carrers: {
    index: `${API_BASE_URL}/careers`,
    simple: `${API_BASE_URL}/careers/simple`,
    downloadTemplate: `${API_BASE_URL}/careers/download-template`,
  },

  courses: {
    index: `${API_BASE_URL}/courses`,
  },
  parallels: {
    index: `${API_BASE_URL}/parallels`,
  },
} as const;
