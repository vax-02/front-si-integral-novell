import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NotaDetalle {
  evaluacion: string;
  fecha: string;
  ponderacion: number;
  valor: number;
}

interface Materia {
  id: number;
  nombre: string;
  sigla: string;
  carrera: string;
  docente: string;
  cargaHoraria: number;
  asistencia: number;
  notaActual: number | null;
  estado: 'Cursando' | 'Aprobada' | 'Reprobada';
  notas: NotaDetalle[];
}

@Component({
  selector: 'app-my-subjects',
  imports: [CommonModule],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.css',
})
export class MySubjectsComponent {
  readonly materias = signal<Materia[]>([
    {
      id: 1,
      nombre: 'Programación Web Avanzada',
      sigla: 'INF-301',
      carrera: 'Ingeniería en Sistemas Informáticos',
      docente: 'Ing. Carla Mendoza',
      cargaHoraria: 6,
      asistencia: 94,
      notaActual: 82,
      estado: 'Cursando',
      notas: [
        {
          evaluacion: 'Primer Parcial',
          fecha: '15/04/2026',
          ponderacion: 30,
          valor: 78,
        },
        {
          evaluacion: 'Segundo Parcial',
          fecha: '20/05/2026',
          ponderacion: 30,
          valor: 85,
        },
        {
          evaluacion: 'Prácticas',
          fecha: 'Continuo',
          ponderacion: 20,
          valor: 88,
        },
      ],
    },
    {
      id: 2,
      nombre: 'Base de Datos II',
      sigla: 'INF-245',
      carrera: 'Ingeniería en Sistemas Informáticos',
      docente: 'Lic. Roberto Quispe',
      cargaHoraria: 5,
      asistencia: 88,
      notaActual: 65,
      estado: 'Cursando',
      notas: [
        {
          evaluacion: 'Primer Parcial',
          fecha: '14/04/2026',
          ponderacion: 30,
          valor: 60,
        },
        {
          evaluacion: 'Segundo Parcial',
          fecha: '19/05/2026',
          ponderacion: 30,
          valor: 68,
        },
      ],
    },
    {
      id: 3,
      nombre: 'Matemática Discreta',
      sigla: 'MAT-110',
      carrera: 'Ingeniería en Sistemas Informáticos',
      docente: 'Lic. Ana Flores',
      cargaHoraria: 4,
      asistencia: 76,
      notaActual: 48,
      estado: 'Reprobada',
      notas: [
        {
          evaluacion: 'Primer Parcial',
          fecha: '12/04/2026',
          ponderacion: 30,
          valor: 45,
        },
        {
          evaluacion: 'Segundo Parcial',
          fecha: '17/05/2026',
          ponderacion: 30,
          valor: 50,
        },
      ],
    },
  ]);

  readonly materiaSeleccionada = signal<Materia | null>(null);

  readonly promedioGeneral = computed(() => {
    const lista = this.materias().filter((m) => m.notaActual !== null);
    if (lista.length === 0) return '—';
    const suma = lista.reduce((acc, m) => acc + (m.notaActual ?? 0), 0);
    return Math.round(suma / lista.length);
  });

  readonly aprobadas = computed(
    () => this.materias().filter((m) => m.estado === 'Aprobada').length,
  );

  readonly enRiesgo = computed(
    () =>
      this.materias().filter((m) => m.notaActual !== null && m.notaActual < 51)
        .length,
  );

  abrirModal(materia: Materia): void {
    this.materiaSeleccionada.set(materia);
  }

  cerrarModal(): void {
    this.materiaSeleccionada.set(null);
  }

  badgeEstadoClass(estado: Materia['estado']): string {
    const base = 'text-xs font-semibold px-2.5 py-1 rounded-full';
    switch (estado) {
      case 'Cursando':
        return `${base} bg-blue-100 text-blue-700`;
      case 'Aprobada':
        return `${base} bg-emerald-100 text-emerald-700`;
      case 'Reprobada':
        return `${base} bg-red-100 text-red-700`;
    }
  }

  notaClass(nota: number | null): string {
    if (nota === null) return 'font-semibold text-slate-400';
    if (nota >= 70) return 'font-semibold text-emerald-600';
    if (nota >= 51) return 'font-semibold text-yellow-600';
    return 'font-semibold text-red-600';
  }
}
