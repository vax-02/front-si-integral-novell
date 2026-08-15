import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { CareerService } from '../../service/career.service';

type Dia = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes';

interface ScheduleEntry {
  day: string;
  start_time: string;
  end_time: string;
  subject_id: number;
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
  readonly dias: Dia[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

  private readonly SUBJECT_COLORS = [
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', sigla: 'text-blue-600' },
    { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', sigla: 'text-emerald-600' },
    { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', sigla: 'text-amber-600' },
    { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800', sigla: 'text-rose-600' },
    { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-800', sigla: 'text-violet-600' },
    { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-800', sigla: 'text-cyan-600' },
    { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', sigla: 'text-orange-600' },
    { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800', sigla: 'text-teal-600' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', sigla: 'text-pink-600' },
    { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', sigla: 'text-indigo-600' },
    { bg: 'bg-lime-100', border: 'border-lime-300', text: 'text-lime-800', sigla: 'text-lime-600' },
    { bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', text: 'text-fuchsia-800', sigla: 'text-fuchsia-600' },
  ];
  private subjectColorMap = new Map<number, { bg: string; border: string; text: string; sigla: string }>();
  private nextColorIndex = 0;

  getSubjectColor(subjectId: number): { bg: string; border: string; text: string; sigla: string } {
    if (!this.subjectColorMap.has(subjectId)) {
      this.subjectColorMap.set(subjectId, this.SUBJECT_COLORS[this.nextColorIndex % this.SUBJECT_COLORS.length]);
      this.nextColorIndex++;
    }
    return this.subjectColorMap.get(subjectId)!;
  }

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