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
  schedules: {
    byCareer: (careerId: number) => `${API_BASE_URL}/subjects/${careerId}/by-career`,
    byParallel: (parallelId: number) => `${API_BASE_URL}/schedules/parallel/${parallelId}`,
    save: `${API_BASE_URL}/schedules/save`,
    store: `${API_BASE_URL}/schedules`,
    update: (id: number) => `${API_BASE_URL}/schedules/${id}`,
    delete: (id: number) => `${API_BASE_URL}/schedules/${id}`,
  },
  concepts :{
    index : `${API_BASE_URL}/concepts`,
    store: `${API_BASE_URL}/concepts`,
    update: (id: number) => `${API_BASE_URL}/concepts/${id}`,
    delete: (id: number) => `${API_BASE_URL}/concepts/${id}`,
    show: (id: number) => `${API_BASE_URL}/concepts/${id}`,
  },
  studentCareers: {
    index: `${API_BASE_URL}/student-careers`,
    store: `${API_BASE_URL}/student-careers`,
    withdraw: (studentId: number, careerId: number) => `${API_BASE_URL}/students/${studentId}/withdraw/${careerId}`,
    reinstate: (studentId: number, careerId: number) => `${API_BASE_URL}/students/${studentId}/reinstate/${careerId}`,
    getByStudent: (studentId: number) => `${API_BASE_URL}/students/${studentId}/careers`,
    getActiveByCareer: (careerId: number, gestion: number) => `${API_BASE_URL}/careers/${careerId}/active-students/${gestion}`,
  },

  pays: {
    index : `${API_BASE_URL}/pays`,
    store: `${API_BASE_URL}/pays`,
    receipt: (id: number) => `${API_BASE_URL}/pays/${id}/receipt`,
  }
} as const;
