import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { DocenteService } from '../../service/docente.service';
import { API_ENDPOINTS } from '../../config/api-endpoints';
import { ToastService } from '../../shared/services/toast.service';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';

interface GradeState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalConfirmComponent],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.css',
})
export class GradesComponent implements OnInit, OnDestroy {
  subjects: any[] = [];
  loadingSubjects = false;

  modalConfirm: boolean = false;
  columnIdSelect: number = 0;
  resetLoading: boolean = false;

  selectedSubject: any = null;

  students: any[] = [];
  columns: any[] = [];
  parallel: any = null;
  loadingGrades = false;
  error = '';

  cellStates: Record<string, GradeState> = {};

  newColumnName = '';
  newColumnWeight = 0;
  newColumnType: 'teorica' | 'practica' = 'teorica';
  newColumnParcial = 1;
  savingColumn = false;

  editingColumn: any = null;
  editColumnName = '';
  editColumnWeight = 0;
  editColumnType: 'teorica' | 'practica' = 'teorica';
  editColumnParcial = 1;
  savingEditColumn = false;

  searchStudent = '';
  isPublished = false;
  publishing = false;

  subjectConfig: any = null;
  editingConfig = false;
  configTheoryWeight = 0;
  configPracticeWeight = 0;
  configNumParciales = 2;
  savingConfig = false;

  constructor(
    private docenteService: DocenteService,
    private http: HttpClient,
    private auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSubjects();

    this.route.queryParams.subscribe((params) => {
      if (params['subject_id']) {
        const subjectId = Number(params['subject_id']);
        if (this.subjects.length > 0) {
          this.selectSubjectById(subjectId);
        } else {
          const sub = this.docenteService.getMySubjects().subscribe({
            next: (resp) => {
              this.subjects = resp.subjects || [];
              this.selectSubjectById(subjectId);
              sub.unsubscribe();
            },
          });
        }
      }
    });
  }

  ngOnDestroy(): void {}

  get filteredStudents() {
    if (!this.searchStudent.trim()) return this.students;
    const term = this.searchStudent.toLowerCase();
    return this.students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.ci.toLowerCase().includes(term)
    );
  }

  getColumnsByParcial(parcial: number): any[] {
    return this.columns.filter((c: any) => c.parcial === parcial);
  }

  getColumnsByParcialAndType(parcial: number, type: 'teorica' | 'practica'): any[] {
    return this.columns.filter((c: any) => c.parcial === parcial && c.type === type);
  }

  countColumnsByType(parcial: number, type: 'teorica' | 'practica'): number {
    return this.columns.filter((c: any) => c.parcial === parcial && c.type === type).length;
  }

  getParcialOptions(): number[] {
    const max = this.subjectConfig?.num_parciales || this.configNumParciales || 2;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  getParciales(): number[] {
    const parciales = [...new Set(this.columns.map((c: any) => c.parcial || 1))];
    return parciales.sort((a, b) => a - b);
  }

  getParcialTheoreticalAvg(student: any, parcial: number): string {
    const cols = this.getColumnsByParcial(parcial).filter((c: any) => c.type === 'teorica');
    if (cols.length === 0) return '—';

    let sum = 0;
    let weightSum = 0;
    for (const col of cols) {
      const grade = student.grades[col.id]?.grade;
      const w = parseFloat(col.weight) || 0;
      if (grade !== null && grade !== undefined && grade !== '') {
        sum += Number(grade) * w;
        weightSum += w;
      }
    }
    if (weightSum === 0) return '—';
    return (sum / weightSum).toFixed(1);
  }

  getParcialPracticalAvg(student: any, parcial: number): string {
    const cols = this.getColumnsByParcial(parcial).filter((c: any) => c.type === 'practica');
    if (cols.length === 0) return '—';

    let sum = 0;
    let weightSum = 0;
    for (const col of cols) {
      const grade = student.grades[col.id]?.grade;
      const w = parseFloat(col.weight) || 0;
      if (grade !== null && grade !== undefined && grade !== '') {
        sum += Number(grade) * w;
        weightSum += w;
      }
    }
    if (weightSum === 0) return '—';
    return (sum / weightSum).toFixed(1);
  }

  getParcialFinal(student: any, parcial: number): string {
    const theoAvg = this.getParcialTheoreticalAvg(student, parcial);
    const praAvg = this.getParcialPracticalAvg(student, parcial);

    if (theoAvg === '—' && praAvg === '—') return '—';
    if (theoAvg === '—') return praAvg;
    if (praAvg === '—') return theoAvg;

    const theoryWeight = this.subjectConfig?.theory_weight || 0.30;
    const practiceWeight = this.subjectConfig?.practice_weight || 0.70;
    const final = (parseFloat(theoAvg) * theoryWeight) + (parseFloat(praAvg) * practiceWeight);
    return final.toFixed(1);
  }

  loadSubjects() {
    this.loadingSubjects = true;
    this.docenteService.getMySubjects().subscribe({
      next: (resp) => {
        this.loadingSubjects = false;
        this.subjects = resp.subjects || [];
        const subjectId = this.route.snapshot.queryParams['subject_id'];
        if (subjectId && this.subjects.length > 0) {
          this.selectSubjectById(Number(subjectId));
        }
      },
      error: () => {
        this.loadingSubjects = false;
        this.subjects = [];
      },
    });
  }

  selectSubjectById(subjectId: number) {
    const subj = this.subjects.find((s) => s.id === subjectId);
    if (subj) {
      this.selectedSubject = subj;
      this.loadGrades();
    }
  }

  onSubjectChange() {
    if (this.selectedSubject) {
      this.loadGrades();
    } else {
      this.students = [];
      this.columns = [];
      this.parallel = null;
      this.subjectConfig = null;
    }
  }

  loadGrades() {
    if (!this.selectedSubject) return;

    this.loadingGrades = true;
    this.error = '';
    this.cellStates = {};
    this.searchStudent = '';

    const url = API_ENDPOINTS.grades.students(this.selectedSubject.parallel_id);
    this.http
      .get<any>(url, {
        headers: this.getHeaders(),
        params: { subject_id: this.selectedSubject.id },
      })
      .subscribe({
        next: (resp) => {
          this.loadingGrades = false;
          this.students = resp.students || [];
          this.columns = (resp.columns || []).sort((a: any, b: any) => {
            if (a.parcial !== b.parcial) return a.parcial - b.parcial;
            return a.order - b.order;
          });
          this.parallel = resp.parallel || null;
          this.isPublished = resp.published || false;
          this.subjectConfig = resp.subject || null;

          if (this.subjectConfig) {
            this.configTheoryWeight = this.subjectConfig.theory_weight * 100;
            this.configPracticeWeight = this.subjectConfig.practice_weight * 100;
            this.configNumParciales = this.subjectConfig.num_parciales;
          }
        },
        error: (err) => {
          this.loadingGrades = false;
          this.error = 'Error al cargar las calificaciones.';
          this.students = [];
          this.columns = [];
          this.parallel = null;
          this.subjectConfig = null;
        },
      });
  }

  getGrade(student: any, columnId: number): string {
    const grade = student.grades[columnId];
    return grade?.grade !== null && grade?.grade !== undefined ? String(grade.grade) : '';
  }

  onGradeBlur(student: any, columnId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
      input.value = this.getGrade(student, columnId);
      return;
    }

    const key = `${student.id}_${columnId}`;
    this.cellStates[key] = { status: 'saving', message: 'Guardando...' };

    const courseId = this.selectedSubject?.course_id || this.parallel?.course?.id;
    const parallelId = this.selectedSubject?.parallel_id || this.parallel?.id;

    const body = {
      student_id: student.id,
      subject_id: this.selectedSubject.id,
      course_id: courseId,
      parallel_id: parallelId,
      evaluation_column_id: columnId,
      grade: value !== '' ? Number(value) : null,
    };

    this.http.post<any>(API_ENDPOINTS.grades.save, body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.cellStates[key] = { status: 'saved', message: '✓' };

        if (resp.final_grade !== undefined) {
          student.final_grade = resp.final_grade;
        }
        if (resp.theoretical_average !== undefined) {
          student.theoretical_average = resp.theoretical_average;
        }
        if (resp.practical_average !== undefined) {
          student.practical_average = resp.practical_average;
        }

        if (!student.grades) {
          student.grades = {};
        }
        student.grades[columnId] = {
          id: resp.qualification_id,
          grade: body.grade,
        };

        setTimeout(() => {
          if (this.cellStates[key]?.status === 'saved') {
            this.cellStates[key] = { status: 'idle' };
          }
        }, 2000);
      },
      error: () => {
        this.cellStates[key] = { status: 'error', message: '✗ Error' };
        setTimeout(() => {
          if (this.cellStates[key]?.status === 'error') {
            this.cellStates[key] = { status: 'idle' };
          }
        }, 3000);
      },
    });
  }

  onRecoveryBlur(student: any, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
      input.value = student.recovery_grade !== null && student.recovery_grade !== undefined
        ? String(student.recovery_grade) : '';
      return;
    }

    const courseId = this.selectedSubject?.course_id || this.parallel?.course?.id;
    const parallelId = this.selectedSubject?.parallel_id || this.parallel?.id;

    const body = {
      student_id: student.id,
      subject_id: this.selectedSubject.id,
      course_id: courseId,
      parallel_id: parallelId,
      recovery_grade: value !== '' ? Number(value) : null,
    };

    this.http.post<any>(API_ENDPOINTS.grades.saveRecovery, body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        student.recovery_grade = resp.recovery_grade;
        this.toast.success('Nota de recuperación guardada.');
      },
      error: () => {
        this.toast.error('Error al guardar nota de recuperación.');
      },
    });
  }

  getCellState(studentId: number, columnId: number): GradeState {
    const key = `${studentId}_${columnId}`;
    return this.cellStates[key] || { status: 'idle' };
  }

  addColumn() {
    if (!this.selectedSubject || !this.newColumnName.trim() || this.newColumnWeight <= 0) return;

    this.savingColumn = true;
    const courseId = this.selectedSubject.course_id || this.parallel?.course?.id;

    const body = {
      subject_id: this.selectedSubject.id,
      parallel_id: this.selectedSubject.parallel_id,
      course_id: courseId,
      name: this.newColumnName.trim(),
      type: this.newColumnType,
      parcial: this.newColumnParcial,
      weight: this.newColumnWeight / 100,
      order: this.columns.length,
    };

    this.http.post<any>(API_ENDPOINTS.grades.columns.store, body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.savingColumn = false;
        this.columns.push(resp.column);
        this.columns.sort((a: any, b: any) => {
          if (a.parcial !== b.parcial) return a.parcial - b.parcial;
          return a.order - b.order;
        });
        this.newColumnName = '';
        this.newColumnWeight = 0;
        this.newColumnType = 'teorica';
        this.newColumnParcial = 1;
      },
      error: (err) => {
        this.savingColumn = false;
      },
    });
  }

  startEditColumn(column: any) {
    this.editingColumn = column;
    this.editColumnName = column.name;
    this.editColumnWeight = column.weight * 100;
    this.editColumnType = column.type || 'teorica';
    this.editColumnParcial = column.parcial || 1;
  }

  cancelEditColumn() {
    this.editingColumn = null;
    this.editColumnName = '';
    this.editColumnWeight = 0;
    this.editColumnType = 'teorica';
    this.editColumnParcial = 1;
  }

  saveEditColumn() {
    if (!this.editingColumn || !this.editColumnName.trim() || this.editColumnWeight <= 0) return;

    this.savingEditColumn = true;

    const body = {
      name: this.editColumnName.trim(),
      weight: this.editColumnWeight / 100,
      type: this.editColumnType,
      parcial: this.editColumnParcial,
    };

    this.http.put<any>(API_ENDPOINTS.grades.columns.update(this.editingColumn.id), body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.savingEditColumn = false;
        const col = this.columns.find((c) => c.id === this.editingColumn.id);
        if (col) {
          col.name = resp.column?.name || this.editColumnName.trim();
          col.weight = resp.column?.weight || this.editColumnWeight / 100;
          col.type = resp.column?.type || this.editColumnType;
          col.parcial = resp.column?.parcial || this.editColumnParcial;
        }
        this.cancelEditColumn();
        this.toast.success('Columna editada correctamente');
      },
      error: (err) => {
        this.savingEditColumn = false;
        this.toast.error('Error al editar la columna');
      },
    });
  }

  deleteColumn(columnId: number) {
    this.modalConfirm = true;
    this.columnIdSelect = columnId;
  }

  confirmDeleteColumn() {
    this.resetLoading = true;
    this.http.delete<any>(API_ENDPOINTS.grades.columns.delete(this.columnIdSelect), { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.columns = this.columns.filter((c) => c.id !== this.columnIdSelect);
        if (this.editingColumn?.id === this.columnIdSelect) {
          this.cancelEditColumn();
        }
        this.toast.success('Columna eliminada correctamente');
        this.resetLoading = false;
        this.modalConfirm = false;
      },
      error: (err) => {
        this.toast.error('Error al eliminar columna');
        this.resetLoading = false;
      },
    });
  }

  moveColumnUp(columnId: number) {
    const col = this.columns.find((c) => c.id === columnId);
    if (!col) return;
    const sameGroup = this.columns
      .filter((c) => c.parcial === col.parcial && c.type === col.type)
      .sort((a, b) => a.order - b.order);
    const idx = sameGroup.findIndex((c) => c.id === columnId);
    if (idx <= 0) return;
    this.swapColumns(sameGroup[idx], sameGroup[idx - 1]);
  }

  moveColumnDown(columnId: number) {
    const col = this.columns.find((c) => c.id === columnId);
    if (!col) return;
    const sameGroup = this.columns
      .filter((c) => c.parcial === col.parcial && c.type === col.type)
      .sort((a, b) => a.order - b.order);
    const idx = sameGroup.findIndex((c) => c.id === columnId);
    if (idx < 0 || idx >= sameGroup.length - 1) return;
    this.swapColumns(sameGroup[idx], sameGroup[idx + 1]);
  }

  private swapColumns(colA: any, colB: any) {
    const tempOrder = colA.order;
    colA.order = colB.order;
    colB.order = tempOrder;

    this.columns = [...this.columns].sort((a, b) => {
      if (a.parcial !== b.parcial) return a.parcial - b.parcial;
      if (a.type !== b.type) return a.type === 'teorica' ? -1 : 1;
      return a.order - b.order;
    });

    for (const col of [colA, colB]) {
      this.http.put<any>(API_ENDPOINTS.grades.columns.update(col.id), {
        name: col.name,
        weight: col.weight,
        type: col.type,
        parcial: col.parcial,
        order: col.order,
      }, { headers: this.getHeaders() }).subscribe({
        error: () => {},
      });
    }
  }

  startEditConfig() {
    this.editingConfig = true;
    this.configTheoryWeight = this.subjectConfig?.theory_weight * 100 || 30;
    this.configPracticeWeight = this.subjectConfig?.practice_weight * 100 || 70;
    this.configNumParciales = this.subjectConfig?.num_parciales || 2;
  }

  cancelEditConfig() {
    this.editingConfig = false;
    if (this.subjectConfig) {
      this.configTheoryWeight = this.subjectConfig.theory_weight * 100;
      this.configPracticeWeight = this.subjectConfig.practice_weight * 100;
      this.configNumParciales = this.subjectConfig.num_parciales;
    }
  }

  saveSubjectConfig() {
    if (!this.selectedSubject) return;

    this.savingConfig = true;
    const parallelId = this.selectedSubject?.parallel_id || this.parallel?.id;

    const body = {
      subject_id: this.selectedSubject.id,
      parallel_id: parallelId,
      theory_weight: this.configTheoryWeight / 100,
      practice_weight: this.configPracticeWeight / 100,
      num_parciales: this.configNumParciales,
    };

    this.http.put<any>(API_ENDPOINTS.grades.subjectConfig, body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.savingConfig = false;
        this.subjectConfig = resp.subject;
        this.editingConfig = false;
        this.toast.success('Configuración guardada correctamente');
        this.loadGrades();
      },
      error: () => {
        this.savingConfig = false;
        this.toast.error('Error al guardar configuración');
      },
    });
  }

  publishGrades() {
    if (!this.selectedSubject) return;
    this.publishing = true;
    const body = {
      subject_id: this.selectedSubject.id,
      parallel_id: this.selectedSubject.parallel_id || this.parallel?.id,
    };
    this.http.post<any>(API_ENDPOINTS.grades.publish, body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.publishing = false;
        this.isPublished = true;
        this.toast.success('Notas publicadas correctamente');
      },
      error: () => {
        this.publishing = false;
        this.toast.error('Error al publicar notas');
      },
    });
  }

  unpublishGrades() {
    if (!this.selectedSubject) return;
    this.publishing = true;
    const body = {
      subject_id: this.selectedSubject.id,
      parallel_id: this.selectedSubject.parallel_id || this.parallel?.id,
    };
    this.http.post<any>(API_ENDPOINTS.grades.unpublish, body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.publishing = false;
        this.isPublished = false;
        this.toast.success('Notas despublicadas correctamente');
      },
      error: () => {
        this.publishing = false;
        this.toast.error('Error al despublicar notas');
      },
    });
  }

  goBack() {
    this.router.navigate(['/home/professor/subjets']);
  }

  goToParcialReport() {
    if (!this.selectedSubject) return;
    const parallelId = this.selectedSubject.parallel_id || this.parallel?.id;
    this.router.navigate(['/home/professor/parcial-report'], {
      queryParams: {
        subject_id: this.selectedSubject.id,
        parallel_id: parallelId,
      }
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }
}
