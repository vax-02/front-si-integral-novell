import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';

type Dia = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

interface ClaseHorario {
  dia: Dia;
  materia: string;
  docente: string;
  aula: string;
  area: 'Básica' | 'Específica' | 'Humanística' | 'Práctica';
}

interface FranjaHoraria {
  hora: string; // ej: "07:00 - 08:30"
  clases: ClaseHorario[];
}

interface HorarioCarreraAnio {
  carreraId: number;
  anio: number;
  turno: 'Mañana' | 'Tarde' | 'Noche';
  franjas: FranjaHoraria[];
}

interface CarreraSimple {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-my-schedule',
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './my-schedule.component.html',
  styleUrl: './my-schedule.component.css',
})
export class MyScheduleComponent {
  readonly dias: Dia[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // En producción: GET /api/carreras (solo id y nombre para el select)
  readonly carreras = signal<CarreraSimple[]>([
    { id: 1, nombre: 'Ingeniería en Sistemas Informáticos' },
    { id: 2, nombre: 'Contaduría General' },
  ]);

  readonly carreraSeleccionadaId = signal<number | null>(null);
  readonly anioSeleccionado = signal<number | null>(null);

  // En producción: GET /api/horarios?carrera_id=&anio= (filtrado en backend)
  readonly horarios = signal<HorarioCarreraAnio[]>([
    {
      carreraId: 1,
      anio: 1,
      turno: 'Mañana',
      franjas: [
        {
          hora: '07:00 - 08:30',
          clases: [
            {
              dia: 'Lunes',
              materia: 'Introducción a la Programación',
              docente: 'Ing. Carla Mendoza',
              aula: 'Lab. 3',
              area: 'Específica',
            },
            {
              dia: 'Miércoles',
              materia: 'Introducción a la Programación',
              docente: 'Ing. Carla Mendoza',
              aula: 'Lab. 3',
              area: 'Específica',
            },
            {
              dia: 'Viernes',
              materia: 'Matemática Básica',
              docente: 'Lic. José Aro',
              aula: 'Aula 5',
              area: 'Básica',
            },
          ],
        },
        {
          hora: '08:30 - 10:00',
          clases: [
            {
              dia: 'Martes',
              materia: 'Fundamentos de Hardware',
              docente: 'Ing. Pedro Salas',
              aula: 'Lab. 1',
              area: 'Específica',
            },
            {
              dia: 'Jueves',
              materia: 'Fundamentos de Hardware',
              docente: 'Ing. Pedro Salas',
              aula: 'Lab. 1',
              area: 'Específica',
            },
          ],
        },
        {
          hora: '10:15 - 11:45',
          clases: [
            {
              dia: 'Lunes',
              materia: 'Matemática Básica',
              docente: 'Lic. José Aro',
              aula: 'Aula 5',
              area: 'Básica',
            },
            {
              dia: 'Miércoles',
              materia: 'Lógica de Sistemas',
              docente: 'Ing. Carla Mendoza',
              aula: 'Aula 2',
              area: 'Específica',
            },
            {
              dia: 'Viernes',
              materia: 'Lógica de Sistemas',
              docente: 'Ing. Carla Mendoza',
              aula: 'Aula 2',
              area: 'Específica',
            },
          ],
        },
        {
          hora: '11:45 - 13:15',
          clases: [
            {
              dia: 'Martes',
              materia: 'Comunicación Oral y Escrita',
              docente: 'Lic. Marisol Vega',
              aula: 'Aula 8',
              area: 'Humanística',
            },
            {
              dia: 'Jueves',
              materia: 'Álgebra Lineal',
              docente: 'Lic. José Aro',
              aula: 'Aula 5',
              area: 'Básica',
            },
          ],
        },
      ],
    },
    {
      carreraId: 1,
      anio: 3,
      turno: 'Noche',
      franjas: [
        {
          hora: '18:30 - 20:00',
          clases: [
            {
              dia: 'Lunes',
              materia: 'Programación Web Avanzada',
              docente: 'Ing. Carla Mendoza',
              aula: 'Lab. 2',
              area: 'Específica',
            },
            {
              dia: 'Miércoles',
              materia: 'Base de Datos II',
              docente: 'Lic. Roberto Quispe',
              aula: 'Lab. 4',
              area: 'Específica',
            },
            {
              dia: 'Viernes',
              materia: 'Ingeniería de Software',
              docente: 'Ing. Diego Torrez',
              aula: 'Aula 6',
              area: 'Específica',
            },
          ],
        },
        {
          hora: '20:00 - 21:30',
          clases: [
            {
              dia: 'Martes',
              materia: 'Seguridad Informática',
              docente: 'Ing. Diego Torrez',
              aula: 'Lab. 2',
              area: 'Específica',
            },
            {
              dia: 'Jueves',
              materia: 'Práctica Profesional',
              docente: 'Ing. Carla Mendoza',
              aula: 'Empresa / Externo',
              area: 'Práctica',
            },
          ],
        },
      ],
    },
    {
      carreraId: 2,
      anio: 1,
      turno: 'Tarde',
      franjas: [
        {
          hora: '14:00 - 15:30',
          clases: [
            {
              dia: 'Lunes',
              materia: 'Contabilidad Básica',
              docente: 'Lic. Wendy Choque',
              aula: 'Aula 10',
              area: 'Específica',
            },
            {
              dia: 'Miércoles',
              materia: 'Contabilidad Básica',
              docente: 'Lic. Wendy Choque',
              aula: 'Aula 10',
              area: 'Específica',
            },
            {
              dia: 'Viernes',
              materia: 'Matemática Básica',
              docente: 'Lic. José Aro',
              aula: 'Aula 5',
              area: 'Básica',
            },
          ],
        },
        {
          hora: '15:30 - 17:00',
          clases: [
            {
              dia: 'Martes',
              materia: 'Introducción a la Administración',
              docente: 'Lic. Hugo Paredes',
              aula: 'Aula 9',
              area: 'Específica',
            },
            {
              dia: 'Jueves',
              materia: 'Legislación Tributaria I',
              docente: 'Lic. Wendy Choque',
              aula: 'Aula 10',
              area: 'Específica',
            },
          ],
        },
      ],
    },
  ]);

  readonly horarioActual = computed(() => {
    const carreraId = this.carreraSeleccionadaId();
    const anio = this.anioSeleccionado();
    if (carreraId === null || anio === null) return null;

    return (
      this.horarios().find(
        (h) => h.carreraId === carreraId && h.anio === anio,
      ) ?? null
    );
  });

  actualizar(): void {
    // Punto de extensión: aquí dispararías la llamada real al backend
    // this.horarioService.getHorario(this.carreraSeleccionadaId(), this.anioSeleccionado())
  }

  claseEn(franja: FranjaHoraria, dia: Dia): ClaseHorario | null {
    return franja.clases.find((c) => c.dia === dia) ?? null;
  }

  totalMaterias(horario: HorarioCarreraAnio): number {
    const siglas = new Set(
      horario.franjas.flatMap((f) => f.clases.map((c) => c.materia)),
    );
    return siglas.size;
  }

  totalHorasSemana(horario: HorarioCarreraAnio): number {
    return horario.franjas.reduce((acc, f) => acc + f.clases.length, 0) * 1.5;
  }

  diaConMasCarga(horario: HorarioCarreraAnio): string {
    const conteo: Record<string, number> = {};
    for (const franja of horario.franjas) {
      for (const clase of franja.clases) {
        conteo[clase.dia] = (conteo[clase.dia] ?? 0) + 1;
      }
    }
    const entradas = Object.entries(conteo);
    if (entradas.length === 0) return '—';
    return entradas.sort((a, b) => b[1] - a[1])[0][0];
  }

  celdaClaseClass(area: ClaseHorario['area']): string {
    const base = 'rounded-lg p-2 text-xs h-full min-h-[64px]';
    switch (area) {
      case 'Básica':
        return `${base} bg-blue-50 text-blue-700 border border-blue-100`;
      case 'Específica':
        return `${base} bg-indigo-50 text-indigo-700 border border-indigo-100`;
      case 'Humanística':
        return `${base} bg-amber-50 text-amber-700 border border-amber-100`;
      case 'Práctica':
        return `${base} bg-emerald-50 text-emerald-700 border border-emerald-100`;
    }
  }
}
