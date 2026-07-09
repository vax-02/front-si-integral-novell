import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';
import { DegreeService } from '../../service/degree.service';
import { DocenteService } from '../../service/docente.service';
import { SubjectService } from '../../service/subject.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-docentes',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
  ],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.css',
})
export class DocentesComponent implements OnInit {
  // ── Paginación / búsqueda ─────────────────────────────────────────────────
  private searchTimeout: any;
  search = '';
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  totalDocentes = 0;

  // ── Datos ──────────────────────────────────────────────────────────────────
  docentes: any[] = [];
  degrees: any[] = [];
  allSubjects: any[] = [];          // todas las materias para asignar
  activeCount = 0;
  inactiveCount = 0;

  // ── Estado UI ─────────────────────────────────────────────────────────────
  loading = false;
  loadingModal = false;
  loadingSubjects = false;
  loadingToggle = false;

  // Modales
  modalAddDocente = false;
  modalViewDocente = false;
  confirmToggleOpen = false;

  // Datos seleccionados
  docenteSeleccionado: any = null;
  editingDocenteId: number | null = null;

  
  // ── Formulario crear/editar ────────────────────────────────────────────────
  nombre = '';
  apellidoPaterno = '';
  apellidoMaterno = '';
  ci = '';
  correo = '';
  celular = '';
  degreeId: number | null = null;
  documentos = { hojaVida: false, tituloProfesional: false, ciCopia: false, certificados: false };
  errores: Record<string, string> = {};

  constructor(
    private degreeService: DegreeService,
    private docenteService: DocenteService,
    private subjectService: SubjectService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadDegrees();
    this.loadDocentes();
    this.loadAllSubjects();
  }

  // ── Carga inicial ─────────────────────────────────────────────────────────
  loadDegrees(): void {
    this.degreeService.getDegrees().subscribe({
      next: (data) => { this.degrees = data.degrees ?? data; },
      error: () => { this.toast.error('Error al cargar grados académicos'); },
    });
  }

  loadAllSubjects(): void {
    this.subjectService.getSubjects(1, 200).subscribe({
      next: (data) => { this.allSubjects = data.subjects?.data ?? data.subjects ?? []; },
      error: () => { this.toast.error('Error al cargar materias'); },
    });
  }

  loadDocentes(): void {
    this.loading = true;
    this.docenteService.getDocentes(this.currentPage, this.perPage, this.search).subscribe({
      next: (data) => {
        this.loading = false;
        this.totalDocentes = data.total ?? 0;
        this.activeCount   = data.activos   ?? 0;
        this.inactiveCount = data.inactivos ?? 0;
        this.currentPage   = data.docentes.current_page;
        this.lastPage      = data.docentes.last_page;
        this.docentes      = data.docentes.data;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar docentes');
      },
    });
  }

  // ── Búsqueda + paginación ─────────────────────────────────────────────────
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.currentPage = 1; this.loadDocentes(); }, 400);
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) { this.currentPage++; this.loadDocentes(); }
  }

  previousPage(): void {
    if (this.currentPage > 1) { this.currentPage--; this.loadDocentes(); }
  }

  get from(): number { return (this.currentPage - 1) * this.perPage + 1; }
  get to(): number   { return Math.min(this.currentPage * this.perPage, this.totalDocentes); }

  // ── Modal Crear ───────────────────────────────────────────────────────────
  openAddDocente(): void {
    this.editingDocenteId = null;
    this.resetForm();
    this.modalAddDocente = true;
  }

  // ── Modal Editar ──────────────────────────────────────────────────────────
  openEditDocente(docente: any): void {
    this.editingDocenteId = docente.id;
    this.nombre          = docente.user?.name          ?? '';
    this.apellidoPaterno = docente.user?.first_lastname ?? '';
    this.apellidoMaterno = docente.user?.second_lastname ?? '';
    this.ci              = docente.user?.ci             ?? '';
    this.correo          = docente.user?.email          ?? '';
    this.celular         = docente.user?.cellphone       ?? '';
    this.degreeId        = docente.degree_id ?? docente.degree?.id ?? null;
    this.documentos = {
      hojaVida:        !!docente.cv,
      tituloProfesional: !!docente.professional_title,
      ciCopia:         !!docente.carnet,
      certificados:    !!docente.certificate,
    };
    this.errores = {};
    this.modalAddDocente = true;
  }

  get modalTitle(): string { return this.editingDocenteId ? 'Editar Docente' : 'Agregar Docente'; }
  get confirmSaveText(): string { return this.editingDocenteId ? 'Actualizar' : 'Guardar'; }

  // ── Modal Ver ─────────────────────────────────────────────────────────────
  openViewDocente(docente: any): void {
    this.docenteSeleccionado = docente;
    this.modalViewDocente = true;
  }


  // Materias que aún NO tiene el docente seleccionado
  get availableSubjects(): any[] {
    if (!this.docenteSeleccionado) return this.allSubjects;
    const assigned = (this.docenteSeleccionado.subjects ?? []).map((s: any) => s.id);
    return this.allSubjects.filter(s => !assigned.includes(s.id));
  }

  // ── Toggle status (bloquear/activar) ──────────────────────────────────────
  toggleStatus(docente: any): void {
    this.loadingToggle = true;
    this.docenteService.toggleStatus(docente.id).subscribe({
      next: (res) => {
        this.loadingToggle = false;
        docente.status = res.status;
        // también actualizamos el user si está cargado en el objeto
        if (docente.user) docente.user.status = res.status;
        this.toast.success(res.message);
      },
      error: () => {
        this.loadingToggle = false;
        this.toast.error('Error al cambiar el estado del docente');
      },
    });
  }

  // ── Guardar (crear o editar) ──────────────────────────────────────────────
  saveDocente(): void {
    if (!this.validarCampos()) return;

    this.loadingModal = true;
    const payload: any = {
      name:               this.nombre.trim(),
      first_lastname:     this.apellidoPaterno.trim(),
      second_lastname:    this.apellidoMaterno.trim(),
      ci:                 this.ci.trim(),
      email:              this.correo.trim(),
      cellphone:          this.celular.trim(),
      degree_id:          this.degreeId,
      cv:                 this.documentos.hojaVida,
      professional_title: this.documentos.tituloProfesional,
      carnet:             this.documentos.ciCopia,
      certificate:        this.documentos.certificados,
    };

    const isEdit = !!this.editingDocenteId;
    const req$ = isEdit
      ? this.docenteService.updateDocente(this.editingDocenteId!, payload)
      : this.docenteService.createDocente(payload);

    req$.subscribe({
      next: () => {
        this.loadingModal = false;
        this.modalAddDocente = false;
        this.resetForm();
        this.loadDocentes();
        this.toast.success(isEdit ? 'Docente actualizado exitosamente' : 'Docente creado exitosamente');
      },
      error: (err) => {
        this.loadingModal = false;
        const errors = err?.error?.errors;
        if (errors?.ci)    this.toast.error('Ese C.I. ya está registrado');
        if (errors?.email) this.toast.error('Ese correo ya está registrado');
        this.toast.error(isEdit ? 'Error al actualizar el docente' : 'Error al crear el docente');
      },
    });
  }

  cancelModal(): void {
    this.modalAddDocente = false;
    this.editingDocenteId = null;
    this.resetForm();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private resetForm(): void {
    this.nombre = '';
    this.apellidoPaterno = '';
    this.apellidoMaterno = '';
    this.ci = '';
    this.correo = '';
    this.celular = '';
    this.degreeId = null;
    this.documentos = { hojaVida: false, tituloProfesional: false, ciCopia: false, certificados: false };
    this.errores = {};
  }

  private syncDocenteInList(): void {
    const idx = this.docentes.findIndex(d => d.id === this.docenteSeleccionado?.id);
    if (idx !== -1) this.docentes[idx] = { ...this.docentes[idx], subjects: this.docenteSeleccionado.subjects };
  }

  validarCampos(): boolean {
    this.errores = {};
    let ok = true;

    if (!this.nombre.trim())          { this.errores['nombre'] = 'El nombre es requerido'; ok = false; }
    if (!this.apellidoPaterno.trim())  { this.errores['apellidoPaterno'] = 'El apellido paterno es requerido'; ok = false; }
    if (!this.ci.trim())              { this.errores['ci'] = 'El C.I. es requerido'; ok = false; }
    else if (!/^\d{5,12}$/.test(this.ci)) { this.errores['ci'] = 'El C.I. debe tener entre 5 y 12 dígitos'; ok = false; }
    if (!this.correo.trim())          { this.errores['correo'] = 'El correo es requerido'; ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo)) { this.errores['correo'] = 'El correo no es válido'; ok = false; }
    if (this.celular && !/^\d{7,8}$/.test(this.celular)) { this.errores['celular'] = 'El celular debe tener 7 u 8 dígitos'; ok = false; }
    if (!this.degreeId) { this.errores['gradoAcademico'] = 'El grado académico es requerido'; ok = false; }

    return ok;
  }
}
