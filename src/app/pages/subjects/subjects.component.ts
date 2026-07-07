import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../service/subject.service';
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

  modalAssignOpen = false;
  modalHistoryOpen = false;
  selectedSubject: any = null;
  docenteSearch = '';
  docentesFiltered: any[] = [];
  assignedDocentes: any[] = [];
  subjectHistory: any[] = [];

  constructor(private subjectService: SubjectService) {}

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

  openAssignModal(subject: any) {
    this.selectedSubject = subject;
    this.docenteSearch = '';
    this.docentesFiltered = [];
    this.assignedDocentes = subject.docentes || [];
    this.modalAssignOpen = true;
  }

  closeAssignModal() {
    this.modalAssignOpen = false;
    this.selectedSubject = null;
    this.docenteSearch = '';
    this.docentesFiltered = [];
  }

  searchDocentes() {
    const query = this.docenteSearch.trim().toLowerCase();
    if (!query) {
      this.docentesFiltered = [];
      return;
    }

    this.docentesFiltered = [
      { id: 1, name: 'Juan Pérez' },
      { id: 2, name: 'María Gómez' },
      { id: 3, name: 'Carlos Rojas' },
    ].filter((docente) => docente.name.toLowerCase().includes(query));
  }

  assignDocente(docente: any) {
    const alreadyAssigned = this.assignedDocentes.some((item) => item.id === docente.id);
    if (!alreadyAssigned) {
      this.assignedDocentes = [...this.assignedDocentes, docente];
    }
  }

  openHistoryModal(subject: any) {
    this.selectedSubject = subject;
    this.subjectHistory = [
      { id: 1, name: 'Juan Pérez', period: '2025-1' },
      { id: 2, name: 'María Gómez', period: '2024-2' },
    ];
    this.modalHistoryOpen = true;
  }

  closeHistoryModal() {
    this.modalHistoryOpen = false;
    this.selectedSubject = null;
    this.subjectHistory = [];
  }
}
