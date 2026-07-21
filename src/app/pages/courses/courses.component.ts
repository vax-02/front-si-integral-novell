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

@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BaseModalComponent,
    ButtonComponent,
    BaseInputComponent,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent implements OnInit {
  formParallel!: FormGroup;
  private searchTimeout: any;
  courseIdSelect: number = 0;
  subtitleNewParallel: string = '';
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
  timeBlocks: { start: string; end: string }[] = [];
  careerId: number | null = null;
  savingSchedule = false;

  // Schedule CRUD
  schedules: any[] = [];
  selectedParallel: any = null;
  modalSchedule: boolean = false;

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
    private toast: ToastService,
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
      end_time: [''],
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

  // ── Guardar paralelo ──
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

  cancel(): void {
    this.openModalCreate = false;
  }

  cancelView() {
    this.openModalView = false;
    this.selectedParallel = null;
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

    // Establecer bloques horarios según el turno del paralelo
    this.setTimeBlocksByTurno(parallel.turno);

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

  /** Define los bloques horarios según el turno del paralelo */
  private setTimeBlocksByTurno(turno: string): void {
    const blocks: Record<string, { start: string; end: string }[]> = {
      'Mañana': [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' },
        { start: '12:00', end: '13:00' },
      ],
      'Tarde': [
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
        { start: '17:00', end: '18:00' },
      ],
      'Noche': [
        { start: '18:00', end: '19:00' },
        { start: '19:00', end: '20:00' },
        { start: '20:00', end: '21:00' },
        { start: '21:00', end: '22:00' },
      ],
    };
    this.timeBlocks = blocks[turno] || [];
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
      start_time: schedule.start_time,
      end_time: schedule.end_time,
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

    this.savingScheduleItem = true;
    const formValue = this.scheduleForm.value;
    const data = {
      ...formValue,
      end_time: this.getEndTimeByStart(formValue.start_time),
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

  /** Devuelve el schedule (o null) para un día y hora de inicio dados */
  getScheduleForSlot(day: string, startTime: string): any {
    return this.schedules.find(s =>
      s.day === day && this.normalizeTime(s.start_time) === startTime
    ) || null;
  }

  /** Obtiene la hora fin a partir de la hora de inicio según los bloques definidos */
  getEndTimeByStart(startTime: string): string {
    const block = this.timeBlocks.find(b => b.start === startTime);
    return block ? block.end : '';
  }

  /** Retorna true si una celda tiene materia asignada */
  hasSchedule(day: string, startTime: string): boolean {
    return this.schedules.some(s =>
      s.day === day && this.normalizeTime(s.start_time) === startTime
    );
  }
}