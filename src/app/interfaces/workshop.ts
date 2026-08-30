export interface Workshop {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  modules_count: number;
  editions_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkshopModule {
  id: number;
  workshop_id: number;
  name: string;
  order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkshopEdition {
  id: number;
  workshop_id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  shift: 'Mañana' | 'Tarde' | 'Noche';
  capacity: number;
  status: boolean;
  enrollments_count: number;
  created_at: string | null;
  updated_at: string | null;
  workshop?: Workshop;
}

export interface WorkshopEnrollment {
  id: number;
  student_id: number;
  workshop_edition_id: number;
  enrolled: string;
  code: string;
  status: 'Activo' | 'Completado' | 'Retirado';
  student?: any;
  edition?: WorkshopEdition;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkshopConcept {
  id: number;
  workshop_edition_id: number;
  type: 'Inscripcion' | 'Cuota' | 'Otro';
  description: string | null;
  amount: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkshopGrade {
  student_id: number;
  workshop_module_id: number;
  workshop_edition_id: number;
  score: number | null;
  module_name?: string;
  module_order?: number;
  grade_id?: number;
}

export interface WorkshopEditionSimple {
  id: number;
  name: string;
  workshop_id: number;
  start_date: string;
  end_date: string | null;
  shift: string;
  capacity: number;
  workshop?: { id: number; name: string };
}
