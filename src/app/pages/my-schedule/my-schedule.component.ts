import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { CareerService } from '../../service/career.service';

type Dia = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

interface ScheduleEntry {
  day: string;
  start_time: string;
  end_time: string;
  subject: {
    sigla: string;
    name: string;
  };
  docente: string | null;
}

interface CareerSchedule {
  id: number;
  name: string;
  course_name: string;
  course_level: number;
  turno: string;
  paralelo: string;
  schedules: ScheduleEntry[];
}

interface CarreraSimple {
  id: number;
  nombre: string;
}

interface FranjaHoraria {
  hora: string; // ej: "07:00 - 08:30"
  clases: ScheduleEntry[];
}

@Component({
  selector: 'app-my-schedule',
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './my-schedule.component.html',
  styleUrl: './my-schedule.component.css',
})
export class MyScheduleComponent {
  readonly dias: Dia[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  readonly carreras = signal<CarreraSimple[]>([]);
  readonly carreraSeleccionadaId = signal<number | null>(null);
  readonly horarios = signal<CareerSchedule[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly horarioActual = computed(() => {
    const carreraId = this.carreraSeleccionadaId();
    if (carreraId === null) return null;
    return this.horarios().find((h) => h.id === carreraId) ?? null;
  });

  readonly franjas = computed(() => {
    const horario = this.horarioActual();
    if (!horario) return [];

    // Agrupar schedules por franja horaria (start_time - end_time)
    const franjaMap = new Map<string, ScheduleEntry[]>();

    for (const s of horario.schedules) {
      const key = `${s.start_time} - ${s.end_time}`;
      if (!franjaMap.has(key)) {
        franjaMap.set(key, []);
      }
      franjaMap.get(key)!.push(s);
    }

    // Ordenar franjas por start_time
    const franjas: FranjaHoraria[] = [];
    for (const [hora, clases] of franjaMap) {
      franjas.push({ hora, clases });
    }
    franjas.sort((a, b) => a.hora.localeCompare(b.hora));

    return franjas;
  });

  constructor(private careerService: CareerService) {}

  ngOnInit() {
    this.loadCareers();
  }

  loadCareers() {
    this.careerService.getMyPensum().subscribe({
      next: (resp) => {
        const careers = (resp.careers || []).map((c: any) => ({
          id: c.id,
          nombre: c.name,
        }));
        this.carreras.set(careers);
        if (careers.length > 0) {
          this.carreraSeleccionadaId.set(careers[0].id);
          this.loadSchedule();
        }
      },
      error: (err) => {
        console.error('Error al cargar carreras', err);
      },
    });
  }

  loadSchedule() {
    this.loading.set(true);
    this.error.set(null);
    this.careerService.getMySchedule().subscribe({
      next: (resp) => {
        this.loading.set(false);
        this.horarios.set(resp.careers || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar el horario.');
        console.error(err);
      },
    });
  }

  seleccionarCarrera(id: number): void {
    this.carreraSeleccionadaId.set(id);
  }

  claseEn(franja: FranjaHoraria, dia: Dia): ScheduleEntry | null {
    return franja.clases.find((c) => c.day === dia) ?? null;
  }

  totalMaterias(horario: CareerSchedule): number {
    const siglas = new Set(horario.schedules.map((s) => s.subject.sigla));
    return siglas.size;
  }

  totalHorasSemana(horario: CareerSchedule): number {
    return horario.schedules.length * 1.5;
  }

  diaConMasCarga(horario: CareerSchedule): string {
    const conteo: Record<string, number> = {};
    for (const s of horario.schedules) {
      conteo[s.day] = (conteo[s.day] ?? 0) + 1;
    }
    const entradas = Object.entries(conteo);
    if (entradas.length === 0) return '—';
    return entradas.sort((a, b) => b[1] - a[1])[0][0];
  }
}