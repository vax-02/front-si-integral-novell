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
  days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  timeBlocks = [
    { start: '08:00', end: '09:30' },
    { start: '09:45', end: '11:15' },
    { start: '11:30', end: '13:00' },
    { start: '14:00', end: '15:30' },
    { start: '15:45', end: '17:15' },
    { start: '17:30', end: '19:00' },
    { start: '19:15', end: '20:45' },
  ];
  scheduleData: { [key: string]: { [key: string]: number | null } } = {};
  careerId: number | null = null;
  savingSchedule = false;

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
        error: () => {
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

    // Cargar materias de la carrera para el horario
    if (this.careerId) {
      this.scheduleService.getSubjectsByCareer(this.careerId).subscribe({
        next: (resp) => {
          this.subjects = resp.subjects || [];
        },
        error: () => {
          this.subjects = [];
        },
      });
    }

    this.parallelService.getParallelsByCourse(course.id).subscribe({
      next: (resp) => {
        this.loadingModal = false;
        this.totalStudents = resp.summary.total_students;
        this.totalCapacity = resp.summary.total_capacity;
        this.parallels = resp.parallels;
      },
      error: (err) => {
        console.log(err);
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

  // ── Schedule / Horario ──
  parallels: any[] = [];
  selectedParallel: any = null;

  selectParallel(parallel: any) {
    this.selectedParallel = parallel;
    this.initScheduleData();

    // Cargar horario existente
    this.scheduleService.getByParallel(parallel.id).subscribe({
      next: (resp) => {
        const schedules = resp.schedules || [];
        schedules.forEach((s: any) => {
          const key = `${s.day}_${s.start_time}_${s.end_time}`;
          const parts = this.findTimeBlockKey(s.day, s.start_time, s.end_time);
          if (parts) {
            this.scheduleData[s.day][parts] = s.subject_id;
          }
        });
      },
      error: () => {
        // No hay horario guardado aún, iniciar vacío
      },
    });
  }

  private findTimeBlockKey(day: string, start: string, end: string): string | null {
    for (const block of this.timeBlocks) {
      if (block.start === start && block.end === end) {
        return `${block.start}_${block.end}`;
      }
    }
    return null;
  }

  private initScheduleData() {
    this.scheduleData = {};
    this.days.forEach((day) => {
      this.scheduleData[day] = {};
      this.timeBlocks.forEach((block) => {
        const key = `${block.start}_${block.end}`;
        this.scheduleData[day][key] = null;
      });
    });
  }

  getSubjectName(subjectId: number | null): string {
    if (!subjectId) return '';
    const subject = this.subjects.find((s) => s.id === subjectId);
    return subject ? `${subject.sigla} - ${subject.name}` : '';
  }

  saveSchedule() {
    if (!this.selectedParallel) return;
    this.savingSchedule = true;

    const schedules: any[] = [];
    this.days.forEach((day) => {
      this.timeBlocks.forEach((block) => {
        const key = `${block.start}_${block.end}`;
        const subjectId = this.scheduleData[day]?.[key];
        if (subjectId) {
          schedules.push({
            day,
            start_time: block.start,
            end_time: block.end,
            subject_id: subjectId,
          });
        }
      });
    });

    this.scheduleService.saveSchedules(this.selectedParallel.id, schedules).subscribe({
      next: () => {
        this.savingSchedule = false;
        this.toast.success('Horario guardado correctamente.');
      },
      error: () => {
        this.savingSchedule = false;
        this.toast.error('Error al guardar el horario.');
      },
    });
  }
}