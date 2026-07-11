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

  courses: any[] = [];

  openModalView: boolean = false;
  loading = false;
  loadingModal = false;
  openModalCreate = false;
  confirmDeleteOpen = false;
  deletingCourse = false;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private parallelService: ParallelService,
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
  viewParallels(id: number) {
    this.openModalView = true;
  }
  // ── Búsqueda con debounce ─────────────────────────────────────────────────
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadCourses();
    }, 400);
  }

  // ── Paginación ────────────────────────────────────────────────────────────
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

  // ── Modal crear ───────────────────────────────────────────────────────────

  openModalAddParallel(course: any): void {
    this.courseIdSelect = course.id;
    this.subtitleNewParallel = course.career.name + ' > ' + course.name;
    this.openModalCreate = true;
  }

  // ── Guardar (create / update) ─────────────────────────────────────────────
  save(): void {
    this.formParallel.patchValue({
      course_id: this.courseIdSelect,
    });
    console.log(this.formParallel.value);
    if (this.formParallel.invalid) {
      this.formParallel.markAllAsTouched();
      alert('Complete correctamente los campos requeridos.');
      return;
    }
    this.loadingModal = true;
    this.parallelService.createParallel(this.formParallel.value).subscribe({
      next: (resp) => {
        this.loadingModal = false;
        alert('Paralelo registrado correctamente.');
      },
      error: (err) => {
        this.loadingModal = false;
        alert(err.error?.message ?? 'Ocurrió un error al guardar.');
        console.log(err.error.error)
      },
    });
  }

  cancel(): void {
    this.openModalCreate = false;
  }
  cancelView() {
    this.openModalView = false;
  }

  //añadido
  parallels = [
    {
      id: 1,
      name: 'A',
      shift: 'Mañana',
      students: 28,
      capacity: 35,
    },

    {
      id: 2,
      name: 'B',
      shift: 'Tarde',
      students: 35,
      capacity: 35,
    },

    {
      id: 3,
      name: 'C',
      shift: 'Noche',
      students: 18,
      capacity: 35,
    },
  ];

  selectedParallel: any = null;

  selectParallel(parallel: any) {
    this.selectedParallel = parallel;
  }
  get totalStudents() {
    return this.parallels.reduce((a, b) => a + b.students, 0);
  }

  get totalCapacity() {
    return this.parallels.reduce((a, b) => a + b.capacity, 0);
  }

  schedule = [
    {
      hour: '08:00 - 10:00',

      days: [
        {
          subject: 'Programación',
          teacher: 'Ing. Carlos',
        },

        {
          subject: 'Matemática',
          teacher: 'Lic. Ana',
        },

        {
          subject: 'Programación',
          teacher: 'Ing. Carlos',
        },

        null,

        null,

        {
          subject: 'Inglés',
          teacher: 'Lic. José',
        },
      ],
    },

    {
      hour: '10:00 - 12:00',

      days: [
        {
          subject: 'Base de Datos',
          teacher: 'Ing. Pedro',
        },

        null,

        {
          subject: 'Física',
          teacher: 'Lic. Mario',
        },

        null,

        {
          subject: 'Ética',
          teacher: 'Lic. Sonia',
        },

        null,
      ],
    },
  ];
}
