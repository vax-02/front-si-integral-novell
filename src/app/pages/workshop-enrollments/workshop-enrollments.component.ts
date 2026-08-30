import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkshopService } from '../../service/workshop.service';
import { StudentService } from '../../service/student.service';
import { ToastService } from '../../shared/services/toast.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';

@Component({
  selector: 'app-workshop-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, BaseModalComponent, BaseInputComponent, BaseModalConfirmComponent],
  templateUrl: './workshop-enrollments.component.html',
  styleUrl: './workshop-enrollments.component.css',
})
export class WorkshopEnrollmentsComponent implements OnInit {
  loading = false;
  enrollments: any[] = [];
  total = 0;
  search = '';

  workshops: any[] = [];
  editions: any[] = [];
  filteredEditions: any[] = [];
  students: any[] = [];
  filteredStudents: any[] = [];
  studentSearch = '';
  studentDropdownOpen = false;

  enrollmentForm: FormGroup;
  enrollModalOpen = false;
  saving = false;

  enrollmentToDelete: any = null;
  confirmDeleteOpen = false;

  enrollmentToView: any = null;
  viewModalOpen = false;

  enrollmentToAnular: any = null;
  confirmAnularOpen = false;

  page = 1;
  lastPage = 1;

  constructor(
    private workshopService: WorkshopService,
    private studentService: StudentService,
    private toast: ToastService,
    private fb: FormBuilder,
    private elRef: ElementRef,
  ) {
    this.enrollmentForm = this.fb.group({
      student_type: ['existing', Validators.required],
      student_id: [''],
      external_name: [''],
      external_surname: [''],
      external_ci: [''],
      external_email: [''],
      external_phone: [''],
      workshop_id: ['', Validators.required],
      workshop_edition_id: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadEnrollments();
    this.loadWorkshops();
    this.loadStudents();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.student-search-container')) {
      this.studentDropdownOpen = false;
    }
  }

  loadEnrollments(page = 1) {
    this.loading = true;
    const params: any = { page };
    if (this.search) params.search = this.search;

    this.workshopService.getEnrollments(params).subscribe({
      next: (res) => {
        this.loading = false;
        this.enrollments = res.data;
        this.total = res.total;
        this.page = res.current_page;
        this.lastPage = res.last_page;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar inscripciones');
      },
    });
  }

  loadWorkshops() {
    this.workshopService.getWorkshopsSimple().subscribe({
      next: (res) => this.workshops = res.workshops,
    });
  }

  loadStudents() {
    this.studentService.getStudents(1, 1000).subscribe({
      next: (res) => {
        const paginated = res.students;
        this.students = Array.isArray(paginated) ? paginated : (paginated?.data || []);
        this.filteredStudents = this.students.slice(0, 20);
      },
      error: () => {
        this.students = [];
        this.filteredStudents = [];
      },
    });
  }

  onWorkshopChange() {
    const workshopId = this.enrollmentForm.get('workshop_id')?.value;
    this.enrollmentForm.patchValue({ workshop_edition_id: '' });
    if (workshopId) {
      this.workshopService.getEditions(workshopId).subscribe({
        next: (res) => {
          this.filteredEditions = (res.editions || []).filter((e: any) => e.status);
        },
      });
    } else {
      this.filteredEditions = [];
    }
  }

  onSearch() {
    this.loadEnrollments(1);
  }

  openEnrollModal() {
    this.enrollmentForm.reset({
      student_type: 'existing',
      student_id: '',
      external_name: '',
      external_surname: '',
      external_ci: '',
      external_email: '',
      external_phone: '',
      workshop_id: '',
      workshop_edition_id: '',
    });
    this.filteredEditions = [];
    this.studentSearch = '';
    this.filteredStudents = this.students.slice(0, 20);
    this.studentDropdownOpen = false;
    this.enrollModalOpen = true;
  }

  closeEnrollModal() {
    this.enrollModalOpen = false;
  }

  saveEnrollment() {
    if (this.saving) return;
    if (this.enrollmentForm.invalid) {
      this.enrollmentForm.markAllAsTouched();
      return;
    }

    const type = this.enrollmentForm.get('student_type')?.value;
    if (type === 'existing' && !this.enrollmentForm.get('student_id')?.value) {
      this.toast.error('Selecciona un estudiante.');
      return;
    }
    if (type === 'external') {
      if (!this.enrollmentForm.get('external_name')?.value) {
        this.toast.error('Ingresa el nombre del participante externo.');
        return;
      }
      if (!this.enrollmentForm.get('external_surname')?.value) {
        this.toast.error('Ingresa el apellido del participante externo.');
        return;
      }
      if (!this.enrollmentForm.get('external_ci')?.value) {
        this.toast.error('Ingresa el CI del participante externo.');
        return;
      }
    }

    this.saving = true;
    this.workshopService.createEnrollment(this.enrollmentForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.closeEnrollModal();
        this.toast.success('Inscripción realizada correctamente.');
        this.loadEnrollments();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err?.error?.message || 'No se pudo realizar la inscripción.');
      },
    });
  }

  openViewModal(enrollment: any) {
    this.enrollmentToView = enrollment;
    this.viewModalOpen = true;
  }

  closeViewModal() {
    this.viewModalOpen = false;
    this.enrollmentToView = null;
  }

  confirmAnular(enrollment: any) {
    this.enrollmentToAnular = enrollment;
    this.confirmAnularOpen = true;
  }

  closeAnularConfirm() {
    this.confirmAnularOpen = false;
    this.enrollmentToAnular = null;
  }

  anularEnrollment() {
    if (!this.enrollmentToAnular) return;
    this.workshopService.updateEnrollment(this.enrollmentToAnular.id, { status: 'Retirado' }).subscribe({
      next: () => {
        this.enrollmentToAnular.status = 'Retirado';
        this.toast.success('Inscripción anulada correctamente.');
        this.closeAnularConfirm();
      },
      error: () => this.toast.error('No se pudo anular la inscripción.'),
    });
  }

  getStudentName(enrollment: any): string {
    if (enrollment.student?.user) {
      return `${enrollment.student.user.name || ''} ${enrollment.student.user.first_lastname || ''} ${enrollment.student.user.second_lastname || ''}`.trim();
    }
    return '—';
  }

  getEditionName(enrollment: any): string {
    return enrollment.edition?.name || '—';
  }

  getWorkshopName(enrollment: any): string {
    return enrollment.edition?.workshop?.name || '—';
  }

  onStudentSearch() {
    const term = this.studentSearch.toLowerCase().trim();
    if (!term) {
      this.filteredStudents = this.students.slice(0, 20);
      return;
    }
    this.filteredStudents = this.students.filter(s => {
      const name = `${s.user?.name || ''} ${s.user?.first_lastname || ''} ${s.user?.second_lastname || ''}`.toLowerCase();
      const ci = (s.user?.ci || '').toLowerCase();
      return name.includes(term) || ci.includes(term);
    }).slice(0, 20);
  }

  selectStudent(student: any) {
    this.enrollmentForm.patchValue({ student_id: student.id });
    this.studentSearch = `${student.user?.name || ''} ${student.user?.first_lastname || ''} ${student.user?.second_lastname || ''}`.trim();
    this.studentDropdownOpen = false;
  }

  getSelectedStudentName(): string {
    const id = this.enrollmentForm.get('student_id')?.value;
    if (!id) return '';
    const s = this.students.find(st => st.id == id);
    if (!s) return '';
    return `${s.user?.name || ''} ${s.user?.first_lastname || ''} ${s.user?.second_lastname || ''}`.trim();
  }

  clearStudentSelection() {
    this.enrollmentForm.patchValue({ student_id: '' });
    this.studentSearch = '';
    this.filteredStudents = this.students.slice(0, 20);
  }
}
