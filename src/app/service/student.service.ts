import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = API_ENDPOINTS;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getStudents(page: number = 1, perPage: number = 10, search: string = ''): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl.students.index}?page=${page}&per_page=${perPage}&search=${search}`,
      { headers: this.getHeaders() },
    );
  }

  getStudent(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl.students.index}/${studentId}`, {
      headers: this.getHeaders(),
    });
  }

  createStudent(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl.students.index, data, {
      headers: this.getHeaders(),
    });
  }

  updateStudent(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl.students.index}/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  addCareer(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl.studentCareers.store, data, {
      headers: this.getHeaders(),
    });
  }

  withdrawCareer(studentId: number, careerId: number): Observable<any> {
    return this.http.post<any>(this.apiUrl.studentCareers.withdraw(studentId, careerId), {}, {
      headers: this.getHeaders(),
    });
  }

  reinstateCareer(studentId: number, careerId: number): Observable<any> {
    return this.http.post<any>(this.apiUrl.studentCareers.reinstate(studentId, careerId), {}, {
      headers: this.getHeaders(),
    });
  }

  updateStudentParallel(studentId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl.students.index}/${studentId}/parallel`, data, {
      headers: this.getHeaders(),
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
