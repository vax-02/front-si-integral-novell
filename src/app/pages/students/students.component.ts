import { Component, ɵpatchComponentDefWithScope } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { CareerService } from '../../service/career.service';
import { ConceptService } from '../../service/concept.service';
import { CareerForSelect } from '../../interfaces/career';
import { StudentService } from '../../service/student.service';
import { ToastService } from '../../shared/services/toast.service';
import { ParallelService } from '../../service/parallel.service';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';
import { AuthService } from '../../core/services/auth.service';
import { Roles } from '../../core/constants/roles.constants';

export interface Student {
  id: number;
  user_id: number;
  career_id: number;
  student_careers : any[],
  user: {
    id: number;
    name: string;
    first_lastname: string;
    second_lastname: string;
    email: string;
    ci: string | number;
    status: number
  };
  careers: (CareerForSelect & { pivot?: { status: string } })[];
}
interface Card {
  total: number;
  actives: number;
  inactives: number;
}
@Component({
  selector: 'app-students',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
    BaseModalConfirmComponent
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent {
  private searchTimeout: any;
  parallels: any[] = []
  tipo: string = '';
  modalParallels : boolean = false
  students: Student[] = [];
  dataCards: Card = {
    total: 0,
    actives: 0,
    inactives: 0,
  };

  search: string = '';
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  totalStudents = 0;
  loading = false;
  saving = false;

    registerModalStudent = false;
  viewModalStudent = false;
  editModalStudent = false;
  optionModalStudent = false;
  parallelHistoryModal = false;
  subjectHistoryModal = false;
    careersForSelect: CareerForSelect[] = [];
  selectedStudent: any | null = null;
  parallelHistory: any[] = [];
  subjectHistory: any[] = [];
  subjectHistoryGroups: any[] = [];

  // Propiedades del formulario de inscripción/edición
  enrollment = {
    name: '',
    first_lastname: '',
    second_lastname: '',
    ci: '',
    email: '',
    cellphone: 0,
    parallel_id: 0,
    career_id: null as number | null,
    gestion: new Date().getFullYear().toString(),
    birth_certificate: false,
    school_diploma: false,
    carnet: false,
  };

  // Propiedades para adición de carrera
  newCareer = {
    career_id: null as number | null,
    parallel_id: null as number | null,
  };
  newCareerParallels: any[] = [];

  // Propiedades para el modal de opciones (3 tabs)
  optionTab: string = 'add-career'; // 'add-career' | 'change-parallel' | 'withdraw' | 'advance-level'
  // Para cambio de paralelo
  changeParallelCareerId: number | null = null;
  changeParallels: any[] = [];
  changeParallelId: number | null = null;
  changeParallelCurrent: any = null;
  studentCareers: any[] = [];

  // Propiedades para avance de nivel
  advanceCareerId: number | null = null;
  advanceParallels: any[] = [];
  advanceParallelId: number | null = null;
  advanceCurrentLevel: number | null = null;
  advanceNextLevel: number | null = null;
  advanceParallelLoading = false;
  advanceResultModal = false;
  advanceResult: any = null;
  advanceSaving = false;

  // Conceptos de pago cargados desde el backend (solo informativo)
  conceptosCarrera: any[] = [];

  constructor(
    private careerService: CareerService,
    private conceptService: ConceptService,
    private studentService: StudentService,
    private parallelService: ParallelService,
    private toast: ToastService,
    private authService: AuthService,
  ) {}
  ngOnInit() {
    this.loadCareersForSelect();
    this.loadStudents();
  }
  loadCareersForSelect() {
    this.careerService.getCareersForSelect().subscribe({
      next: (response) => {
        this.careersForSelect = response.careers;
      },
      error: (err) => {
        this.toast.error('Error al cargar carreras');
      },
    });
  }
  loadStudents() {
    this.loading = true;
    this.studentService
      .getStudents(this.currentPage, this.perPage, this.search)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.totalStudents = response.total;
          this.dataCards.total = response.total;
          this.dataCards.actives = response.actives;
          this.dataCards.inactives = response.inactive;

          this.currentPage = response.students.current_page;
          this.lastPage = response.students.last_page;
          this.students = response.students.data;
        },
        error: (err) => {
          this.loading = false;
          this.toast.error('Error al cargar estudiantes');
        },
      });
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadStudents();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadStudents();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadStudents();
  }

  get from() {
    return (this.currentPage - 1) * this.perPage + 1;
  }

  get to() {
    return Math.min(this.currentPage * this.perPage, this.totalStudents);
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadStudents();
    }, 400);
  }

  // ============ Manejo del formulario de inscripción ============

  openModalStudent() {
    this.resetEnrollmentForm();
    this.registerModalStudent = true;
  }

  resetEnrollmentForm() {
    this.enrollment = {
      name: '',
      first_lastname: '',
      second_lastname: '',
      ci: '',
      email: '',
      cellphone: 0,
      career_id: null,
      parallel_id : 0,
      gestion: new Date().getFullYear().toString(),
      birth_certificate: false,
      school_diploma: false,
      carnet: false,
    };
    this.parallels = [];
    this.saving = false;
  }

  onCareerChange() {
    if (!this.enrollment.career_id) {
      this.parallels = [];
      return;
    }
    this.parallelService.getParallelsForCareerForNewStudent(this.enrollment.career_id).subscribe({
        next: (response) =>{
          this.parallels = response.parallels;
        },
        error: (err) =>{

        }
    });
  }

  validarFormulario(): boolean {
    if (!this.enrollment.name) { this.toast.error('El nombre es requerido'); return false; }
    if (!this.enrollment.first_lastname) { this.toast.error('El apellido paterno es requerido'); return false; }
    if (!this.enrollment.ci) { this.toast.error('El C.I. es requerido'); return false; }
    if (!this.enrollment.email) { this.toast.error('El correo electrónico es requerido'); return false; }
    if (!this.enrollment.career_id) { this.toast.error('Seleccione una carrera'); return false; }
    return true;
  }
  validarFormularioUpdate(): boolean {
    if (!this.enrollment.name) { this.toast.error('El nombre es requerido'); return false; }
    if (!this.enrollment.first_lastname) { this.toast.error('El apellido paterno es requerido'); return false; }
    if (!this.enrollment.ci) { this.toast.error('El C.I. es requerido'); return false; }
    if (!this.enrollment.email) { this.toast.error('El correo electrónico es requerido'); return false; }
    return true;
  }
  saveStudent() {
    if (!this.validarFormulario()) return;
    this.saving = true;

    const data = {
      name: this.enrollment.name,
      first_lastname: this.enrollment.first_lastname,
      second_lastname: this.enrollment.second_lastname,
      ci: this.enrollment.ci,
      email: this.enrollment.email,
      cellphone: this.enrollment.cellphone,
      career_id: this.enrollment.career_id,
      parallel_id : this.enrollment.parallel_id,
      birth_certificate: this.enrollment.birth_certificate,
      school_diploma: this.enrollment.school_diploma,
      carnet: this.enrollment.carnet,
    };


    if (this.editModalStudent && this.selectedStudent) {
      this.studentService.updateStudent(this.selectedStudent.id, data).subscribe({
        next: (response) => {
          this.saving = false;
          this.toast.success('Estudiante actualizado exitosamente');
          this.editModalStudent = false;
          this.loadStudents();
        },
        error: (err) => {
          this.saving = false;
          this.showValidationError(err, 'Error al actualizar estudiante');
        }
      });
    } else {
      this.studentService.createStudent(data).subscribe({
        next: (response) => {
          this.saving = false;
          this.toast.success('Estudiante inscrito exitosamente');
          this.registerModalStudent = false;
          this.loadStudents();
        },
        error: (err) => {
          this.saving = false;
          this.showValidationError(err, 'Error al inscribir estudiante');
        },
      });
    }
  }

  private showValidationError(err: any, fallback: string): void {
    const errors = err?.error?.errors;
    if (errors) {
      const messages: string[] = [];
      if (errors.ci) messages.push(errors.ci[0] || 'El C.I. ya está registrado');
      if (errors.email) messages.push(errors.email[0] || 'El correo electrónico ya está registrado');
      if (messages.length) {
        this.toast.error(messages.join('. '));
        return;
      }
      const first = Object.values(errors)[0] as string[];
      if (first?.[0]) {
        this.toast.error(first[0]);
        return;
      }
    }
    this.toast.error(fallback);
  }

  updateStudent() {
    if (!this.validarFormularioUpdate()) return;
    this.saving = true;

    const data = {
      name: this.enrollment.name,
      first_lastname: this.enrollment.first_lastname,
      second_lastname: this.enrollment.second_lastname,
      ci: this.enrollment.ci,
      email: this.enrollment.email,
      cellphone: this.enrollment.cellphone,
      birth_certificate: this.enrollment.birth_certificate,
      school_diploma: this.enrollment.school_diploma,
      carnet: this.enrollment.carnet,
    };

    this.studentService.updateStudent(this.selectedStudent!.id, data).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.success('Estudiante actualizado exitosamente');
        this.editModalStudent = false;
        this.loadStudents();
      },
      error: (err) => {
        this.saving = false;
        this.showValidationError(err, 'Error al actualizar estudiante');
      }
    });
  }
  openModalView(student: Student) {
    this.selectedStudent = student;
    this.parallelHistory = [];
    this.subjectHistory = [];
    this.viewModalStudent = true;
    this.studentService.getStudent(student.id).subscribe({
      next: (res) => {
        this.selectedStudent = res.student || student;
        this.parallelHistory = (res.parallel_history || []).map((group: any) => ({
          career_id: group.career_id,
          career_name: group.career_name,
          courses: (group.courses || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            level: c.level,
            changes: (group.changes || []).filter((ch: any) => Number(ch.level) === Number(c.level)),
          })),
        }));
        this.subjectHistory = res.subject_history || [];

        const careers = res.student?.student_careers || [];
        this.subjectHistoryGroups = careers.map((sc: any) => {
          const careerId = sc.career_id ?? sc.career?.id;
          const subjects = (this.subjectHistory || []).filter((s: any) => s.career_id === careerId);
          return {
            career_id: careerId,
            career_name: sc.career?.name || '',
            subjects,
            registered: subjects.filter((s: any) => s.status === 'Registrado').length,
            approved: subjects.filter((s: any) => s.status === 'Aprobado').length,
            missing: subjects.filter((s: any) => s.status === 'Falta').length,
          };
        });
      },
      error: () => {
        this.toast.error('Error al cargar el detalle del estudiante');
      }
    });
  }

  ordinalLabel(n: number | null): string {
    const ordinals = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo'];
    return ordinals[(n ?? 0) - 1] || `${n ?? 0}º`;
  }

  get totalParallelChanges(): number {
    return this.parallelHistory.reduce(
      (acc: number, g: any) => acc + g.courses.reduce((a: number, c: any) => a + c.changes.length, 0),
      0
    );
  }

  get registeredSubjects(): number {
    return this.subjectHistoryGroups.reduce((acc: number, g: any) => acc + g.registered, 0);
  }

  get approvedSubjects(): number {
    return this.subjectHistoryGroups.reduce((acc: number, g: any) => acc + g.approved, 0);
  }

  get missingSubjects(): number {
    return this.subjectHistoryGroups.reduce((acc: number, g: any) => acc + g.missing, 0);
  }

  openModalEdit(student: any) {
    this.selectedStudent = student;
    this.enrollment = {
      name: student.user.name,
      first_lastname: student.user.first_lastname,
      second_lastname: student.user.second_lastname,
      ci: student.user.ci.toString(),
      email: student.user.email,
      cellphone: this.selectedStudent.user.cellphone,
      career_id: null,
      parallel_id: 0,
      gestion: new Date().getFullYear().toString(),
      birth_certificate: student.birth_certificate,
      school_diploma: student.school_diploma,
      carnet: student.carnet,
    };

    this.editModalStudent = true;
  }

  openModalOption(student: Student) {
    this.selectedStudent = student;
    this.optionModalStudent = true;
    this.optionTab = 'add-career';
    this.newCareer = {
      career_id: null,
      parallel_id: null
    };
    this.changeParallelCareerId = null;
    this.changeParallels = [];
    this.changeParallelId = null;
    this.changeParallelCurrent = null;
    this.advanceCareerId = null;
    this.advanceParallels = [];
    this.advanceParallelId = null;
    this.advanceCurrentLevel = null;
    this.advanceNextLevel = null;

    // Cargar las carreras del estudiante para el modal
    this.studentService.getStudent(student.id).subscribe(res => {
      this.studentCareers = res.student.student_careers || [];
    });
  }

  // ============ Paralelos de Adicionar Carrera ============
  onNewCareerCareerChange() {
    if (!this.newCareer.career_id) {
      this.newCareerParallels = [];
      this.newCareer.parallel_id = null;
      return;
    }
    this.parallelService.getParallelsForCareerForNewStudent(this.newCareer.career_id).subscribe({
      next: (response) => {
        this.newCareerParallels = response.parallels;
        this.newCareer.parallel_id = null;
      },
      error: (err) => {
        this.toast.error('Error al cargar paralelos');
      }
    });
  }

  isStudentInCareer(careerId: number): boolean {
    if (!this.selectedStudent?.student_careers) return false;
    return this.selectedStudent.student_careers.some(
      (sc: any) => sc.career_id === careerId || sc.career?.id === careerId
    );
  }

  addCareer() {
    if (this.saving) {
      return;
    }
    if (!this.newCareer.career_id ) {
      this.toast.error('Seleccione una carrera');
      return;
    }
    // Validar que no esté ya inscrito
    if (this.isStudentInCareer(this.newCareer.career_id)) {
      this.toast.error('El estudiante ya está inscrito en esta carrera');
      return;
    }
    this.saving = true;
    const data = {
      student_id: this.selectedStudent?.id,
      career_id: this.newCareer.career_id,
      parallel_id: this.newCareer.parallel_id
    };

    this.studentService.addCareer(data).subscribe({
      next: (resp) => {
        this.saving = false;
        this.toast.success('Carrera adicionada correctamente');
        this.loadStudents();

        // Recargar carreras del estudiante
        this.studentService.getStudent(this.selectedStudent!.id).subscribe( {
          next: (res) =>{
            this.studentCareers = res.student.student_careers || [];
          },error: (err) =>{
            this.studentCareers = []
          }
        });
      },
      error: (err) => {
        this.saving = false;
        if(err.status === 409){
          this.toast.info('El estudiante ya se encuentra inscrito en esa carrera')
          return
        }
        this.toast.error('Error al adicionar carrera');
      }
    });
  }

  // ============ Pestaña 2: Cambiar de Paralelo ============

  onCareerForParallelChange() {
    if (!this.changeParallelCareerId) {
      this.changeParallels = [];
      this.changeParallelCurrent = null;
      return;
    }
    const careerEntry = this.studentCareers.find(
      (sc: any) => (sc.career?.id || sc.career_id) === this.changeParallelCareerId
    );
    this.changeParallelCurrent = careerEntry?.current_parallel || null;
    const level = this.changeParallelCurrent?.level || 1;
    this.parallelService.getParallelsForCareerAtLevel(this.changeParallelCareerId, level).subscribe({
      next: (response) => {
        this.changeParallels = response.parallels;
        this.changeParallelId = null;
      },
      error: () => {
        this.toast.error('Error al cargar paralelos');
      }
    });
  }

  saveChangeParallel() {
    if (!this.changeParallelCareerId) {
      this.toast.error('Seleccione una carrera');
      return;
    }
    if (!this.changeParallelId) {
      this.toast.error('Seleccione un paralelo');
      return;
    }
    this.saving = true;

    // Buscar el student_career_id correspondiente
    const careerEntry = this.studentCareers.find(
      (sc: any) => sc.career_id === this.changeParallelCareerId || sc.career?.id === this.changeParallelCareerId
    );

    this.studentService.updateStudentParallel(this.selectedStudent!.id, {
      career_id: this.changeParallelCareerId,
      parallel_id: this.changeParallelId
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Paralelo cambiado correctamente');
        this.loadStudents();
      },
      error: (err: any) => {
        this.saving = false;
        if(err.status == 409){
          this.toast.info('Ya se encuentra en el paralelo');
          return
        }
        this.toast.error('Error al cambiar paralelo');
      }
    });
  }

  // ============ Pestaña 4: Avanzar de Nivel ============

  get isAdmin(): boolean {
    const user = this.authService.user;
    if (user?.currentRole?.id == Roles.ADMIN.id) return true;
    return Array.isArray(user?.roles) && user.roles.some((r: any) => r.id == Roles.ADMIN.id);
  }

  onCareerForAdvanceChange() {
    this.advanceParallels = [];
    this.advanceParallelId = null;
    this.advanceCurrentLevel = null;
    this.advanceNextLevel = null;
    if (!this.advanceCareerId) return;

    const careerEntry = this.studentCareers.find(
      (sc: any) => (sc.career?.id || sc.career_id) === this.advanceCareerId
    );
    const currentParallel = careerEntry?.current_parallel || null;
    if (!currentParallel?.level) {
      this.toast.error('El estudiante no tiene un paralelo activo en esta carrera');
      return;
    }
    this.advanceCurrentLevel = Number(currentParallel.level);
    this.advanceNextLevel = this.advanceCurrentLevel + 1;
    this.advanceParallelLoading = true;
    this.parallelService.getParallelsForCareerAtLevel(this.advanceCareerId, this.advanceNextLevel).subscribe({
      next: (response) => {
        this.advanceParallelLoading = false;
        this.advanceParallels = response.parallels || [];
      },
      error: () => {
        this.advanceParallelLoading = false;
        this.toast.error('Error al cargar paralelos del siguiente nivel');
      }
    });
  }

  advanceLevel() {
    if (this.advanceSaving) return;
    if (!this.advanceCareerId) {
      this.toast.error('Seleccione una carrera');
      return;
    }
    if (!this.advanceParallelId) {
      this.toast.error('Seleccione un paralelo del siguiente nivel');
      return;
    }
    this.advanceSaving = true;
    this.studentService.advanceLevel(this.selectedStudent!.id, {
      career_id: this.advanceCareerId,
      parallel_id: this.advanceParallelId,
    }).subscribe({
      next: (res) => {
        this.advanceSaving = false;
        this.advanceResult = res;
        this.advanceResultModal = true;
        this.toast.success('Nivel avanzado correctamente');
        this.loadStudents();
        this.studentService.getStudent(this.selectedStudent!.id).subscribe({
          next: (r) => {
            this.studentCareers = r.student.student_careers || [];
          },
          error: () => {
            this.studentCareers = [];
          }
        });
      },
      error: (err: any) => {
        this.advanceSaving = false;
        const message = err?.error?.message;
        if (message) {
          this.toast.info(message);
          return;
        }
        if (err.status === 403) {
          this.toast.error('Solo el administrador puede realizar esta acción');
          return;
        }
        this.toast.error('Error al avanzar de nivel');
      }
    });
  }

  // ============ Pestaña 3: Dar de Baja / Readmisión ============
  modalConfirmBajaReadmision : boolean = false
  careerSelectId: number = 0;
  confirmWithdraw(careerId:number){
    this.careerSelectId = careerId;
    this.modalConfirmBajaReadmision = true
  }

  withdraw() {
    this.saving = true
    this.studentService.withdrawCareer(this.selectedStudent!.id, this.careerSelectId).subscribe({
      next: () => {
        this.toast.success('Baja procesada');
        this.loadStudents();
        // Recargar carreras del estudiante
        this.studentService.getStudent(this.selectedStudent!.id).subscribe(res => {
          this.studentCareers = res.student.student_careers || [];
        });
      this.saving = false
      this.modalConfirmBajaReadmision = false

      },
      error: (err) => {
      this.saving = false
        this.toast.error('Error al procesar baja')
      }
    });
  }

  reinstate(careerId: number) {
    this.studentService.reinstateCareer(this.selectedStudent!.id, careerId).subscribe({
      next: () => {
        this.toast.success('Readmisión procesada');
        this.loadStudents();
        // Recargar carreras del estudiante
        this.studentService.getStudent(this.selectedStudent!.id).subscribe(res => {
          this.studentCareers = res.student.student_careers || [];
        });
      },
      error: (err) => this.toast.error(err.error?.error || 'Error al procesar readmisión')
    });
  }

  saveBaja() {
    if (this.tipo === 'baja') {
      // estado = INACTIVO
    }
    if (this.tipo === 'congelado') {
      // estado = CONGELADO
    }
  }
}
