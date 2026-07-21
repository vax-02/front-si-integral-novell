import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getSubjectsByCareer(careerId: number, level?: number, search?: string): Observable<any> {
    let url = API_ENDPOINTS.schedules.byCareer(careerId);
    const params: string[] = [];
    if (level) params.push(`level=${level}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getByParallel(parallelId: number): Observable<any> {
    return this.http.get(
      API_ENDPOINTS.schedules.byParallel(parallelId),
      { headers: this.getHeaders() },
    );
  }

  saveSchedules(parallelId: number, schedules: any[]): Observable<any> {
    return this.http.post(
      API_ENDPOINTS.schedules.save,
      { parallel_id: parallelId, schedules },
      { headers: this.getHeaders() },
    );
  }

  createSchedule(data: any): Observable<any> {
    return this.http.post(
      API_ENDPOINTS.schedules.store,
      data,
      { headers: this.getHeaders() },
    );
  }

  updateSchedule(id: number, data: any): Observable<any> {
    return this.http.put(
      API_ENDPOINTS.schedules.update(id),
      data,
      { headers: this.getHeaders() },
    );
  }

  deleteSchedule(id: number): Observable<any> {
    return this.http.delete(
      API_ENDPOINTS.schedules.delete(id),
      { headers: this.getHeaders() },
    );
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}