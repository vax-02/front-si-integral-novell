import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParallelService {
  private apiUrl = API_ENDPOINTS;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}
  getParallelsByCourse(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl.parallels.index}?courseId=${courseId}`, {
      headers: this.getHeaders(),
    });
  }

  createParallel(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl.parallels.index}`, data, {
      headers: this.getHeaders(),
    });
  }

  updateParallel(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl.parallels.index}/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteParallel(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl.parallels.index}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
