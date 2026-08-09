export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  dashboard: `${API_BASE_URL}/dashboard`,
  auth: {
    login: `${API_BASE_URL}/login`,
  },
  institution : `${API_BASE_URL}/institutions`,
  users: `${API_BASE_URL}/users`,
  degrees: `${API_BASE_URL}/degrees`,
  docentes: `${API_BASE_URL}/docentes`,
  docenteMySubjects: `${API_BASE_URL}/docente/my-subjects`,
  students: {
    index: `${API_BASE_URL}/students`,
    advanceLevel: (id: number) => `${API_BASE_URL}/students/${id}/advance-level`,
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
    materialsByParallel: (id: number) => `${API_BASE_URL}/parallels/${id}/materials`,
    studentsByParallel: (id: number) => `${API_BASE_URL}/parallels/${id}/students`,
  },
  schedules: {
    byCareer: (careerId: number) => `${API_BASE_URL}/subjects/${careerId}/by-career`,
    byParallel: (parallelId: number) => `${API_BASE_URL}/schedules/parallel/${parallelId}`,
    save: `${API_BASE_URL}/schedules/save`,
    store: `${API_BASE_URL}/schedules`,
    update: (id: number) => `${API_BASE_URL}/schedules/${id}`,
    delete: (id: number) => `${API_BASE_URL}/schedules/${id}`,
  },
  subjects: {
    detail: (id: number) => `${API_BASE_URL}/subjects/${id}/detail`,
    history: (id: number) => `${API_BASE_URL}/subjects/${id}/history`,
    assignDocente: (id: number) => `${API_BASE_URL}/subjects/${id}/assign-docente`,
    removeDocente: (id: number) => `${API_BASE_URL}/subjects/${id}/remove-docente`,
  },
  concepts :{
    index : `${API_BASE_URL}/concepts`,
    store: `${API_BASE_URL}/concepts`,
    update: (id: number) => `${API_BASE_URL}/concepts/${id}`,
    delete: (id: number) => `${API_BASE_URL}/concepts/${id}`,
    show: (id: number) => `${API_BASE_URL}/concepts/${id}`,
  },
  studentPensum: `${API_BASE_URL}/student/my-pensum`,
  studentSchedule: `${API_BASE_URL}/student/my-schedule`,
  studentSubjects: `${API_BASE_URL}/student/my-subjects`,
  studentGrades: `${API_BASE_URL}/student/my-grades`,
  studentCareers: {
    index: `${API_BASE_URL}/student-careers`,
    store: `${API_BASE_URL}/student-careers`,
    withdraw: (studentId: number, careerId: number) => `${API_BASE_URL}/students/${studentId}/withdraw/${careerId}`,
    reinstate: (studentId: number, careerId: number) => `${API_BASE_URL}/students/${studentId}/reinstate/${careerId}`,
    getByStudent: (studentId: number) => `${API_BASE_URL}/students/${studentId}/careers`,
    getActiveByCareer: (careerId: number, gestion: number) => `${API_BASE_URL}/careers/${careerId}/active-students/${gestion}`,
  },

  materials: {
    index: `${API_BASE_URL}/materials`,
    store: `${API_BASE_URL}/materials`,
    update: (id: number) => `${API_BASE_URL}/materials/${id}`,
    delete: (id: number) => `${API_BASE_URL}/materials/${id}`,
    download: (id: number) => `${API_BASE_URL}/materials/${id}/download`,
  },
  studentMaterials: `${API_BASE_URL}/student/materials`,
  pays: {
    index : `${API_BASE_URL}/pays`,
    store: `${API_BASE_URL}/pays`,
    receipt: (id: number) => `${API_BASE_URL}/pays/${id}/receipt`,
  },
  grades: {
    students: (parallelId: number) => `${API_BASE_URL}/grades/students/${parallelId}`,
    years: `${API_BASE_URL}/grades/years`,
    export: `${API_BASE_URL}/grades/export`,
    generalByParallel: (parallelId: number) => `${API_BASE_URL}/grades/parallel/${parallelId}/general`,
    save: `${API_BASE_URL}/grades/save`,
    publish: `${API_BASE_URL}/grades/publish`,
    unpublish: `${API_BASE_URL}/grades/unpublish`,
    columns: {
      store: `${API_BASE_URL}/grades/columns`,
      update: (id: number) => `${API_BASE_URL}/grades/columns/${id}`,
      delete: (id: number) => `${API_BASE_URL}/grades/columns/${id}`,
    },
  },
  attendance: {
    import: `${API_BASE_URL}/attendance/import`,
    validate: `${API_BASE_URL}/attendance/validate`,
    config: (docenteId: number) => `${API_BASE_URL}/docentes/${docenteId}/attendance-config`,
    schedules: (docenteId: number) => `${API_BASE_URL}/docentes/${docenteId}/schedules`,
    deleteSchedule: (scheduleId: number) => `${API_BASE_URL}/docente-schedules/${scheduleId}`,
  },
} as const;
