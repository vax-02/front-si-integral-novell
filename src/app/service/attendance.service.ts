import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';

export interface DocenteSchedule {
  id?: number;
  day: string;
  entry_time: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  importAttendance(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(API_ENDPOINTS.attendance.import, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` }),
    });
  }

  validateAttendance(from: string, to: string, docenteId?: number): Observable<any> {
    const params: any = { from, to };
    if (docenteId) params.docente_id = docenteId;
    return this.http.get(API_ENDPOINTS.attendance.validate, {
      params,
      headers: this.getHeaders(),
    });
  }

  setBiometricPin(docenteId: number, pin: string): Observable<any> {
    return this.http.put(
      API_ENDPOINTS.attendance.biometricPin(docenteId),
      { pin },
      { headers: this.getHeaders() },
    );
  }

  setTolerance(docenteId: number, minutes: number): Observable<any> {
    return this.http.put(
      API_ENDPOINTS.attendance.tolerance(docenteId),
      { minutes },
      { headers: this.getHeaders() },
    );
  }

  getSchedules(docenteId: number): Observable<any> {
    return this.http.get(
      API_ENDPOINTS.attendance.schedules(docenteId),
      { headers: this.getHeaders() },
    );
  }

  storeSchedule(docenteId: number, schedule: DocenteSchedule): Observable<any> {
    return this.http.post(
      API_ENDPOINTS.attendance.schedules(docenteId),
      schedule,
      { headers: this.getHeaders() },
    );
  }

  deleteSchedule(scheduleId: number): Observable<any> {
    return this.http.delete(
      API_ENDPOINTS.attendance.deleteSchedule(scheduleId),
      { headers: this.getHeaders() },
    );
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
