import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CareerService } from '../../service/career.service';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';

interface SubjectEntry {
  sigla: string;
  name: string;
  level: number;
  paralelo: string;
  docente: string;
  subject_id?: number;
}

interface CareerLevel {
  level: number;
  label: string;
}

interface CareerInfo {
  id: number;
  name: string;
  type: number;
  duration: number;
  levels: CareerLevel[];
}

interface Evaluation {
  name: string;
  weight: number;
  weight_percent: number;
  grade: number | null;
}

interface SubjectGrade {
  subject_id: number;
  subject_name: string;
  subject_sigla: string;
  parallel_name: string;
  turno: string;
  course_name: string;
  docente: string;
  evaluations: Evaluation[];
  final_grade: number | null;
}

@Component({
  selector: 'app-my-subjects',
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.css',
})
export class MySubjectsComponent {
  readonly carreras = signal<CareerInfo[]>([]);
  readonly carreraSeleccionadaId = signal<number | null>(null);
  readonly levelSeleccionado = signal<number | null>(null);
  readonly subjects = signal<SubjectEntry[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  modalDetail: boolean = false;

  // Datos de calificaciones del modal
  readonly selectedSubjectGrade = signal<SubjectGrade | null>(null);
  readonly loadingGrades = signal(false);
  readonly gradesError = signal<string | null>(null);

  readonly carreraActual = computed(() => {
    const id = this.carreraSeleccionadaId();
    return this.carreras().find((c) => c.id === id) ?? null;
  });

  readonly levelsDisponibles = computed(() => {
    return this.carreraActual()?.levels ?? [];
  });

  readonly subjectsFiltrados = computed(() => {
    const level = this.levelSeleccionado();
    if (!level) return this.subjects();
    return this.subjects().filter((s) => s.level === level);
  });

  constructor(private careerService: CareerService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.careerService.getMySubjects().subscribe({
      next: (resp) => {
        this.loading.set(false);
        this.carreras.set(resp.careers || []);
        this.subjects.set(resp.subjects || []);

        if (resp.careers?.length > 0) {
          this.carreraSeleccionadaId.set(resp.careers[0].id);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar las materias.');
      },
    });
  }

  seleccionarCarrera(id: number) {
    this.carreraSeleccionadaId.set(id);
    this.levelSeleccionado.set(null);
    this.loadSubjectsForCareer(id);
  }

  seleccionarLevel(level: number | null) {
    this.levelSeleccionado.set(level);
  }

  openDetail(subject: SubjectEntry) {
    this.modalDetail = true;
    this.selectedSubjectGrade.set(null);
    this.gradesError.set(null);
    this.loadingGrades.set(true);

    this.careerService.getMyGrades(subject.sigla).subscribe({
      next: (resp) => {
        this.loadingGrades.set(false);
        const grades: SubjectGrade[] = resp.grades || [];
        // Buscar la calificación que coincide con la sigla
        const grade = grades.find((g) => g.subject_sigla === subject.sigla) || null;
        this.selectedSubjectGrade.set(grade);
        if (!grade) {
          this.gradesError.set('No hay calificaciones publicadas para esta materia.');
        }
      },
      error: (err) => {
        this.loadingGrades.set(false);
        this.gradesError.set('Error al cargar las calificaciones.');
      },
    });
  }

  cerrarModal() {
    this.modalDetail = false;
    this.selectedSubjectGrade.set(null);
    this.gradesError.set(null);
  }

  private loadSubjectsForCareer(careerId: number) {
    this.loading.set(true);
    this.careerService.getMySubjects(careerId).subscribe({
      next: (resp) => {
        this.loading.set(false);
        this.subjects.set(resp.subjects || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar las materias.');
      },
    });
  }
}