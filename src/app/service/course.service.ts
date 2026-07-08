import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = API_ENDPOINTS;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getCourses(page = 1, perPage = 10, search = ''): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl.courses.index}?page=${page}&per_page=${perPage}&search=${search}`,
      { headers: this.getHeaders() },
    );
  }

  createCourse(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl.courses.index}`, data, {
      headers: this.getHeaders(),
    });
  }

  updateCourse(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl.courses.index}/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl.courses.index}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
