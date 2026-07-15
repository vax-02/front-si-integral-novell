import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CareerService {
  private apiUrl = API_ENDPOINTS;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getCareers(): Observable<any> {
    return this.http.get(this.apiUrl.carrers.index, {
      headers: this.getHeaders(),
    });
  }

  getCareersForSelect(): Observable<any> {
    return this.http.get(this.apiUrl.carrers.simple, {
      headers: this.getHeaders(),
    });
  }
  getCareerById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl.carrers.index}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  downloadTemplate(): Observable<Blob> {
    return this.http.get(this.apiUrl.carrers.downloadTemplate, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  importPreview(formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl.carrers.index}/import-preview`,
      formData,
      {
        headers: this.getHeaders(),
      },
    );
  }

  importConfirm(formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl.carrers.index}/import-confirm`,
      formData,
      {
        headers: this.getHeaders(),
      },
    );
  }

  deleteCareer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl.carrers.index}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl.carrers.index}/${id}/toggle-status`,
      {},
      { headers: this.getHeaders() },
    );
  }

  createSubject(careerId: number, payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl.carrers.index}/${careerId}/subjects`,
      payload,
      {
        headers: this.getHeaders(),
      },
    );
  }

  updateSubject(
    careerId: number,
    subjectId: number,
    payload: any,
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl.carrers.index}/${careerId}/subjects/${subjectId}`,
      payload,
      {
        headers: this.getHeaders(),
      },
    );
  }

  deleteSubject(careerId: number, subjectId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl.carrers.index}/${careerId}/subjects/${subjectId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
