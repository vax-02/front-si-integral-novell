import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { DocenteService } from '../../service/docente.service';
import { API_ENDPOINTS } from '../../config/api-endpoints';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

interface GradeState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.css',
})
export class GradesComponent implements OnInit, OnDestroy {
  // Materias del docente
  subjects: any[] = [];
  loadingSubjects = false;

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

  // Debounce para auto-save
  private saveSubject = new Subject<{ studentId: number; columnId: number; value: string }>();
  private saveSubscription?: Subscription;

  // Contador de guardados pendientes
  pendingSaves = 0;

  constructor(
    private docenteService: DocenteService,
    private http: HttpClient,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSubjects();

    // Configurar auto-save con debounce de 800ms
    this.saveSubscription = this.saveSubject
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((data) => this.saveGrade(data));

    // Verificar si viene subject_id en query params
    this.route.queryParams.subscribe((params) => {
      if (params['subject_id']) {
        const subjectId = Number(params['subject_id']);
        // Esperar a que carguen las materias y seleccionar
        if (this.subjects.length > 0) {
          this.selectSubjectById(subjectId);
        } else {
          // Esperar a que se carguen
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

  ngOnDestroy(): void {
    if (this.saveSubscription) {
      this.saveSubscription.unsubscribe();
    }
  }

  loadSubjects() {
    this.loadingSubjects = true;
    this.docenteService.getMySubjects().subscribe({
      next: (resp) => {
        this.loadingSubjects = false;
        this.subjects = resp.subjects || [];
        // Si había un subject_id en query params, seleccionarlo
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

  /** Cuando cambia la materia seleccionada */
  onSubjectChange() {
    if (this.selectedSubject) {
      this.loadGrades();
    } else {
      this.students = [];
      this.columns = [];
      this.parallel = null;
    }
  }

  /** Cargar estudiantes y calificaciones del paralelo */
  loadGrades() {
    if (!this.selectedSubject) return;

    this.loadingGrades = true;
    this.error = '';
    this.cellStates = {};

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
          this.columns = resp.columns || [];
          this.parallel = resp.parallel || null;
        },
        error: (err) => {
          this.loadingGrades = false;
          this.error = 'Error al cargar las calificaciones.';
          this.students = [];
          this.columns = [];
          this.parallel = null;
        },
      });
  }

  /** Obtener el valor de la nota de un estudiante en una columna */
  getGrade(student: any, columnId: number): string {
    const grade = student.grades[columnId];
    return grade?.grade !== null && grade?.grade !== undefined ? String(grade.grade) : '';
  }

  /** Manejar cambio en un input de nota */
  onGradeChange(student: any, columnId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Validar que sea numérico
    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
      return;
    }

    const key = `${student.id}_${columnId}`;
    this.cellStates[key] = { status: 'saving', message: 'Guardando...' };

    // Emitir al subject con debounce
    this.saveSubject.next({ studentId: student.id, columnId, value });
  }

  /** Guardar la calificación en la base de datos */
  private saveGrade(data: { studentId: number; columnId: number; value: string }) {
    if (!this.selectedSubject) return;

    const key = `${data.studentId}_${data.columnId}`;
    this.cellStates[key] = { status: 'saving', message: 'Guardando...' };

    const courseId = this.selectedSubject.course_id || this.parallel?.course?.id;

    const body = {
      student_id: data.studentId,
      subject_id: this.selectedSubject.id,
      course_id: courseId,
      evaluation_column_id: data.columnId,
      qualification: data.value !== '' ? Number(data.value) : null,
    };

    this.http.post<any>(API_ENDPOINTS.grades.save, body, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.cellStates[key] = {
          status: 'saved',
          message: '✓',
        };

        // Actualizar la nota final del estudiante
        const student = this.students.find((s) => s.id === data.studentId);
        if (student && resp.final_grade !== undefined) {
          student.final_grade = resp.final_grade;
        }

        // Actualizar grade en el objeto local
        if (student && student.grades[data.columnId]) {
          student.grades[data.columnId].id = resp.qualification?.id;
        }

        // Limpiar estado después de 2 segundos
        setTimeout(() => {
          if (this.cellStates[key]?.status === 'saved') {
            this.cellStates[key] = { status: 'idle' };
          }
        }, 2000);
      },
      error: () => {
        this.cellStates[key] = {
          status: 'error',
          message: '✗ Error',
        };

        // Limpiar error después de 3 segundos
        setTimeout(() => {
          if (this.cellStates[key]?.status === 'error') {
            this.cellStates[key] = { status: 'idle' };
          }
        }, 3000);
      },
    });
  }

  /** Obtener el estado de una celda */
  getCellState(studentId: number, columnId: number): GradeState {
    const key = `${studentId}_${columnId}`;
    return this.cellStates[key] || { status: 'idle' };
  }

  /** Volver a la lista de materias */
  goBack() {
    this.router.navigate(['/home/professor/subjets']);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }
}