import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';

const API_BASE = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getSubjectsByCareer(careerId: number): Observable<any> {
    return this.http.get(`${API_BASE}/subjects/${careerId}/by-career`, {
      headers: this.getHeaders(),
    });
  }

  getByParallel(parallelId: number): Observable<any> {
    return this.http.get(
      `${API_BASE}/schedules/parallel/${parallelId}`,
      { headers: this.getHeaders() },
    );
  }

  saveSchedules(parallelId: number, schedules: any[]): Observable<any> {
    return this.http.post(
      `${API_BASE}/schedules/save`,
      { parallel_id: parallelId, schedules },
      { headers: this.getHeaders() },
    );
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
