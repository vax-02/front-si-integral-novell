import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { CareerService } from '../../service/career.service';
import { ToastService } from '../../shared/services/toast.service';
import { CareersResponse } from '../../interfaces/career';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';

@Component({
  selector: 'app-programs',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
    BaseModalConfirmComponent,
  ],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.css',
})
export class ProgramsComponent {
  modalViewProgram: boolean = false;
  modalDetailSubjetcs: boolean = false;

  loadingModalDetails: boolean = false;
  careerSelected: any = null;
  loading = false;
  data: CareersResponse = {
    Careers: [],
    total: 0,
    totalSubjects: 0,
    careersActivas: 0,
  };

  modalCareer = false;
  careerForm: FormGroup;
  subjectForm: FormGroup;
  selectedFile: File | null = null;
  previewSubjects: any[] = [];
  validSubjects = 0;
  errorSubjects = 0;
  importErrors: string[] = [];
  importingFile = false;
  fileName = '';
  confirmDeleteOpen = false;
  careerToDelete: any = null;
  deletingCareer = false;
  subjectModalOpen = false;
  subjectModalMode: 'create' | 'edit' = 'create';
  editingSubject: any = null;
  subjectToDelete: any = null;
  confirmSubjectDeleteOpen = false;
  savingSubject = false;
  deletingSubject = false;
  activeCareerId: number | null = null;

  constructor(
    private careerService: CareerService,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {
    this.careerForm = this.fb.group({
      name: ['', Validators.required],
      duration: ['', Validators.required],
      type: ['', Validators.required],
    });

    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      sigla: ['', Validators.required],
      level: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      subject_id: [''],
    });

    this.subjectForm.get('level')?.valueChanges.subscribe(() => {
      const selectedLevel = Number(this.subjectForm.get('level')?.value);
      if (!Number.isFinite(selectedLevel) || selectedLevel <= 1) {
        this.subjectForm.patchValue({ subject_id: '' }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.loadCareers();
  }

  loadCareers() {
    this.loading = true;
    this.careerService.getCareers().subscribe({
      next: (response) => {
        this.loading = false;
        this.data.Careers = response.careers;
        this.data.total = response.total;
        this.data.totalSubjects = response.totalSubjects;
        this.data.careersActivas = response.careersActivas;
        console.log(response)
      },
      error: (err) => {
        this.loading = false;
        this.toast.error('Error al cargar las carreras');
        console.log('error en la carga de carreras')
        console.log(err)

      },
    });
  }

  openViewProgram(id: number) {
    this.modalViewProgram = true;
    this.loadingModalDetails = true;
    this.careerSelected = null;
    this.activeCareerId = id;

    this.loadCareerDetails(id);
  }

  private loadCareerDetails(id: number) {
    this.careerService.getCareerById(id).subscribe({
      next: (response) => {
        this.loading = false;
        this.loadingModalDetails = false;
        this.careerSelected = response;
        //console.log(this.careerSelected)
      },
      error: () => {
        this.loading = false;
        this.loadingModalDetails = false;
        this.toast.error('Error al cargar los detalles de la carrera');
      },
    });
  }

  closeViewProgram() {
    this.modalViewProgram = false;
    this.loadingModalDetails = false;
    this.careerSelected = null;
  }

  abrirModal() {
    this.modalCareer = true;
  }

  cerrarModal() {
    this.modalCareer = false;
    this.resetForm();
  }

  toggleCareerStatus(career: any) {
    this.deletingCareer = true;
    this.careerService.toggleStatus(career.id).subscribe({
      next: (response) => {
        this.deletingCareer = false;
        career.status = response.status;
        this.toast.success(response.message || 'Estado actualizado correctamente.');
        this.loadCareers();
      },
      error: (error) => {
        this.deletingCareer = false;
        this.toast.error(error?.error?.message || 'No se pudo cambiar el estado de la carrera.');
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];

    if (!file) {
      this.selectedFile = null;
      this.fileName = '';
      return;
    }

    const allowedExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isExcelFile = allowedExtensions.some((extension) => fileName.endsWith(extension)) ||
      ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type);

    if (!isExcelFile) {
      this.selectedFile = null;
      this.fileName = '';
      event.target.value = '';
      this.toast.error('Solo se permiten archivos Excel (.xlsx o .xls).');
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
  }

  saveCareer() {
    if (this.careerForm.invalid) {
      this.careerForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.toast.error('Debe seleccionar un archivo .xlsx para importar el plan de estudios.');
      return;
    }

    this.importPreview();
  }

  private resetForm() {
    this.careerForm.reset({
      name: '',
      duration: '',
      type: '',
    });

    this.selectedFile = null;
    this.previewSubjects = [];
    this.validSubjects = 0;
    this.errorSubjects = 0;
    this.importErrors = [];
    this.importingFile = false;
    this.fileName = '';
    this.modalDetailSubjetcs = false;
  }

  getSubjectName(id: number): string {
    const allSubjects =
      this.careerSelected?.subjects_by_level?.flatMap((g: any) => g.subjects) ||
      [];

    const subject = allSubjects.find((s: any) => s.id === id);

    return subject ? subject.sigla : '—';
  }

  get previewGroups(): any[] {
    const grouped: Record<string, any[]> = {};

    this.previewSubjects.forEach((item: any) => {
      const level = item.level != null ? String(item.level) : 'Sin nivel';
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(item);
    });

    return Object.entries(grouped).map(([level, subjects]) => ({
      level,
      subjects,
    }));
  }

  get availableSubjectsForPrerequisite(): any[] {
    const subjects = this.careerSelected?.subjects_by_level?.flatMap((group: any) => group.subjects) || [];
    const selectedLevel = Number(this.subjectForm.get('level')?.value);

    if (!Number.isFinite(selectedLevel) || selectedLevel <= 1) {
      return [];
    }

    const filtered = subjects.filter((subject: any) => {
      const subjectLevel = Number(subject.level);
      if (!Number.isFinite(subjectLevel)) {
        return false;
      }

      return subjectLevel < selectedLevel;
    });

    if (this.editingSubject?.id) {
      return filtered.filter((subject: any) => subject.id !== this.editingSubject.id);
    }

    return filtered;
  }

  openSubjectModal(mode: 'create' | 'edit' = 'create', subject?: any) {
    this.subjectModalMode = mode;
    this.editingSubject = subject || null;
    this.subjectModalOpen = true;

    if (mode === 'edit' && subject) {
      this.subjectForm.patchValue({
        name: subject.name || '',
        sigla: subject.sigla || '',
        level: subject.level != null ? String(subject.level) : '',
        subject_id: subject.subject_id || '',
      });
      return;
    }

    this.loadCareers();
    this.subjectForm.reset({
      name: '',
      sigla: '',
      level: '',
      subject_id: '',
    });
  }

  closeSubjectModal() {
    this.subjectModalOpen = false;
    this.editingSubject = null;
    this.subjectForm.reset({
      name: '',
      sigla: '',
      level: '',
      subject_id: '',
    });
  }

  saveSubject() {
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.subjectForm.get('name')?.value?.trim(),
      sigla: this.subjectForm.get('sigla')?.value?.trim(),
      level: Number(this.subjectForm.get('level')?.value),
      subject_id: this.subjectForm.get('subject_id')?.value || null,
    };

    this.savingSubject = true;

    const request$ = this.subjectModalMode === 'edit' && this.editingSubject
      ? this.careerService.updateSubject(this.activeCareerId!, this.editingSubject.id, payload)
      : this.careerService.createSubject(this.activeCareerId!, payload);

    request$.subscribe({
      next: () => {
        this.savingSubject = false;
        this.closeSubjectModal();
        this.toast.success('Materia guardada correctamente.');
        if (this.activeCareerId) {
          this.loadCareerDetails(this.activeCareerId);
        }
      },
      error: (error) => {
        this.savingSubject = false;
        this.toast.error(error?.error?.message || 'No se pudo guardar la materia.');
      },
    });
  }

  openDeleteSubjectConfirm(subject: any) {
    this.subjectToDelete = subject;
    this.confirmSubjectDeleteOpen = true;
  }

  closeDeleteSubjectConfirm() {
    this.confirmSubjectDeleteOpen = false;
    this.subjectToDelete = null;
  }

  deleteSubject() {
    if (!this.subjectToDelete || !this.activeCareerId) {
      return;
    }

    this.deletingSubject = true;
    this.careerService.deleteSubject(this.activeCareerId, this.subjectToDelete.id).subscribe({
      next: () => {
        this.loadCareerDetails(this.activeCareerId!);
        this.closeDeleteSubjectConfirm();
        this.deletingSubject = false;
        this.toast.success('Materia eliminada correctamente.');
        this.loadCareers()
      },
      error: (error) => {
        this.deletingSubject = false;
        this.toast.error(error?.error?.message || 'No se pudo eliminar la materia.');
      },
    });
  }

  dowloadTemplate() {
    this.careerService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_carreras.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toast.error('Error al descargar la plantilla');
      },
    });
  }

  private importPreview() {
    if (!this.selectedFile) {
      return;
    }

    this.importingFile = true;
    const formData = this.buildFormData();

    this.careerService.importPreview(formData).subscribe({
      next: (response) => {
        this.importingFile = false;
        this.previewSubjects = response.preview?.rows || [];
        this.validSubjects = response.valid_subjects || 0;
        this.errorSubjects = response.invalid_subjects || 0;
        this.importErrors = response.errors || [];
        this.modalDetailSubjetcs = true;
      },
      error: (error) => {
        this.importingFile = false;
        this.toast.error(error?.error?.message || 'No se pudo validar el archivo.');
        console.log('Error al validar el archivo:', error);
      },
    });
  }

  saveStudyPlan() {
    if (!this.selectedFile) {
      this.toast.error('No hay un archivo seleccionado.');
      return;
    }

    this.importingFile = true;
    const formData = this.buildFormData();

    this.careerService.importConfirm(formData).subscribe({
      next: () => {
        this.importingFile = false;
        this.toast.success('Plan de estudios guardado exitosamente.');
        this.modalDetailSubjetcs = false;
        this.modalCareer = false;
        this.resetForm();
        this.loadCareers();
      },
      error: (error) => {
        this.importingFile = false;
        this.previewSubjects = error?.error?.preview?.rows || [];
        this.validSubjects = error?.error?.preview?.rows?.filter((row: any) => row.valid).length || 0;
        this.errorSubjects = error?.error?.preview?.rows?.filter((row: any) => !row.valid).length || 0;
        this.importErrors = error?.error?.preview?.errors || [];
        this.toast.error(error?.error?.message || 'No se pudo guardar el plan de estudios.');

        console.log('---------------')
        console.log(error)
      },
    });
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    formData.append('name', this.careerForm.get('name')?.value || '');
    formData.append('duration', this.careerForm.get('duration')?.value || '');
    formData.append('type', this.careerForm.get('type')?.value || '');
    formData.append('file', this.selectedFile as File);
    return formData;
  }
  
  toNumeral(val: number) : string{
    switch(val){
      case 1: return 'Primer'
      case 2: return 'Segundo'
      case 3: return 'Tercer'
      case 4: return 'Cuarto'
      case 5: return 'Quinto'
      case 6: return 'Sexto'
      default : return ''
    }
  }
}
