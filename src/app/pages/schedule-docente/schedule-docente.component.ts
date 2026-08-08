import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DocenteService } from '../../service/docente.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import {
  AttendanceService,
  DocenteSchedule,
} from '../../service/attendance.service';

export const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

@Component({
  selector: 'app-schedule-docente',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
  ],
  templateUrl: './schedule-docente.component.html',
  styleUrl: './schedule-docente.component.css',
})
export class ScheduleDocenteComponent {
  private searchTimeout: any;
  docenteSeleccionado: any = null;
  modalViewDocente = false;
  modalConfig = false;

  search = '';
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  loading = false;
  savingConfig = false;

  totalDocentes = 0;
  activeCount = 0;
  inactiveCount = 0;
  docentes: any[] = [];

  // ── Configuración por docente ─────────────────────────────────────────────
  pin = '';
  tolerance = 0;
  schedules: any[] = [];
  loadingSchedules = false;

  newScheduleDay = 'Lunes';
  newScheduleEntry = '08:00';
  savingSchedule = false;

  // ── Importación ───────────────────────────────────────────────────────────
  importing = false;

  // ── Detalle de ingreso por docente ────────────────────────────────────────
  detailFrom = '';
  detailTo = '';
  detailLoading = false;
  detailResult: any = null;
  readonly DIAS = DIAS;

  // ── Calendario de ingreso ────────────────────────────────────────────────
  calendarView: 'month' | 'week' = 'month';
  cursorDate = new Date();
  detailByDate = new Map<string, any>();
  readonly DIAS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(
    private docenteService: DocenteService,
    private attendanceService: AttendanceService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadDocentes();
  }

  loadDocentes(): void {
    this.loading = true;
    this.docenteService
      .getDocentes(this.currentPage, this.perPage, this.search)
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.totalDocentes = data.total ?? 0;
          this.activeCount = data.activos ?? 0;
          this.inactiveCount = data.inactivos ?? 0;
          this.currentPage = data.docentes.current_page;
          this.lastPage = data.docentes.last_page;
          this.docentes = data.docentes.data;
        },
        error: () => {
          this.loading = false;
          this.toast.error('Error al cargar docentes');
        },
      });
  }

  openViewDocente(docente: any): void {
    this.docenteSeleccionado = docente;
    this.detailResult = null;
    this.calendarView = 'month';
    this.cursorDate = new Date();
    this.setCalendarRange(this.cursorDate);
    this.modalViewDocente = true;
    this.loadDetail();
  }

  loadDetail(): void {
    if (!this.docenteSeleccionado) return;
    if (!this.detailFrom || !this.detailTo) {
      this.toast.error('Seleccione el rango de fechas');
      return;
    }
    if (this.detailFrom > this.detailTo) {
      this.toast.error('La fecha inicial debe ser anterior a la final');
      return;
    }
    this.detailLoading = true;
    this.attendanceService
      .validateAttendance(
        this.detailFrom,
        this.detailTo,
        this.docenteSeleccionado.id,
      )
      .subscribe({
        next: (res) => {
          this.detailLoading = false;
          this.detailResult = res.docentes?.[0] ?? null;
          this.detailByDate = new Map<string, any>();
          for (const row of this.detailResult?.days ?? []) {
            this.detailByDate.set(row.date, row);
          }
        },
        error: () => {
          this.detailLoading = false;
          this.toast.error('Error al cargar los registros de ingreso');
        },
      });
  }

  // ── Calendario de ingreso ────────────────────────────────────────────────
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

  // ── Tooltip de hover sobre las celdas del calendario ──────────────────────
  tooltip: { x: number; y: number; day: any } | null = null;

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

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadDocentes();
    }, 400);
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadDocentes();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDocentes();
    }
  }

  get from(): number {
    return (this.currentPage - 1) * this.perPage + 1;
  }
  get to(): number {
    return Math.min(this.currentPage * this.perPage, this.totalDocentes);
  }

  // ── Configuración (PIN / tolerancia / horarios) ───────────────────────────
  openConfig(docente: any): void {
    this.docenteSeleccionado = docente;
    this.pin = docente.biometric_pin ?? '';
    this.tolerance = docente.tolerance_minutes ?? 0;
    this.schedules = [];
    this.modalConfig = true;
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loadingSchedules = true;
    this.attendanceService.getSchedules(this.docenteSeleccionado.id).subscribe({
      next: (res) => {
        this.loadingSchedules = false;
        this.schedules = res.schedules ?? [];
      },
      error: () => {
        this.loadingSchedules = false;
        this.toast.error('Error al cargar horarios');
      },
    });
  }

  saveConfig(): void {
    const val = Number(this.tolerance);
    if (Number.isNaN(val) || val < 0 || val > 60) {
      this.toast.error('La tolerancia debe estar entre 0 y 60 minutos');
      return;
    }
    this.savingConfig = true;
    this.attendanceService
      .updateConfig(this.docenteSeleccionado.id, this.pin.trim(), val)
      .subscribe({
        next: () => {
          this.savingConfig = false;
          this.docenteSeleccionado.biometric_pin = this.pin.trim() || null;
          this.docenteSeleccionado.tolerance_minutes = val;
          this.toast.success('Configuración de asistencia guardada');
          this.syncDocenteInList();
        },
        error: (e) => {
          this.savingConfig = false;
          const msg =
            e?.error?.errors?.pin?.[0] ??
            e?.error?.message ??
            'Error al guardar la configuración';
          this.toast.error(msg);
        },
      });
  }

  addSchedule(): void {
    const schedule: DocenteSchedule = {
      day: this.newScheduleDay,
      entry_time: this.newScheduleEntry,
    };
    this.savingSchedule = true;
    this.attendanceService
      .storeSchedule(this.docenteSeleccionado.id, schedule)
      .subscribe({
        next: () => {
          this.savingSchedule = false;
          this.toast.success('Horario agregado');
          this.newScheduleDay = 'Lunes';
          this.newScheduleEntry = '08:00';
          this.loadSchedules();
        },
        error: (e) => {
          this.savingSchedule = false;
          const msg = e?.error?.message ?? 'Error al agregar el horario';
          this.toast.error(msg);
        },
      });
  }

  removeSchedule(scheduleId: number): void {
    this.attendanceService.deleteSchedule(scheduleId).subscribe({
      next: () => {
        this.toast.success('Horario eliminado');
        this.loadSchedules();
      },
      error: () => {
        this.toast.error('Error al eliminar el horario');
      },
    });
  }

  // ── Importación de asistencia ─────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importing = true;
    this.attendanceService.importAttendance(file).subscribe({
      next: (res) => {
        this.importing = false;
        input.value = '';
        const s = res.summary ?? {};
        const extra =
          s.unmapped_pins?.length
            ? ` · ${s.unmapped_pins.length} PIN sin docente`
            : '';
        this.toast.success(
          `Importación completada: ${s.inserted ?? 0} registros nuevos, ${s.skipped ?? 0} duplicados, ${s.invalid ?? 0} inválidos${extra}`,
        );
      },
      error: (e) => {
        this.importing = false;
        input.value = '';
        const msg = e?.error?.message ?? 'Error al importar asistencia';
        this.toast.error(msg);
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      puntual: 'Puntual',
      retraso: 'Retraso',
      falta: 'Falta',
    };
    return map[status] ?? status;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private toISODate(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      puntual: 'bg-emerald-100 text-emerald-700',
      retraso: 'bg-rose-100 text-rose-700',
      falta: 'bg-slate-100 text-slate-600',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }

  private syncDocenteInList(): void {
    const idx = this.docentes.findIndex(
      (d) => d.id === this.docenteSeleccionado?.id,
    );
    if (idx !== -1) {
      this.docentes[idx] = {
        ...this.docentes[idx],
        biometric_pin: this.docenteSeleccionado.biometric_pin,
        tolerance_minutes: this.docenteSeleccionado.tolerance_minutes,
      };
    }
  }
}
