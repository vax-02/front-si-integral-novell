export interface Career {
  id: number;
  name: string;
  duration: number;
  type: number;
  status: number;
  created_at: string | null;
  updated_at: string | null;
  subjects_count: number;
  students_count: number;
  active_students_count: number;
}

export interface CareersResponse {
  Careers: Career[];
  total: number;
  totalSubjects: number;
  careersActivas: number;
}

export interface CareerForSelect {
  id: number;
  name: string;
}