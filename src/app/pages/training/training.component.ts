import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TrainingService } from '../../service/training.service';
import { DocenteService } from '../../service/docente.service';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';
import { CommonModule } from '@angular/common';
interface Course {
  id?: number;
  name: string;
  code?: string;
  type: 'vacacional' | 'intensivo' | 'taller' | 'diplomado' | 'curso_libre';
  modality: 'presencial' | 'virtual' | 'hibrido';
  start_date: string;
  end_date: string;
  schedule?: string;
  capacity: number;
  cost?: number;
  description?: string;
  status: 0 | 1 | 2 | 3; // 0:inactivo, 1:activo, 2:completado, 3:cancelado
  enrolled?: number;
  docente_id?: number;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
  docente?: any;
  enrollments?: any[];
}
@Component({
  selector: 'app-training',
  imports: [ReactiveFormsModule, CommonModule, BaseModalComponent, BaseModalConfirmComponent],
  templateUrl: './training.component.html',
  styleUrl: './training.component.css',
})
export class TrainingComponent implements OnInit {
  // ========== VARIABLES ==========
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  docentes: any[] = [];
  loading = false;
  saving = false;
  deleting = false;

  // MODALES
  modalOpen = false;
  modalDetailsOpen = false;
  confirmDeleteOpen = false;
  isEditMode = false;

  selectedCourse: Course | null = null;
  courseToDelete: Course | null = null;

  // FILTROS
  filters = {
    search: '',
    type: '',
    modality: '',
    status: '',
  };

  // PAGINACIÓN
  page = 1;
  pageSize = 10;
  Math = Math;

  // FORMULARIO
  courseForm: FormGroup;

  // ESTADÍSTICAS
  stats = {
    total: 0,
    active: 0,
    enrolled: 0,
    available: 0,
  };

  constructor(
    private fb: FormBuilder,
    private trainingService: TrainingService,
    private docenteService: DocenteService,
  ) {
    this.courseForm = this.fb.group({
      name: ['', Validators.required],
      code: [''],
      type: ['', Validators.required],
      modality: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      schedule: [''],
      capacity: ['', [Validators.required, Validators.min(1)]],
      cost: [0],
      description: [''],
      status: [1, Validators.required],
      docente_id: [null],
      contact_email: ['', Validators.email],
    });
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadDocentes();
  }

  // ========== CARGAR DATOS ==========
  loadCourses(): void {
    this.loading = true;
    this.trainingService.getTraining().subscribe({
      next: (response) => {
        this.courses = response.data || [];
        this.filteredCourses = [...this.courses];
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando cursos:', error);
        this.loading = false;
      },
    });
  }

  loadDocentes(): void {
    this.docenteService.getDocentes().subscribe({
      next: (response) => {
        this.docentes = response.data || [];
      },
      error: (error) => {
        console.error('Error cargando docentes:', error);
      },
    });
  }

  // ========== ESTADÍSTICAS ==========
  calculateStats(): void {
    this.stats.total = this.courses.length;
    this.stats.active = this.courses.filter((c) => c.status === 1).length;
    this.stats.enrolled = this.courses.reduce(
      (sum, c) => sum + (c.enrolled || 0),
      0,
    );

    const totalCapacity = this.courses.reduce(
      (sum, c) => sum + (c.capacity || 0),
      0,
    );
    this.stats.available = totalCapacity - this.stats.enrolled;
  }

  // ========== FILTROS ==========
  applyFilters(): void {
    this.filteredCourses = this.courses.filter((course) => {
      const matchesSearch =
        !this.filters.search ||
        course.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        (course.code &&
          course.code
            .toLowerCase()
            .includes(this.filters.search.toLowerCase()));

      const matchesType =
        !this.filters.type || course.type === this.filters.type;
      const matchesModality =
        !this.filters.modality || course.modality === this.filters.modality;

      const statusFilter = this.filters.status;
      const matchesStatus =
        !statusFilter ||
        (statusFilter === '1' && course.status === 1) ||
        (statusFilter === '0' && course.status === 0) ||
        (statusFilter === '2' && course.status === 2) ||
        (statusFilter === '3' && course.status === 3);

      return matchesSearch && matchesType && matchesModality && matchesStatus;
    });

    this.page = 1;
  }

  resetFilters(): void {
    this.filters = { search: '', type: '', modality: '', status: '' };
    this.applyFilters();
  }

  // ========== PAGINACIÓN ==========
  get totalPages(): number {
    return Math.ceil(this.filteredCourses.length / this.pageSize);
  }

  get paginatedCourses(): Course[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredCourses.slice(start, end);
  }

  prevPage(): void {
    if (this.page > 1) this.page--;
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.page++;
  }

  // ========== CRUD ==========
  openModal(): void {
    this.isEditMode = false;
    this.courseForm.reset({
      status: 1,
      cost: 0,
      capacity: null,
    });
    this.modalOpen = true;
  }

  openEditModal(course: Course): void {
    this.isEditMode = true;
    this.selectedCourse = course;
    this.courseForm.patchValue({
      name: course.name,
      code: course.code || '',
      type: course.type,
      modality: course.modality,
      start_date: course.start_date,
      end_date: course.end_date,
      schedule: course.schedule || '',
      capacity: course.capacity,
      cost: course.cost || 0,
      description: course.description || '',
      status: course.status,
      docente_id: course.docente_id || null,
      contact_email: course.contact_email || '',
    });
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.courseForm.reset();
    this.selectedCourse = null;
    this.isEditMode = false;
  }

  saveCourse(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.courseForm.value;

    const request =
      this.isEditMode && this.selectedCourse
        ? this.trainingService.updateTraining(
            this.selectedCourse.id!,
            formData,
          )
        : this.trainingService.createCourse(formData);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadCourses();
        // Mostrar mensaje de éxito
        this.showToast(
          this.isEditMode ? 'Curso actualizado' : 'Curso creado',
          'success',
        );
      },
      error: () => {
        this.saving = false;
        //console.error('Error guardando curso:', error);
        this.showToast('Error al guardar el curso', 'error');
      },
    });
  }

  viewDetails(course: Course): void {
    this.selectedCourse = course;
    // Cargar detalles completos (incluyendo inscritos)
    /*this.trainingService.getCourseDetails(course.id!).subscribe({
      next: (response) => {
        this.selectedCourse = response.data;
        this.modalDetailsOpen = true;
      },
      error: (error) => {
        console.error('Error cargando detalles:', error);
        // Si falla, mostrar lo que tenemos
        this.modalDetailsOpen = true;
      },
    });*/
  }

  closeDetails(): void {
    this.modalDetailsOpen = false;
    this.selectedCourse = null;
  }

  openConfirmDelete(course: Course): void {
    this.courseToDelete = course;
    this.confirmDeleteOpen = true;
  }

  closeConfirmDelete(): void {
    this.confirmDeleteOpen = false;
    this.courseToDelete = null;
  }

  deleteCourse(): void {
    if (!this.courseToDelete) return;

    this.deleting = true;
    /*this.capacitacionService.deleteCourse(this.courseToDelete.id!).subscribe({
      next: () => {
        this.deleting = false;
        this.closeConfirmDelete();
        this.loadCourses();
        this.showToast('Curso eliminado', 'success');
      },
      error: (error) => {
        this.deleting = false;
        console.error('Error eliminando curso:', error);
        this.showToast('Error al eliminar el curso', 'error');
      },
    });*/
  }

  // ========== HELPERS PARA BADGES ==========
  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      vacacional: 'Vacacional',
      intensivo: 'Intensivo',
      taller: 'Taller',
      diplomado: 'Diplomado',
      curso_libre: 'Curso Libre',
    };
    return labels[type] || type;
  }

  getTypeBadge(type: string): string {
    const classes: Record<string, string> = {
      vacacional: 'bg-blue-100 text-blue-700',
      intensivo: 'bg-purple-100 text-purple-700',
      taller: 'bg-amber-100 text-amber-700',
      diplomado: 'bg-emerald-100 text-emerald-700',
      curso_libre: 'bg-sky-100 text-sky-700',
    };
    return classes[type] || 'bg-slate-100 text-slate-700';
  }

  getModalityLabel(modality: string): string {
    const labels: Record<string, string> = {
      presencial: 'Presencial',
      virtual: 'Virtual',
      hibrido: 'Híbrido',
    };
    return labels[modality] || modality;
  }

  getModalityBadge(modality: string): string {
    const classes: Record<string, string> = {
      presencial: 'bg-indigo-100 text-indigo-700',
      virtual: 'bg-cyan-100 text-cyan-700',
      hibrido: 'bg-fuchsia-100 text-fuchsia-700',
    };
    return classes[modality] || 'bg-slate-100 text-slate-700';
  }

  getStatusLabel(status: number): string {
    const labels: Record<number, string> = {
      0: 'Inactivo',
      1: 'Activo',
      2: 'Completado',
      3: 'Cancelado',
    };
    return labels[status] || 'Desconocido';
  }

  getStatusBadge(status: number): string {
    const classes: Record<number, string> = {
      0: 'bg-red-100 text-red-700',
      1: 'bg-green-100 text-green-700',
      2: 'bg-blue-100 text-blue-700',
      3: 'bg-gray-100 text-gray-700',
    };
    return classes[status] || 'bg-slate-100 text-slate-700';
  }

  getProgress(course: Course): number {
    if (!course.capacity || course.capacity === 0) return 0;
    return Math.min(((course.enrolled || 0) / course.capacity) * 100, 100);
  }

  getProgressColor(course: Course): string {
    const progress = this.getProgress(course);
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 70) return 'bg-amber-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
  }

  // ========== TOAST / NOTIFICACIONES ==========
  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    // Implementar según tu sistema de notificaciones
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Ejemplo: this.toastrService.show(message, type);
  }
}
