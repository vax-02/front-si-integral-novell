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
  modalValidate = false;
  modalValidateResult = false;

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

  // ── Validación ────────────────────────────────────────────────────────────
  validating = false;
  fromDate = '';
  toDate = '';
  validationResult: any = null;
  readonly DIAS = DIAS;

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
    this.modalViewDocente = true;
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

  savePin(): void {
    if (this.pin === '') {
      this.toast.error('Ingrese el PIN biométrico');
      return;
    }
    this.savingConfig = true;
    this.attendanceService
      .setBiometricPin(this.docenteSeleccionado.id, this.pin.trim())
      .subscribe({
        next: () => {
          this.savingConfig = false;
          this.docenteSeleccionado.biometric_pin = this.pin.trim();
          this.toast.success('PIN biométrico guardado');
          this.syncDocenteInList();
        },
        error: (e) => {
          this.savingConfig = false;
          const msg = e?.error?.message ?? 'Error al guardar el PIN';
          this.toast.error(msg);
        },
      });
  }

  saveTolerance(): void {
    const val = Number(this.tolerance);
    if (Number.isNaN(val) || val < 0 || val > 60) {
      this.toast.error('La tolerancia debe estar entre 0 y 60 minutos');
      return;
    }
    this.savingConfig = true;
    this.attendanceService
      .setTolerance(this.docenteSeleccionado.id, val)
      .subscribe({
        next: () => {
          this.savingConfig = false;
          this.docenteSeleccionado.tolerance_minutes = val;
          this.toast.success('Tolerancia guardada');
          this.syncDocenteInList();
        },
        error: (e) => {
          this.savingConfig = false;
          const msg = e?.error?.message ?? 'Error al guardar la tolerancia';
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

  // ── Validación de puntualidad ─────────────────────────────────────────────
  openValidate(): void {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    this.fromDate = this.toISODate(first);
    this.toDate = this.toISODate(now);
    this.validationResult = null;
    this.modalValidate = true;
  }

  runValidation(): void {
    if (!this.fromDate || !this.toDate) {
      this.toast.error('Seleccione el rango de fechas');
      return;
    }
    if (this.fromDate > this.toDate) {
      this.toast.error('La fecha inicial debe ser anterior a la final');
      return;
    }
    this.validating = true;
    this.attendanceService.validateAttendance(this.fromDate, this.toDate).subscribe({
      next: (res) => {
        this.validating = false;
        this.validationResult = res;
        this.buildSummary();
        this.modalValidate = false;
        this.modalValidateResult = true;
      },
      error: (e) => {
        this.validating = false;
        const msg = e?.error?.message ?? 'Error al validar la asistencia';
        this.toast.error(msg);
      },
    });
  }

  // ── Resumen calculado desde la respuesta del backend ──────────────────────
  summaryDocentes = 0;
  summaryDays = 0;
  summaryLate = 0;
  summaryMinutes = 0;

  private buildSummary(): void {
    const list: any[] = this.validationResult?.docentes ?? [];
    this.summaryDocentes = list.length;
    this.summaryDays = list.reduce(
      (acc: number, d: any) => acc + (d.totals?.total_days ?? 0),
      0,
    );
    this.summaryLate = list.reduce(
      (acc: number, d: any) => acc + (d.totals?.late_count ?? 0),
      0,
    );
    this.summaryMinutes = list.reduce(
      (acc: number, d: any) => acc + (d.totals?.total_minutes_late ?? 0),
      0,
    );
  }

  docentePercent(d: any): number {
    const total = d.totals?.total_days ?? 0;
    if (!total) return 0;
    const late = d.totals?.late_count ?? 0;
    return Math.round(((total - late) / total) * 100);
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
