import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ButtonComponent} from '../../shared/button/button.component';
interface MateriaPensum {
  sigla: string;
  nombre: string;
  area: 'Básica' | 'Específica' | 'Humanística' | 'Práctica';
  cargaHoraria: number;
  creditos: number;
  prerequisito?: string;
}

interface AnioPensum {
  numero: number;
  etiqueta: string;
  materias: MateriaPensum[];
}

interface Carrera {
  id: number;
  nombre: string;
  titulo: string;
  anios: AnioPensum[];
}
@Component({
  selector: 'app-my-pensul',
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './my-pensul.component.html',
  styleUrl: './my-pensul.component.css',
})
export class MyPensulComponent {
  readonly carreras = signal<Carrera[]>([
    {
      id: 1,
      nombre: 'Ingeniería en Sistemas Informáticos',
      titulo: 'Técnico Superior en Sistemas Informáticos',
      anios: [
        {
          numero: 1,
          etiqueta: 'Primer Año',
          materias: [
            {
              sigla: 'INF-101',
              nombre: 'Introducción a la Programación',
              area: 'Específica',
              cargaHoraria: 6,
              creditos: 8,
            },
            {
              sigla: 'MAT-101',
              nombre: 'Matemática Básica',
              area: 'Básica',
              cargaHoraria: 5,
              creditos: 6,
            },
            {
              sigla: 'INF-102',
              nombre: 'Fundamentos de Hardware',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
            },
            {
              sigla: 'HUM-101',
              nombre: 'Comunicación Oral y Escrita',
              area: 'Humanística',
              cargaHoraria: 3,
              creditos: 3,
            },
            {
              sigla: 'INF-103',
              nombre: 'Lógica de Sistemas',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
            },
            {
              sigla: 'MAT-102',
              nombre: 'Álgebra Lineal',
              area: 'Básica',
              cargaHoraria: 4,
              creditos: 5,
            },
          ],
        },
        {
          numero: 2,
          etiqueta: 'Segundo Año',
          materias: [
            {
              sigla: 'INF-201',
              nombre: 'Programación Orientada a Objetos',
              area: 'Específica',
              cargaHoraria: 6,
              creditos: 8,
              prerequisito: 'INF-101',
            },
            {
              sigla: 'INF-202',
              nombre: 'Base de Datos I',
              area: 'Específica',
              cargaHoraria: 5,
              creditos: 6,
            },
            {
              sigla: 'MAT-201',
              nombre: 'Matemática Discreta',
              area: 'Básica',
              cargaHoraria: 4,
              creditos: 5,
              prerequisito: 'MAT-101',
            },
            {
              sigla: 'INF-203',
              nombre: 'Redes de Computadoras',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
            },
            {
              sigla: 'HUM-201',
              nombre: 'Ética Profesional',
              area: 'Humanística',
              cargaHoraria: 2,
              creditos: 2,
            },
            {
              sigla: 'INF-204',
              nombre: 'Estructura de Datos',
              area: 'Específica',
              cargaHoraria: 5,
              creditos: 6,
              prerequisito: 'INF-101',
            },
          ],
        },
        {
          numero: 3,
          etiqueta: 'Tercer Año',
          materias: [
            {
              sigla: 'INF-301',
              nombre: 'Programación Web Avanzada',
              area: 'Específica',
              cargaHoraria: 6,
              creditos: 8,
              prerequisito: 'INF-201',
            },
            {
              sigla: 'INF-302',
              nombre: 'Base de Datos II',
              area: 'Específica',
              cargaHoraria: 5,
              creditos: 6,
              prerequisito: 'INF-202',
            },
            {
              sigla: 'INF-303',
              nombre: 'Ingeniería de Software',
              area: 'Específica',
              cargaHoraria: 5,
              creditos: 6,
            },
            {
              sigla: 'INF-304',
              nombre: 'Seguridad Informática',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
            },
            {
              sigla: 'PRA-301',
              nombre: 'Práctica Profesional',
              area: 'Práctica',
              cargaHoraria: 8,
              creditos: 10,
            },
            {
              sigla: 'INF-305',
              nombre: 'Proyecto de Grado',
              area: 'Práctica',
              cargaHoraria: 6,
              creditos: 8,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      nombre: 'Contaduría General',
      titulo: 'Técnico Superior en Contaduría General',
      anios: [
        {
          numero: 1,
          etiqueta: 'Primer Año',
          materias: [
            {
              sigla: 'CON-101',
              nombre: 'Contabilidad Básica',
              area: 'Específica',
              cargaHoraria: 6,
              creditos: 8,
            },
            {
              sigla: 'MAT-101',
              nombre: 'Matemática Básica',
              area: 'Básica',
              cargaHoraria: 5,
              creditos: 6,
            },
            {
              sigla: 'ADM-101',
              nombre: 'Introducción a la Administración',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
            },
            {
              sigla: 'HUM-101',
              nombre: 'Comunicación Oral y Escrita',
              area: 'Humanística',
              cargaHoraria: 3,
              creditos: 3,
            },
            {
              sigla: 'CON-102',
              nombre: 'Legislación Tributaria I',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
            },
            {
              sigla: 'MAT-103',
              nombre: 'Matemática Financiera',
              area: 'Básica',
              cargaHoraria: 4,
              creditos: 5,
            },
          ],
        },
        {
          numero: 2,
          etiqueta: 'Segundo Año',
          materias: [
            {
              sigla: 'CON-201',
              nombre: 'Contabilidad de Costos',
              area: 'Específica',
              cargaHoraria: 5,
              creditos: 6,
              prerequisito: 'CON-101',
            },
            {
              sigla: 'CON-202',
              nombre: 'Legislación Tributaria II',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
              prerequisito: 'CON-102',
            },
            {
              sigla: 'ADM-201',
              nombre: 'Gestión de Recursos Humanos',
              area: 'Específica',
              cargaHoraria: 3,
              creditos: 4,
            },
            {
              sigla: 'CON-203',
              nombre: 'Auditoría I',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
            },
            {
              sigla: 'HUM-201',
              nombre: 'Ética Profesional',
              area: 'Humanística',
              cargaHoraria: 2,
              creditos: 2,
            },
            {
              sigla: 'CON-204',
              nombre: 'Estados Financieros',
              area: 'Específica',
              cargaHoraria: 5,
              creditos: 6,
              prerequisito: 'CON-101',
            },
          ],
        },
        {
          numero: 3,
          etiqueta: 'Tercer Año',
          materias: [
            {
              sigla: 'CON-301',
              nombre: 'Contabilidad Gubernamental',
              area: 'Específica',
              cargaHoraria: 5,
              creditos: 6,
            },
            {
              sigla: 'CON-302',
              nombre: 'Auditoría II',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
              prerequisito: 'CON-203',
            },
            {
              sigla: 'CON-303',
              nombre: 'Sistemas Contables Computarizados',
              area: 'Específica',
              cargaHoraria: 5,
              creditos: 6,
            },
            {
              sigla: 'CON-304',
              nombre: 'Finanzas Corporativas',
              area: 'Específica',
              cargaHoraria: 4,
              creditos: 5,
            },
            {
              sigla: 'PRA-301',
              nombre: 'Práctica Profesional',
              area: 'Práctica',
              cargaHoraria: 8,
              creditos: 10,
            },
            {
              sigla: 'CON-305',
              nombre: 'Proyecto de Grado',
              area: 'Práctica',
              cargaHoraria: 6,
              creditos: 8,
            },
          ],
        },
      ],
    },
  ]);

  readonly carreraSeleccionadaId = signal<number | null>(null);

  readonly carreraActual = computed(
    () =>
      this.carreras().find((c) => c.id === this.carreraSeleccionadaId()) ??
      null,
  );

  seleccionarCarrera(id: number): void {
    this.carreraSeleccionadaId.set(id);
  }

  totalMaterias(carrera: Carrera): number {
    return carrera.anios.reduce((acc, anio) => acc + anio.materias.length, 0);
  }

  totalHoras(carrera: Carrera): number {
    return carrera.anios.reduce(
      (acc, anio) =>
        acc + anio.materias.reduce((sum, m) => sum + m.cargaHoraria, 0),
      0,
    );
  }

  badgeAreaClass(area: MateriaPensum['area']): string {
    const base =
      'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide';
    switch (area) {
      case 'Básica':
        return `${base} bg-blue-100 text-blue-700`;
      case 'Específica':
        return `${base} bg-indigo-100 text-indigo-700`;
      case 'Humanística':
        return `${base} bg-amber-100 text-amber-700`;
      case 'Práctica':
        return `${base} bg-emerald-100 text-emerald-700`;
    }
  }
}
