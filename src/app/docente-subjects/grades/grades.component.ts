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
  imports: [CommonModule, FormsModule,BaseModalConfirmComponent],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.css',
})
export class GradesComponent implements OnInit, OnDestroy {
  // Materias del docente
  subjects: any[] = [];
  loadingSubjects = false;

  modalConfirm : boolean = false
  columnIdSelect : number = 0
  resetLoading : boolean = false
  // Materia y paralelo seleccionados
  selectedSubject: any = null;

  // Estudiantes con calificaciones
  students: any[] = [];
  columns: any[] = [];
  parallel: any = null;
  loadingGrades = false;
  error = '';

  // Estado de guardado por celda (studentId_columnId)
  cellStates: Record<string, GradeState> = {};

  // Nueva columna a crear
  newColumnName = '';
  newColumnWeight = 0;
  savingColumn = false;

  // Editar columna
  editingColumn: any = null;
  editColumnName = '';
  editColumnWeight = 0;
  savingEditColumn = false;

  // Buscador de estudiantes
  searchStudent = '';

  // Estado de publicación
  isPublished = false;
  publishing = false;

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

    // Verificar si viene subject_id en query params
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

  /** Filtrar estudiantes por nombre o CI */
  get filteredStudents() {
    if (!this.searchStudent.trim()) return this.students;
    const term = this.searchStudent.toLowerCase();
    return this.students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.ci.toLowerCase().includes(term)
    );
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
          this.columns = (resp.columns || []).sort((a: any, b: any) => a.order - b.order);
          this.parallel = resp.parallel || null;
          this.isPublished = resp.published || false;
        },
        error: (err) => {
          this.loadingGrades = false;
          this.error = 'Error al cargar las calificaciones.';
          this.students = [];
          this.columns = [];
          this.parallel = null;
          console.log(err)
        },
      });
  }

  getGrade(student: any, columnId: number): string {
    const grade = student.grades[columnId];
    return grade?.grade !== null && grade?.grade !== undefined ? String(grade.grade) : '';
  }

  /** Guardar calificación al salir del input (blur) */
  onGradeBlur(student: any, columnId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Validar que sea numérico
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

        // Actualizar la nota final del estudiante
        if (resp.final_grade !== undefined) {
          student.final_grade = resp.final_grade;
        }

        // Actualizar grade en el objeto local
        if (student.grades[columnId]) {
          student.grades[columnId].id = resp.qualification_id;
        }

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

  getCellState(studentId: number, columnId: number): GradeState {
    const key = `${studentId}_${columnId}`;
    return this.cellStates[key] || { status: 'idle' };
  }

  /** Agregar una nueva columna de evaluación */
  addColumn() {
    if (!this.selectedSubject || !this.newColumnName.trim() || this.newColumnWeight <= 0) return;

    this.savingColumn = true;
    const courseId = this.selectedSubject.course_id || this.parallel?.course?.id;

    const body = {
      subject_id: this.selectedSubject.id,
      parallel_id: this.selectedSubject.parallel_id,
      course_id: courseId,
      name: this.newColumnName.trim(),
      weight: this.newColumnWeight / 100,
      order: this.columns.length,
    };

    this.http.post<any>(API_ENDPOINTS.grades.columns.store, body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.savingColumn = false;
        this.columns.push(resp.column);
        this.newColumnName = '';
        this.newColumnWeight = 0;
      },
      error: (err) => {
        this.savingColumn = false;
        console.error('Error al crear columna', err);
      },
    });
  }

  /** Iniciar edición de columna */
  startEditColumn(column: any) {
    this.editingColumn = column;
    this.editColumnName = column.name;
    this.editColumnWeight = column.weight * 100;
  }

  /** Cancelar edición */
  cancelEditColumn() {
    this.editingColumn = null;
    this.editColumnName = '';
    this.editColumnWeight = 0;
  }

  /** Guardar edición de columna */
  saveEditColumn() {
    if (!this.editingColumn || !this.editColumnName.trim() || this.editColumnWeight <= 0) return;

    this.savingEditColumn = true;

    const body = {
      name: this.editColumnName.trim(),
      weight: this.editColumnWeight / 100,
    };

    this.http.put<any>(API_ENDPOINTS.grades.columns.update(this.editingColumn.id), body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.savingEditColumn = false;
        const col = this.columns.find((c) => c.id === this.editingColumn.id);
        if (col) {
          col.name = resp.column?.name || this.editColumnName.trim();
          col.weight = resp.column?.weight || this.editColumnWeight / 100;
        }
        this.cancelEditColumn();
        this.toast.success('Columna editada correctamente')
      },
      error: (err) => {
        this.savingEditColumn = false;
        //console.error('Error al actualizar columna', err);
        this.toast.error('Error al editar la columna')
      },
    });
  }
  /** Eliminar una columna de evaluación */
  deleteColumn(columnId: number) {
    this.modalConfirm = true;
    this.columnIdSelect = columnId
  }
  confirmDeleteColumn(){
    this.resetLoading = true
    this.http.delete<any>(API_ENDPOINTS.grades.columns.delete(this.columnIdSelect), { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.columns = this.columns.filter((c) => c.id !== this.columnIdSelect);
        if (this.editingColumn?.id === this.columnIdSelect) {
          this.cancelEditColumn();
        }
        this.toast.success('Columna eliminada correctamente')
        this.resetLoading = false
        this.modalConfirm = false
      },
      error: (err) => {
        this.toast.error('Error al eliminar columna')
        this.resetLoading = false
      },
    });
  }

  /** Mover columna hacia arriba (disminuir order) */
  moveColumnUp(index: number) {
    if (index <= 0) return;
    this.swapColumns(index, index - 1);
  }

  /** Mover columna hacia abajo (aumentar order) */
  moveColumnDown(index: number) {
    if (index >= this.columns.length - 1) return;
    this.swapColumns(index, index + 1);
  }

  private swapColumns(i: number, j: number) {
    const temp = this.columns[i];
    this.columns[i] = this.columns[j];
    this.columns[j] = temp;

    this.columns.forEach((col, idx) => {
      col.order = idx;
    });

    for (const col of [this.columns[i], this.columns[j]]) {
      this.http.put<any>(API_ENDPOINTS.grades.columns.update(col.id), {
        name: col.name,
        weight: col.weight,
        order: col.order,
      }, { headers: this.getHeaders() }).subscribe({
        error: (err) => console.error('Error al reordenar columna', err),
      });
    }
  }

  /** Publicar notas */
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

  /** Despublicar notas */
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

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }
}