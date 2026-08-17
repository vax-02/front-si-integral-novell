import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { CourseService } from '../../service/course.service';
import { ToastService } from '../../shared/services/toast.service';
import { ParallelService } from '../../service/parallel.service';
import { ScheduleService } from '../../service/schedule.service';
import { SubjectService } from '../../service/subject.service';
import { StudentService } from '../../service/student.service';
import { AuthService } from '../../core/services/auth.service';
import { Roles } from '../../core/constants/roles.constants';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';

@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BaseModalComponent,
    ButtonComponent,
    BaseInputComponent,
    BaseModalConfirmComponent
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent implements OnInit {
  formParallel!: FormGroup;
  private searchTimeout: any;

  titleConfirm : string = '';
  messageConfirm : string = '';
  iconConfirm : string = '';

  toggleLoading: boolean = false
  modalConfirmToggleStatus : boolean = false
  courseIdSelect: number = 0;
  subtitleNewParallel: string = '';
  parallelSelect : any;
  openModalEdit: boolean = false
  search = '';
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  totalCourses = 0;
  totalLimit: number = 0;
  totalStudentsForCareer: number = 0;

  totalStudents: number = 0;
  totalCapacity: number = 0;
  courses: any[] = [];

  openModalView: boolean = false;
  loading = false;
  loadingModal = false;
  openModalCreate = false;
  confirmDeleteOpen = false;
  deletingCourse = false;

  // Schedule properties
  subjects: any[] = [];
  days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
  careerId: number | null = null;
  savingSchedule = false;

  // Schedule CRUD
  schedules: any[] = [];
  selectedParallel: any = null;
  modalSchedule: boolean = false;

  // Materials by parallel
  modalMaterials: boolean = false;
  parallelMaterials: any[] = [];
  loadingMaterials = false;
  materialsParallel: any = null;

  // Students by parallel
  modalStudents: boolean = false;
  parallelStudents: any[] = [];
  loadingStudents = false;
  studentsParallel: any = null;

  // Advance level from a parallel's student
  modalAdvance: boolean = false;
  advanceStudent: any = null;
  advancePreview: any = null;
  advanceParallels: any[] = [];
  advanceParallelId: number | null = null;
  advanceCurrentLevel: number | null = null;
  advanceNextLevel: number | null = null;
  advanceTotalLevels: number | null = null;
  advanceIsLastLevel = false;
  advanceLoading = false;
  advanceSaving = false;
  advanceConfirmOpen = false;
  advanceEgressConfirmOpen = false;
  advanceResultModal = false;
  advanceResult: any = null;

  // Advance whole parallel
  modalParallelAdvance = false;
  parallelAdvancePreview: any = null;
  parallelAdvanceParallels: any[] = [];
  parallelAdvanceParallelId: number | null = null;
  parallelAdvanceLoading = false;
  parallelAdvanceSaving = false;
  parallelAdvanceConfirmOpen = false;
  parallelAdvanceResultModal = false;
  parallelAdvanceResult: any = null;

  // Form for adding/editing schedule items
  scheduleForm: FormGroup;
  editingScheduleId: number | null = null;
  savingScheduleItem = false;
  showScheduleForm = false;

  // Confirm delete
  confirmDeleteScheduleId: number | null = null;
  confirmDeleteScheduleOpen = false;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private parallelService: ParallelService,
    private scheduleService: ScheduleService,
    private subjectService: SubjectService,
    private studentService: StudentService,
    private toast: ToastService,
    private authService: AuthService,
  ) {
    this.formParallel = this.fb.group({
      course_id: [null, Validators.required],
      turno: ['', Validators.required],
      parallel: ['', [Validators.required, Validators.maxLength(10)]],
      limit: [15, [Validators.required, Validators.min(5)]],
    });

    this.scheduleForm = this.fb.group({
      subject_id: [null, Validators.required],
      day: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService
      .getCourses(this.currentPage, this.perPage, this.search)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.totalCourses = response.total;
          this.totalLimit = response.total_limit;
          this.totalStudentsForCareer = response.total_students;
          this.currentPage = response.courses.current_page;
          this.lastPage = response.courses.last_page;
          this.courses = response.courses.data;
        },
        error: (err) => {
          this.loading = false;
          this.toast.error('Error al cargar los cursos');
        },
      });
  }

  viewParallels(course: any) {
    this.loadingModal = true;
    this.courseIdSelect = course.id;
    this.subtitleNewParallel = course.career.name + ' > ' + course.name;
    this.openModalView = true;
    this.selectedParallel = null;
    this.careerId = course.career_id;
    this.selectedCourseLevel = course.level;

    this.parallelService.getParallelsByCourse(course.id).subscribe({
      next: (resp) => {
        this.loadingModal = false;
        this.totalStudents = resp.summary.total_students;
        this.totalCapacity = resp.summary.total_capacity;
        this.parallels = resp.parallels;
      },
      error: (err) => {
        this.loadingModal = false;
      },
    });
  }

  // ── Búsqueda con debounce ──
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadCourses();
    }, 400);
  }

  // ── Paginación ──
  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadCourses();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCourses();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadCourses();
  }

  get from(): number {
    return (this.currentPage - 1) * this.perPage + 1;
  }

  get to(): number {
    return Math.min(this.currentPage * this.perPage, this.totalCourses);
  }

  // ── Modal crear paralelo ──
  openModalAddParallel(course: any): void {
    this.courseIdSelect = course.id;
    this.subtitleNewParallel = course.career.name + ' > ' + course.name;
    this.openModalCreate = true;
  }

  // ── Guardar paralelo (crear o editar) ──
  save(): void {
    this.formParallel.patchValue({
      course_id: this.courseIdSelect,
    });
    if (this.formParallel.invalid) {
      this.formParallel.markAllAsTouched();
      this.toast.info('Complete correctamente los campos requeridos.');
      return;
    }
    this.loadingModal = true;

    if (this.openModalEdit && this.parallelSelect) {
      // Editar paralelo existente
      this.parallelService.updateParallel(this.parallelSelect.id, this.formParallel.value).subscribe({
        next: (resp) => {
          this.loadingModal = false;
          this.toast.success('Paralelo actualizado correctamente.');
          this.loadCourses()

          this.parallelService.getParallelsByCourse(this.courseIdSelect).subscribe({
            next: (resp) => {
              this.loadingModal = false;
              this.totalStudents = resp.summary.total_students;
              this.totalCapacity = resp.summary.total_capacity;
              this.parallels = resp.parallels;
            },
            error: (err) => {
              this.loadingModal = false;
            },
          });
          this.openModalEdit = false;
          this.parallelSelect = null;
        },
        error: (err) => {
          this.loadingModal = false;
          if (err?.status === 422) {
            this.toast.info('No se puede reducir el cupo');
            return;
          }
          this.toast.error('Ocurrió un error');
        },
      });
    } else {
      // Crear paralelo nuevo
      this.parallelService.createParallel(this.formParallel.value).subscribe({
        next: (resp) => {
          this.loadingModal = false;
          this.toast.success('Paralelo registrado correctamente.');
          this.loadCourses()
          this.openModalCreate = false;
        },
        error: (err) => {
          this.loadingModal = false;
          this.toast.error('Ocurrió un error');
        },
      });
    }
  }

  cancel(): void {
    this.openModalCreate = false;
  }

  cancelEdit(): void {
    this.openModalEdit = false;
    this.parallelSelect = null;
  }

  cancelView() {
    this.openModalView = false;
    this.selectedParallel = null;
  }

  // ── Ver materiales enlazados a un paralelo ──
  openMaterials(parallel: any) {
    this.materialsParallel = parallel;
    this.parallelMaterials = [];
    this.modalMaterials = true;
    this.loadingMaterials = true;

    this.subjectService.getMaterialsByParallel(parallel.id).subscribe({
      next: (resp) => {
        this.loadingMaterials = false;
        this.parallelMaterials = resp.materials || [];
      },
      error: () => {
        this.loadingMaterials = false;
        this.parallelMaterials = [];
        this.toast.error('Error al cargar los materiales del paralelo');
      },
    });
  }

  cancelMaterials() {
    this.modalMaterials = false;
    this.materialsParallel = null;
    this.parallelMaterials = [];
  }

  // ── Ver estudiantes de un paralelo ──
  openStudents(parallel: any) {
    this.studentsParallel = parallel;
    this.parallelStudents = [];
    this.modalStudents = true;
    this.loadingStudents = true;

    this.parallelService.getStudentsByParallel(parallel.id).subscribe({
      next: (resp) => {
        this.loadingStudents = false;
        this.parallelStudents = resp.students || [];
      },
      error: () => {
        this.loadingStudents = false;
        this.parallelStudents = [];
        this.toast.error('Error al cargar los estudiantes del paralelo');
      },
    });
  }

  cancelStudents() {
    this.modalStudents = false;
    this.studentsParallel = null;
    this.parallelStudents = [];
  }

  // ── Avanzar de nivel desde un paralelo ──
  get isAdmin(): boolean {
    const user = this.authService.user;
    if (user?.currentRole?.id == Roles.ADMIN.id) return true;
    return Array.isArray(user?.roles) && user.roles.some((r: any) => r.id == Roles.ADMIN.id);
  }

  ordinalLabel(n: number | null): string {
    const ordinals = ['Primero', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo'];
    return ordinals[(n ?? 0) - 1] || `${n ?? 0}º`;
  }

  openAdvance(student: any) {
    this.advanceStudent = student;
    this.advancePreview = null;
    this.advanceParallels = [];
    this.advanceParallelId = null;
    this.advanceCurrentLevel = null;
    this.advanceNextLevel = null;
    this.advanceTotalLevels = null;
    this.advanceIsLastLevel = false;
    this.modalAdvance = true;
    this.loadAdvancePreview();
  }

  closeAdvance() {
    this.modalAdvance = false;
    this.advanceStudent = null;
    this.advancePreview = null;
    this.advanceParallels = [];
    this.advanceParallelId = null;
    this.advanceResult = null;
    this.advanceResultModal = false;
  }

  loadAdvancePreview() {
    if (!this.advanceStudent || !this.careerId) return;
    this.advanceLoading = true;
    this.studentService.previewAdvanceLevel(this.advanceStudent.id, this.careerId).subscribe({
      next: (res) => {
        this.advanceLoading = false;
        this.advancePreview = res;
        this.advanceCurrentLevel = res.current_level;
        this.advanceNextLevel = res.new_level;
        this.advanceTotalLevels = res.total_levels;
        this.advanceIsLastLevel = res.is_last_level;
        this.advanceParallels = res.available_parallels || [];
      },
      error: (err) => {
        this.advanceLoading = false;
        const message = err?.error?.message;
        if (message) {
          this.toast.info(message);
          return;
        }
        this.toast.error('Error al obtener la vista previa del avance');
      }
    });
  }

  get advanceConfirmMessage(): string {
    if (!this.advancePreview) {
      return '¿Confirma el avance de nivel del estudiante?';
    }
    const parts = [
      `Moverá al estudiante del nivel ${this.ordinalLabel(this.advanceCurrentLevel)} al ${this.ordinalLabel(this.advanceNextLevel)}.`,
      `Toma ahora: ${(this.advancePreview.assigned || []).length}.`,
      `Aprobadas: ${(this.advancePreview.approved || []).length}.`,
      `Repite: ${(this.advancePreview.repeated || []).length}.`,
      `Pendientes por pre-requisito: ${(this.advancePreview.missing_by_prerequisite || []).length}.`,
    ];
    return parts.join(' ');
  }

  confirmAdvance() {
    if (this.advanceSaving) return;
    if (!this.advanceStudent) return;
    if (!this.advanceParallelId) {
      this.toast.error('Seleccione un paralelo del siguiente nivel');
      return;
    }
    this.advanceSaving = true;
    this.advanceConfirmOpen = false;
    this.studentService.advanceLevel(this.advanceStudent.id, {
      career_id: this.careerId,
      parallel_id: this.advanceParallelId,
    }).subscribe({
      next: (res) => {
        this.advanceSaving = false;
        this.advanceResult = res;
        this.advanceResultModal = true;
        this.toast.success('Nivel avanzado correctamente');
        this.reloadParallelStudents();
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

  confirmGraduate() {
    if (this.advanceSaving) return;
    if (!this.advanceStudent) return;
    if (!this.careerId) return;
    this.advanceSaving = true;
    this.advanceEgressConfirmOpen = false;
    this.studentService.graduate(this.advanceStudent.id, this.careerId).subscribe({
      next: (res) => {
        this.advanceSaving = false;
        this.toast.success(res?.message || 'Estudiante egresado correctamente');
        this.closeAdvance();
        this.reloadParallelStudents();
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
        this.toast.error('Error al egresar al estudiante');
      }
    });
  }

  reloadParallelStudents() {
    if (this.studentsParallel) {
      this.openStudents(this.studentsParallel);
    }
  }

  // ── Avanzar de nivel a todo el paralelo ──
  openParallelAdvance() {
    if (!this.studentsParallel) return;
    this.parallelAdvancePreview = null;
    this.parallelAdvanceParallels = [];
    this.parallelAdvanceParallelId = null;
    this.parallelAdvanceResult = null;
    this.parallelAdvanceResultModal = false;
    this.modalParallelAdvance = true;
    this.loadParallelAdvancePreview();
  }

  closeParallelAdvance() {
    this.modalParallelAdvance = false;
    this.parallelAdvancePreview = null;
    this.parallelAdvanceParallels = [];
    this.parallelAdvanceParallelId = null;
    this.parallelAdvanceResult = null;
    this.parallelAdvanceResultModal = false;
  }

  loadParallelAdvancePreview() {
    if (!this.studentsParallel) return;
    this.parallelAdvanceLoading = true;
    this.parallelService.previewParallelAdvance(this.studentsParallel.id).subscribe({
      next: (res) => {
        this.parallelAdvanceLoading = false;
        this.parallelAdvancePreview = res;
        this.parallelAdvanceParallels = res.available_parallels || [];
      },
      error: (err) => {
        this.parallelAdvanceLoading = false;
        const message = err?.error?.message;
        if (message) {
          this.toast.info(message);
          return;
        }
        this.toast.error('Error al obtener la vista previa del avance del paralelo');
      },
    });
  }

  get parallelAdvanceConfirmMessage(): string {
    if (!this.parallelAdvancePreview) {
      return '¿Confirma el avance de nivel de todos los estudiantes del paralelo?';
    }
    const s = this.parallelAdvancePreview.summary || {};
    return `Se avanzarán ${s.advanceable ?? 0} estudiante(s) del nivel ${this.ordinalLabel(this.parallelAdvancePreview.current_level)} al ${this.ordinalLabel(this.parallelAdvancePreview.new_level)}. ${s.last_level ?? 0} se omiten por cursar el último nivel. Esta acción no se puede deshacer.`;
  }

  hasSufficientParallel(): boolean {
    return (this.parallelAdvanceParallels || []).some((p) => p.sufficient);
  }

  confirmParallelAdvance() {
    if (this.parallelAdvanceSaving) return;
    if (!this.studentsParallel) return;
    if (!this.parallelAdvanceParallelId) {
      this.toast.error('Seleccione un paralelo del siguiente nivel');
      return;
    }
    this.parallelAdvanceSaving = true;
    this.parallelAdvanceConfirmOpen = false;
    this.parallelService.advanceParallelLevel(this.studentsParallel.id, this.parallelAdvanceParallelId).subscribe({
      next: (res) => {
        this.parallelAdvanceSaving = false;
        this.parallelAdvanceResult = res;
        this.parallelAdvanceResultModal = true;
        this.toast.success(res?.message || 'Paralelo avanzado de nivel correctamente');
        this.reloadParallelStudents();
      },
      error: (err: any) => {
        this.parallelAdvanceSaving = false;
        const message = err?.error?.message;
        if (message) {
          this.toast.info(message);
          return;
        }
        if (err.status === 403) {
          this.toast.error('Solo el administrador puede realizar esta acción');
          return;
        }
        this.toast.error('Error al avanzar de nivel el paralelo');
      },
    });
  }

  viewMaterial(materialId: number) {
    this.subjectService.dowloadFile(materialId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      },
      error: () => {
        this.toast.error('Error al abrir el archivo');
      },
    });
  }

  downloadMaterial(materialId: number) {
    this.subjectService.dowloadFile(materialId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = `archivo_${materialId}`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      },
      error: () => {
        this.toast.error('Error al descargar el archivo');
      },
    });
  }

  // ── Schedule / Horario CRUD ──
  parallels: any[] = [];
  selectedCourseLevel: number = 0;

  selectParallel(parallel: any) {
    this.selectedParallel = parallel;
    this.modalSchedule = true;
    this.schedules = [];
    this.showScheduleForm = false;
    this.editingScheduleId = null;
    this.scheduleForm.reset();
    this.confirmDeleteScheduleId = null;
    this.confirmDeleteScheduleOpen = false;

    // Cargar materias de la carrera filtradas por el nivel del curso
    if (this.careerId && this.selectedCourseLevel) {
      this.scheduleService.getSubjectsByCareer(this.careerId, this.selectedCourseLevel).subscribe({
        next: (resp) => {
          this.subjects = resp.subjects || [];
        },
        error: () => {
          this.subjects = [];
        },
      });
    }

    // Cargar horario existente
    this.loadSchedules();
  }

  loadSchedules() {
    if (!this.selectedParallel) return;
    this.scheduleService.getByParallel(this.selectedParallel.id).subscribe({
      next: (resp) => {
        this.schedules = resp.schedules || [];
      },
      error: () => {
        this.schedules = [];
      },
    });
  }

  getSubjectName(subjectId: number | null): string {
    if (!subjectId) return '';
    const subject = this.subjects.find((s) => s.id === subjectId);
    return subject ? `${subject.sigla} - ${subject.name}` : '';
  }

  // ── Add / Edit Schedule Item ──
  openAddScheduleForm() {
    this.editingScheduleId = null;
    this.scheduleForm.reset();
    this.showScheduleForm = true;
  }

  openEditScheduleForm(schedule: any) {
    this.editingScheduleId = schedule.id;
    this.scheduleForm.patchValue({
      subject_id: schedule.subject_id,
      day: schedule.day,
      start_time: this.normalizeTime(schedule.start_time),
      end_time: this.normalizeTime(schedule.end_time),
    });
    this.showScheduleForm = true;
  }

  cancelScheduleForm() {
    this.showScheduleForm = false;
    this.editingScheduleId = null;
    this.scheduleForm.reset();
  }

  saveScheduleItem() {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      this.toast.info('Complete todos los campos requeridos.');
      return;
    }

    const formValue = this.scheduleForm.value;
    if (formValue.start_time >= formValue.end_time) {
      this.toast.info('La hora de fin debe ser mayor a la hora de inicio.');
      return;
    }

    this.savingScheduleItem = true;
    const data = {
      subject_id: formValue.subject_id,
      day: formValue.day,
      start_time: formValue.start_time,
      end_time: formValue.end_time,
      parallel_id: this.selectedParallel.id,
    };

    if (this.editingScheduleId) {
      // Update existing
      this.scheduleService.updateSchedule(this.editingScheduleId, data).subscribe({
        next: (resp) => {
          this.savingScheduleItem = false;
          this.toast.success('Horario actualizado correctamente.');
          this.cancelScheduleForm();
          this.loadSchedules();
        },
        error: () => {
          this.savingScheduleItem = false;
          this.toast.error('Error al actualizar el horario.');
        },
      });
    } else {
      // Create new
      this.scheduleService.createSchedule(data).subscribe({
        next: (resp) => {
          this.savingScheduleItem = false;
          this.toast.success('Horario agregado correctamente.');
          this.cancelScheduleForm();
          this.loadSchedules();
        },
        error: () => {
          this.savingScheduleItem = false;
          this.toast.error('Error al agregar el horario.');
        },
      });
    }
  }

  // ── Delete Schedule Item ──
  confirmDeleteSchedule(scheduleId: number) {
    this.confirmDeleteScheduleId = scheduleId;
    this.confirmDeleteScheduleOpen = true;
  }

  cancelDeleteSchedule() {
    this.confirmDeleteScheduleId = null;
    this.confirmDeleteScheduleOpen = false;
  }

  deleteSchedule() {
    if (!this.confirmDeleteScheduleId) return;
    this.savingScheduleItem = true;
    this.scheduleService.deleteSchedule(this.confirmDeleteScheduleId).subscribe({
      next: () => {
        this.savingScheduleItem = false;
        this.toast.success('Horario eliminado correctamente.');
        this.cancelDeleteSchedule();
        this.loadSchedules();
      },
      error: () => {
        this.savingScheduleItem = false;
        this.toast.error('Error al eliminar el horario.');
      },
    });
  }

  openEditModal(parallel: any){
    this.parallelSelect = parallel;
    this.formParallel.patchValue({
      course_id: this.courseIdSelect,
      turno: parallel.turno,
      parallel: parallel.paralelo,
      limit: parallel.limit,
    });
    this.openModalEdit = true;
  }

  toggleStatus(parallel : any){
    this.parallelSelect = parallel.id;
    this.modalConfirmToggleStatus = true;
    if(parallel.status == 1){
      this.titleConfirm = "Inhabilitar paralelo"
      this.messageConfirm = "¿Esta accion inhabilitara al paralelo?"
      this.iconConfirm = "fa-solid fa-triangle-exclamation text-4xl text-red-600"
    }else{
      this.titleConfirm = "Habilitar paralelo"
      this.messageConfirm = "¿Esta accion habilitara al paralelo?"
      this.iconConfirm = "fa-solid fa-circle-check text-4xl text-green-600";
    }
  }
  confirmToggleStatus(){
    this.modalConfirmToggleStatus = false;
    this.parallelService.toggleStatus(this.parallelSelect).subscribe({
      next: (resp) =>{
          this.toast.success('El paralelo se habilito')
          const parallel = this.parallels.find(
            p => p.id === this.parallelSelect
          );
          if (parallel) {
            parallel.status = parallel.status ? 0 : 1;
          }
      },
      error: (err) =>{
        if(err.status = 422){
          this.toast.info('El paralelo no puede inhabilitarse')
          return
        }
        this.toast.error('Error al actualizar el paralelo')
      }
    })

  }
  // ── Get day name in Spanish ──
  getDayName(day: string): string {
    const dayMap: { [key: string]: string } = {
      'Lunes': 'Lunes',
      'Martes': 'Martes',
      'Miercoles': 'Miércoles',
      'Jueves': 'Jueves',
      'Viernes': 'Viernes',
      'Sabado': 'Sábado',
      'Domingo': 'Domingo',
    };
    return dayMap[day] || day;
  }

  // ── Grilla de horarios ──
  /** Normaliza hora "09:00:00" -> "09:00" para comparar */
  private normalizeTime(time: string): string {
    return time ? time.substring(0, 5) : '';
  }

  /** Paleta de colores para materias */
  private readonly SUBJECT_COLORS = [
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', sigla: 'text-blue-600' },
    { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', sigla: 'text-emerald-600' },
    { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', sigla: 'text-amber-600' },
    { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800', sigla: 'text-rose-600' },
    { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-800', sigla: 'text-violet-600' },
    { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-800', sigla: 'text-cyan-600' },
    { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', sigla: 'text-orange-600' },
    { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800', sigla: 'text-teal-600' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', sigla: 'text-pink-600' },
    { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', sigla: 'text-indigo-600' },
    { bg: 'bg-lime-100', border: 'border-lime-300', text: 'text-lime-800', sigla: 'text-lime-600' },
    { bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', text: 'text-fuchsia-800', sigla: 'text-fuchsia-600' },
  ];

  private subjectColorMap = new Map<number, { bg: string; border: string; text: string; sigla: string }>();
  private nextColorIndex = 0;

  getSubjectColor(subjectId: number | undefined): { bg: string; border: string; text: string; sigla: string } {
    if (!subjectId) return this.SUBJECT_COLORS[0];
    if (!this.subjectColorMap.has(subjectId)) {
      this.subjectColorMap.set(subjectId, this.SUBJECT_COLORS[this.nextColorIndex % this.SUBJECT_COLORS.length]);
      this.nextColorIndex++;
    }
    return this.subjectColorMap.get(subjectId)!;
  }

  getScheduleForSlot(day: string, startTime: string): any {
    return this.schedules.find(s =>
      s.day === day && this.normalizeTime(s.start_time) === startTime
    ) || null;
  }

  get timeSlots(): { start: string; end: string }[] {
    const seen = new Set<string>();
    const slots: { start: string; end: string }[] = [];
    for (const s of this.schedules) {
      const start = this.normalizeTime(s.start_time);
      const end = this.normalizeTime(s.end_time);
      const key = `${start}-${end}`;
      if (!seen.has(key)) {
        seen.add(key);
        slots.push({ start, end });
      }
    }
    return slots.sort((a, b) => a.start.localeCompare(b.start));
  }

}
