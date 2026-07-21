import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../service/subject.service';
import { DocenteService } from '../../service/docente.service';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.css',
})
export class SubjectsComponent {
  subjects: any[] = [];
  loading = false;
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  totalSubjects = 0;
  pageFrom = 0;
  pageTo = 0;

  filters = {
    name: '',
    sigla: '',
    career: '',
  };

  // Modal Detalle
  modalDetailOpen = false;
  detailLoading = false;
  selectedSubject: any = null;
  subjectParallels: any[] = [];
  subjectDocentes: any[] = [];

  // Modal Asignar docente (dentro del detalle)
  docenteSearch = '';
  docentesFiltered: any[] = [];
  selectedParallelIdForAssign: number | null = null;
  assigningDocente = false;

  // Modal Histórico
  modalHistoryOpen = false;
  historyLoading = false;
  subjectHistory: any[] = [];

  constructor(
    private subjectService: SubjectService,
    private docenteService: DocenteService,
  ) {}

  ngOnInit() {
    this.loadSubjects();
  }

  loadSubjects() {
    this.loading = true;

    this.subjectService.getSubjects(this.currentPage, this.perPage, this.filters).subscribe({
      next: (response) => {
        this.loading = false;
        this.subjects = response.subjects?.data || [];
        this.currentPage = response.subjects?.current_page || 1;
        this.lastPage = response.subjects?.last_page || 1;
        this.totalSubjects = response.subjects?.total || 0;
        this.pageFrom = response.subjects?.from || 0;
        this.pageTo = response.subjects?.to || 0;
      },
      error: () => {
        this.loading = false;
        this.subjects = [];
      },
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadSubjects();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSubjects();
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadSubjects();
    }
  }

  get from(): number {
    return this.pageFrom || (this.subjects.length === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1);
  }

  get to(): number {
    return this.pageTo || Math.min(this.currentPage * this.perPage, this.totalSubjects);
  }

  // ──────────────────────────────────────────────
  //  DETALLE
  // ──────────────────────────────────────────────
  openDetailModal(subject: any) {
    this.selectedSubject = subject;
    this.subjectParallels = [];
    this.subjectDocentes = [];
    this.detailLoading = true;
    this.modalDetailOpen = true;

    this.subjectService.getDetail(subject.id).subscribe({
      next: (resp) => {
        this.detailLoading = false;
        this.subjectParallels = resp.parallels || [];
        this.subjectDocentes = resp.docentes || [];
      },
      error: () => {
        this.detailLoading = false;
        this.subjectParallels = [];
        this.subjectDocentes = [];
      },
    });
  }

  closeDetailModal() {
    this.modalDetailOpen = false;
    this.selectedSubject = null;
    this.subjectParallels = [];
    this.subjectDocentes = [];
    this.docenteSearch = '';
    this.docentesFiltered = [];
    this.selectedParallelIdForAssign = null;
  }

  // Búsqueda de docentes para asignar
  searchDocentes() {
    const query = this.docenteSearch.trim();
    if (!query) {
      this.docentesFiltered = [];
      return;
    }
    this.docenteService.getDocentes(1, 20, query).subscribe({
      next: (resp) => {
        this.docentesFiltered = resp.docentes?.data || [];
      },
      error: () => {
        this.docentesFiltered = [];
      },
    });
  }

  /** Asignar docente seleccionado a la materia + paralelo */
  assignDocente(docente: any) {
    if (!this.selectedSubject || !this.selectedParallelIdForAssign) return;

    this.assigningDocente = true;
    this.subjectService.assignDocente(
      this.selectedSubject.id,
      docente.id,
      this.selectedParallelIdForAssign,
    ).subscribe({
      next: (resp) => {
        this.assigningDocente = false;
        // Recargar el detalle
        this.loadDetailAfterAction();
        this.docenteSearch = '';
        this.docentesFiltered = [];
        this.selectedParallelIdForAssign = null;
      },
      error: () => {
        this.assigningDocente = false;
      },
    });
  }

  /** Desasignar docente (baja lógica) */
  removeDocente(docenteId: number, parallelId: number) {
    if (!this.selectedSubject) return;

    this.subjectService.removeDocente(this.selectedSubject.id, docenteId, parallelId).subscribe({
      next: () => {
        this.loadDetailAfterAction();
      },
    });
  }

  private loadDetailAfterAction() {
    if (!this.selectedSubject) return;
    this.subjectService.getDetail(this.selectedSubject.id).subscribe({
      next: (resp) => {
        this.subjectParallels = resp.parallels || [];
        this.subjectDocentes = resp.docentes || [];
      },
    });
  }

  // ──────────────────────────────────────────────
  //  HISTÓRICO
  // ──────────────────────────────────────────────
  openHistoryModal(subject: any) {
    this.selectedSubject = subject;
    this.subjectHistory = [];
    this.historyLoading = true;
    this.modalHistoryOpen = true;

    this.subjectService.getHistory(subject.id).subscribe({
      next: (resp) => {
        this.historyLoading = false;
        this.subjectHistory = resp.history || [];
      },
      error: () => {
        this.historyLoading = false;
        this.subjectHistory = [];
      },
    });
  }

  closeHistoryModal() {
    this.modalHistoryOpen = false;
    this.selectedSubject = null;
    this.subjectHistory = [];
  }
}