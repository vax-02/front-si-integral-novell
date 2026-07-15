import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConceptService {
  private apiUrl = API_ENDPOINTS;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getConcepts(filters: any): Observable<any> {
    return this.http.get(this.apiUrl.concepts.index, {
      params: filters,
      headers: this.getHeaders(),
    });
  }

  getConcept(id: number): Observable<any> {
    return this.http.get(this.apiUrl.concepts.show(id), {
      headers: this.getHeaders(),
    });
  }

  createConcept(data: any): Observable<any> {
    return this.http.post(this.apiUrl.concepts.store, data, {
      headers: this.getHeaders(),
    });
  }

  updateConcept(id: number, data: any): Observable<any> {
    return this.http.put(this.apiUrl.concepts.update(id), data, {
      headers: this.getHeaders(),
    });
  }

  deleteConcept(id: number): Observable<any> {
    return this.http.delete(this.apiUrl.concepts.delete(id), {
      headers: this.getHeaders(),
    });
  }

  // Student Career management
  enrollStudent(data: any): Observable<any> {
    return this.http.post(this.apiUrl.studentCareers.store, data, {
      headers: this.getHeaders(),
    });
  }

  withdrawStudent(studentId: number, careerId: number, data: any): Observable<any> {
    return this.http.post(this.apiUrl.studentCareers.withdraw(studentId, careerId), data, {
      headers: this.getHeaders(),
    });
  }

  reinstateStudent(studentId: number, careerId: number, data: any): Observable<any> {
    return this.http.post(this.apiUrl.studentCareers.reinstate(studentId, careerId), data, {
      headers: this.getHeaders(),
    });
  }

  getStudentCareers(studentId: number): Observable<any> {
    return this.http.get(this.apiUrl.studentCareers.getByStudent(studentId), {
      headers: this.getHeaders(),
    });
  }

  getActiveStudentsByCareer(careerId: number, gestion: number): Observable<any> {
    return this.http.get(this.apiUrl.studentCareers.getActiveByCareer(careerId, gestion), {
      headers: this.getHeaders(),
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}