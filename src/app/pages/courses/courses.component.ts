import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { CareerService } from '../../service/career.service';
import { CourseService } from '../../service/course.service';
import { ToastService } from '../../shared/services/toast.service';
import { CareerForSelect } from '../../interfaces/career';

@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BaseModalComponent,
    BaseModalConfirmComponent,
    ButtonComponent,
    BaseInputComponent,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent implements OnInit {
  // ── Estado de paginación y búsqueda ──────────────────────────────────────
  private searchTimeout: any;
  search = '';
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  totalCourses = 0;

  // ── Datos ─────────────────────────────────────────────────────────────────
  courses: any[] = [];
  careersForSelect: CareerForSelect[] = [];

  // ── Estado de UI ──────────────────────────────────────────────────────────
  loading = false;
  loadingModal = false;
  openModalCreate = false;
  confirmDeleteOpen = false;
  deletingCourse = false;
  editingCourseId: number | null = null;
  courseToDeleteId: number | null = null;

  // ── Formulario ────────────────────────────────────────────────────────────
  courseForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private careerService: CareerService,
    private courseService: CourseService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCareers();
    this.loadCourses();
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  initForm(): void {
    this.courseForm = this.fb.group({
      career_id: [null, [Validators.required]],
      gestion: [
        new Date().getFullYear(),
        [Validators.required, Validators.pattern(/^\d{4}$/)],
      ],
      paralelo: [
        '',
        [
          Validators.required,
          Validators.maxLength(2),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/),
        ],
      ],
      limit: [
        10,
        [Validators.required, Validators.pattern(/^[1-9]\d*$/), Validators.min(1)],
      ],
      turno: ['Mañana', [Validators.required]],
    });
  }

  get f() {
    return this.courseForm.controls;
  }

  // ── Carga de datos ────────────────────────────────────────────────────────
  loadCareers(): void {
    this.careerService.getCareersForSelect().subscribe({
      next: (response) => {
        this.careersForSelect = response.careers;
      },
      error: () => {
        this.toast.error('Error al cargar las carreras');
      },
    });
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getCourses(this.currentPage, this.perPage, this.search).subscribe({
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
  openCreateModal(): void {
    this.editingCourseId = null;
    this.courseForm.reset({
      career_id: null,
      gestion: new Date().getFullYear(),
      paralelo: '',
      limit: 10,
      turno: 'Mañana',
    });
    this.openModalCreate = true;
  }

  // ── Modal editar ──────────────────────────────────────────────────────────
  openEditModal(course: any): void {
    this.editingCourseId = course.id;
    this.courseForm.patchValue({
      career_id: course.career_id,
      gestion: course.gestion,
      paralelo: course.paralelo,
      limit: course.limit,
      turno: course.turno,
    });
    this.openModalCreate = true;
  }

  get modalTitle(): string {
    return this.editingCourseId ? 'Editar curso' : 'Crear curso';
  }

  get confirmText(): string {
    return this.editingCourseId ? 'Actualizar' : 'Guardar';
  }

  // ── Guardar (create / update) ─────────────────────────────────────────────
  save(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.loadingModal = true;

    const payload = {
      career_id: Number(this.courseForm.value.career_id),
      gestion: String(this.courseForm.value.gestion),
      paralelo: this.courseForm.value.paralelo,
      limit: Number(this.courseForm.value.limit),
      turno: this.courseForm.value.turno,
    };

    const isEdit = !!this.editingCourseId;

    const request$ = isEdit
      ? this.courseService.updateCourse(this.editingCourseId!, payload)
      : this.courseService.createCourse(payload);

    request$.subscribe({
      next: () => {
        this.loadingModal = false;
        this.openModalCreate = false;
        this.editingCourseId = null;
        this.loadCourses();
        this.toast.success(
          isEdit ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente',
        );
      },
      error: (error) => {
        this.loadingModal = false;
        this.toast.error(
          isEdit ? 'Error al actualizar el curso' : 'Error al crear el curso',
        );
        if (error?.error?.errors) {
          const errs = error.error.errors;
          if (errs.paralelo) this.toast.error('El paralelo ingresado ya existe en ese turno y gestión.');
          if (errs.career_id) this.toast.error('La carrera seleccionada no es válida.');
        }
      },
    });
  }

  cancel(): void {
    this.openModalCreate = false;
    this.editingCourseId = null;
    this.courseForm.reset({
      career_id: null,
      gestion: new Date().getFullYear(),
      paralelo: '',
      limit: 10,
      turno: 'Mañana',
    });
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  openDeleteConfirm(id: number): void {
    this.courseToDeleteId = id;
    this.confirmDeleteOpen = true;
  }

  closeDelete(): void {
    this.confirmDeleteOpen = false;
    this.courseToDeleteId = null;
  }

  deleteCourse(): void {
    if (!this.courseToDeleteId) return;

    this.deletingCourse = true;
    this.courseService.deleteCourse(this.courseToDeleteId).subscribe({
      next: () => {
        this.deletingCourse = false;
        this.confirmDeleteOpen = false;
        this.courseToDeleteId = null;

        // Si era el último de la página, retrocede una
        if (this.courses.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadCourses();
        this.toast.success('Curso eliminado exitosamente');
      },
      error: () => {
        this.deletingCourse = false;
        this.toast.error('Error al eliminar el curso');
      },
    });
  }
}
