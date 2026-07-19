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
  timeBlocks = [
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '14:00', end: '15:00' },
    { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' },
    { start: '19:15', end: '20:45' },
  ];
  scheduleData: { [key: string]: { [key: string]: number | null } } = {};
  careerId: number | null = null;
  savingSchedule = false;

  // Autocomplete properties
  searchTexts: { [cellKey: string]: string } = {};
  showDropdowns: { [cellKey: string]: boolean } = {};
  filteredSubjects: { [cellKey: string]: any[] } = {};
  selectedCourseLevel: number = 0;

  // Colors for repeated subjects
  subjectColors: { [subjectId: number]: string } = {};
  private colorPalette = [
    '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#E0E7FF',
    '#FED7AA', '#C7D2FE', '#A7F3D0', '#FDE68A', '#DDD6FE',
    '#FECACA', '#BBDEFB', '#C8E6C9', '#F8BBD0', '#C5CAE9',
    '#FFE0B2', '#B3E5FC', '#DCEDC8', '#FFCCBC', '#D7CCC8',
  ];

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

  // ── Schedule / Horario ──
  parallels: any[] = [];
  selectedParallel: any = null;

  modalSchedule : boolean = false
  selectParallel(parallel: any) {
    this.selectedParallel = parallel;
    this.initScheduleData();
    this.modalSchedule = true;
    this.searchTexts = {};
    this.showDropdowns = {};
    this.filteredSubjects = {};

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
    this.scheduleService.getByParallel(parallel.id).subscribe({
      next: (resp) => {
        const schedules = resp.schedules || [];
        schedules.forEach((s: any) => {
          const key = `${s.day}_${s.start_time}_${s.end_time}`;
          const parts = this.findTimeBlockKey(s.day, s.start_time, s.end_time);
          if (parts) {
            this.scheduleData[s.day][parts] = s.subject_id;
            // Set the search text for this cell
            const cellKey = `${s.day}_${parts}`;
            if (s.subject) {
              this.searchTexts[cellKey] = `${s.subject.sigla} - ${s.subject.name}`;
            }
          }
        });
        this.updateSubjectColors();
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

  // ── Autocomplete search ──
  onSubjectSearch(day: string, blockKey: string, value: string) {
    const cellKey = `${day}_${blockKey}`;
    this.searchTexts[cellKey] = value;

    // If the user cleared the input, remove the subject
    if (!value.trim()) {
      this.scheduleData[day][blockKey] = null;
      this.showDropdowns[cellKey] = false;
      this.updateSubjectColors();
      return;
    }

    // Filter subjects locally
    const searchLower = value.toLowerCase();
    const filtered = this.subjects.filter(
      (s) =>
        s.sigla.toLowerCase().includes(searchLower) ||
        s.name.toLowerCase().includes(searchLower)
    );
    this.filteredSubjects[cellKey] = filtered;
    this.showDropdowns[cellKey] = filtered.length > 0;
  }

  selectSubject(day: string, blockKey: string, subject: any) {
    const cellKey = `${day}_${blockKey}`;
    this.scheduleData[day][blockKey] = subject.id;
    this.searchTexts[cellKey] = `${subject.sigla} - ${subject.name}`;
    this.showDropdowns[cellKey] = false;
    this.updateSubjectColors();
  }

  onSubjectBlur(day: string, blockKey: string) {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      const cellKey = `${day}_${blockKey}`;
      this.showDropdowns[cellKey] = false;
    }, 200);
  }

  onSubjectFocus(day: string, blockKey: string) {
    const cellKey = `${day}_${blockKey}`;
    const value = this.searchTexts[cellKey] || '';
    if (value.trim()) {
      const searchLower = value.toLowerCase();
      const filtered = this.subjects.filter(
        (s) =>
          s.sigla.toLowerCase().includes(searchLower) ||
          s.name.toLowerCase().includes(searchLower)
      );
      this.filteredSubjects[cellKey] = filtered;
      this.showDropdowns[cellKey] = filtered.length > 0;
    }
  }

  // ── Colors for repeated subjects ──
  private updateSubjectColors() {
    this.subjectColors = {};
    
    // Count occurrences of each subject_id
    const subjectCount: { [id: number]: number } = {};
    const subjectPositions: { [id: number]: string[] } = {};
    
    this.days.forEach((day) => {
      this.timeBlocks.forEach((block) => {
        const key = `${block.start}_${block.end}`;
        const subjectId = this.scheduleData[day]?.[key];
        if (subjectId) {
          subjectCount[subjectId] = (subjectCount[subjectId] || 0) + 1;
          if (!subjectPositions[subjectId]) subjectPositions[subjectId] = [];
          subjectPositions[subjectId].push(`${day}_${key}`);
        }
      });
    });

    // Only assign colors to subjects that appear more than once
    let colorIndex = 0;
    Object.keys(subjectCount).forEach((idStr) => {
      const id = Number(idStr);
      if (subjectCount[id] > 1) {
        this.subjectColors[id] = this.colorPalette[colorIndex % this.colorPalette.length];
        colorIndex++;
      }
    });
  }

  getSubjectColor(subjectId: number | null): string {
    if (!subjectId) return '';
    return this.subjectColors[subjectId] || '';
  }

  getCellKey(day: string, blockKey: string): string {
    return `${day}_${blockKey}`;
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