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
  modalDetail : boolean = false

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

    // Primero cargar carreras, luego subjects
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
        console.error(err);
      },
    });
  }

  seleccionarCarrera(id: number) {
    console.log('id de la carrera'+id)
    this.carreraSeleccionadaId.set(id);
    this.levelSeleccionado.set(null);
    this.loadSubjectsForCareer(id);
  }

  seleccionarLevel(level: number | null) {
    this.levelSeleccionado.set(level);
  }

  openDetail(){
    this.modalDetail = true;

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
        console.error(err);
      },
    });
  }
}