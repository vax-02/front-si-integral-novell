import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ButtonComponent} from '../../shared/button/button.component';
import { CareerService } from '../../service/career.service';

interface MateriaPensum {
  sigla: string;
  nombre: string;
  prerequisito?: string;
  status?: string;
}

interface LevelPensum {
  level: number;
  label: string;
  subjects: MateriaPensum[];
}

interface Carrera {
  id: number;
  nombre: string;
  duration: string;
  type: number;
  total_subjects: number;
  levels: LevelPensum[];
}

@Component({
  selector: 'app-my-pensul',
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './my-pensul.component.html',
  styleUrl: './my-pensul.component.css',
})
export class MyPensulComponent {
  readonly carreras = signal<Carrera[]>([]);
  readonly carreraSeleccionadaId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly carreraActual = computed(
    () =>
      this.carreras().find((c) => c.id === this.carreraSeleccionadaId()) ??
      null,
  );

  constructor(private careerService: CareerService){}

  ngOnInit(){
    this.loadMyPensum();
  }

  loadMyPensum(){
    this.loading.set(true);
    this.error.set(null);
    this.careerService.getMyPensum().subscribe({
      next: (resp) => {
        this.loading.set(false);
        const careers = (resp.careers || []).map((c: any) => ({
          id: c.id,
          nombre: c.name,
          duration: c.duration,
          type: c.type,
          total_subjects: c.total_subjects,
          levels: (c.levels || []).map((l: any) => ({
            level: l.level,
            label: l.label,
            subjects: (l.subjects || []).map((s: any) => ({
              sigla: s.sigla,
              nombre: s.name,
              prerequisito: s.prerequisite_sigla,
              status: s.status,
            })),
          })),
        }));
        this.carreras.set(careers);
        if (careers.length > 0) {
          this.carreraSeleccionadaId.set(careers[0].id);
        }
        console.log(careers)
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar el plan de estudios.');
        console.error(err);
      }
    });
  }

  seleccionarCarrera(id: number): void {
    this.carreraSeleccionadaId.set(id);
  }

  totalMaterias(carrera: Carrera): number {
    return carrera.levels.reduce((acc, level) => acc + level.subjects.length, 0);
  }
}