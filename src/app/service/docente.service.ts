import { Injectable } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private apiUrl = API_ENDPOINTS;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getDocentes(page = 1, perPage = 10, search = ''): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl.docentes}?page=${page}&per_page=${perPage}&search=${search}`,
      { headers: this.getHeaders() },
    );
  }

  createDocente(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl.docentes}`, data, {
      headers: this.getHeaders(),
    });
  }

  updateDocente(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl.docentes}/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl.docentes}/${id}/toggle-status`, {}, {
      headers: this.getHeaders(),
    });
  }

  assignSubject(docenteId: number, subjectId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl.docentes}/${docenteId}/subjects`,
      { subject_id: subjectId },
      { headers: this.getHeaders() },
    );
  }

  removeSubject(docenteId: number, subjectId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl.docentes}/${docenteId}/subjects/${subjectId}`,
      { headers: this.getHeaders() },
    );
  }

  /** Obtener las materias asignadas al docente logueado */
  getMySubjects(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl.docenteMySubjects,
      { headers: this.getHeaders() },
    );
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
