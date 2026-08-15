import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AttendanceService } from '../../service/attendance.service';
import { ToastService } from '../../shared/services/toast.service';
import { DIAS } from '../schedule-docente/schedule-docente.component';

@Component({
  selector: 'app-my-attendance',
  imports: [CommonModule],
  templateUrl: './my-attendance.component.html',
  styleUrl: './my-attendance.component.css',
})
export class MyAttendanceComponent {
  readonly DIAS = DIAS;
  readonly DIAS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  calendarView: 'month' | 'week' = 'month';
  cursorDate = new Date();
  detailFrom = '';
  detailTo = '';
  detailLoading = false;
  detailResult: any = null;
  detailByDate = new Map<string, any>();

  tooltip: { x: number; y: number; day: any } | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.setCalendarRange(this.cursorDate);
    this.loadDetail();
  }

  loadDetail(): void {
    this.detailLoading = true;
    this.attendanceService.myAttendance(this.detailFrom, this.detailTo).subscribe({
      next: (res) => {
        this.detailLoading = false;
        this.detailResult = res.docente ?? null;
        this.detailByDate = new Map<string, any>();
        for (const row of this.detailResult?.days ?? []) {
          this.detailByDate.set(row.date, row);
        }
      },
      error: () => {
        this.detailLoading = false;
        this.toast.error('Error al cargar los registros de asistencia');
      },
    });
  }

  switchView(view: 'month' | 'week'): void {
    if (this.calendarView === view) return;
    this.calendarView = view;
    this.setCalendarRange(this.cursorDate);
    this.loadDetail();
  }

  changeCalendar(delta: number): void {
    if (this.calendarView === 'month') {
      this.cursorDate = new Date(
        this.cursorDate.getFullYear(),
        this.cursorDate.getMonth() + delta,
        1,
      );
    } else {
      this.cursorDate = this.addDays(this.mondayOf(this.cursorDate), delta * 7);
    }
    this.setCalendarRange(this.cursorDate);
    this.loadDetail();
  }

  goToday(): void {
    this.cursorDate = new Date();
    this.setCalendarRange(this.cursorDate);
    this.loadDetail();
  }

  get monthLabel(): string {
    return this.monthYear(this.cursorDate);
  }

  get weekLabel(): string {
    const monday = this.mondayOf(this.cursorDate);
    const sunday = this.addDays(monday, 6);
    const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
    return `${fmt(monday)} – ${fmt(sunday)}`;
  }

  monthCells(): any[] {
    const first = new Date(this.cursorDate.getFullYear(), this.cursorDate.getMonth(), 1);
    const start = this.mondayOf(first);
    return Array.from({ length: 42 }, (_, i) => {
      const d = this.addDays(start, i);
      if (d.getMonth() !== this.cursorDate.getMonth()) return null;
      const date = this.toISODate(d);
      return { date, day: this.detailByDate.get(date) ?? null };
    });
  }

  weekCells(): any[] {
    const monday = this.mondayOf(this.cursorDate);
    return Array.from({ length: 7 }, (_, i) => {
      const date = this.toISODate(this.addDays(monday, i));
      return { date, dayName: DIAS[i], day: this.detailByDate.get(date) ?? null };
    });
  }

  dayStatus(day: any): string | null {
    const entries = day?.entries ?? [];
    if (!entries.length) return null;
    const order = ['retraso', 'puntual', 'falta'];
    for (const s of order) {
      if (entries.some((e: any) => e.status === s)) return s;
    }
    return null;
  }

  formatClock(entry: any): string {
    const t = entry?.first_clock;
    return t ? t.slice(0, 5) : '';
  }

  refTime(entry: any): string {
    const t = entry?.reference_time;
    return t ? t.slice(0, 5) : '';
  }

  cellClass(cell: any): string {
    if (!cell) return 'border border-transparent bg-slate-50/60';
    const today = this.isToday(cell.date) ? ' border-blue-400 ring-2 ring-blue-100' : '';
    const s = this.dayStatus(cell.day);
    if (s === 'puntual')
      return 'border border-slate-200 border-l-4 border-l-emerald-500 bg-white hover:border-slate-300' + today;
    if (s === 'retraso')
      return 'border border-slate-200 border-l-4 border-l-rose-500 bg-white hover:border-slate-300' + today;
    if (s === 'falta')
      return 'border border-slate-200 border-l-4 border-l-slate-300 bg-slate-50 hover:border-slate-300' + today;
    return 'border border-slate-200 border-l-4 border-l-slate-200 bg-white hover:border-slate-300' + today;
  }

  statusTint(status: string): string {
    const map: Record<string, string> = {
      puntual: 'text-emerald-500',
      retraso: 'text-rose-500',
      falta: 'text-slate-300',
    };
    return map[status] ?? 'text-slate-300';
  }

  statusText(status: string): string {
    const map: Record<string, string> = {
      puntual: 'text-emerald-600',
      retraso: 'text-rose-600',
      falta: 'text-slate-400',
    };
    return map[status] ?? 'text-slate-400';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      puntual: 'Puntual',
      retraso: 'Retraso',
      falta: 'Falta',
    };
    return map[status] ?? '';
  }

  showTooltip(event: MouseEvent, day: any): void {
    if (!day?.entries?.length) {
      this.tooltip = null;
      return;
    }
    this.tooltip = { x: event.clientX, y: event.clientY, day };
    this.moveTooltip(event);
  }

  moveTooltip(event: MouseEvent): void {
    if (!this.tooltip) return;
    const pad = 14;
    this.tooltip = {
      ...this.tooltip,
      x: Math.max(8, Math.min(event.clientX + pad, window.innerWidth - 300)),
      y: Math.max(8, Math.min(event.clientY + pad, window.innerHeight - 190)),
    };
  }

  hideTooltip(): void {
    this.tooltip = null;
  }

  formatTooltipDate(day: any): string {
    const d = new Date(`${day.date}T00:00:00`);
    const dayName = day.day ?? DIAS[(d.getDay() + 6) % 7];
    return `${dayName} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  dayNum(date: string): number {
    return Number(date.slice(8));
  }

  monthNum(date: string): number {
    return Number(date.slice(5, 7));
  }

  isToday(date: string): boolean {
    return date === this.toISODate(new Date());
  }

  private monthYear(date: Date): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    return `${meses[date.getMonth()]} ${date.getFullYear()}`;
  }

  private setCalendarRange(date: Date): void {
    if (this.calendarView === 'month') {
      this.detailFrom = this.toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
      this.detailTo = this.toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    } else {
      const monday = this.mondayOf(date);
      this.detailFrom = this.toISODate(monday);
      this.detailTo = this.toISODate(this.addDays(monday, 6));
    }
  }

  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private mondayOf(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset);
    return d;
  }
}
