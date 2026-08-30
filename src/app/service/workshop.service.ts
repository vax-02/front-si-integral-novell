import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkshopService {
  private apiUrl = API_ENDPOINTS;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getWorkshops(): Observable<any> {
    return this.http.get(this.apiUrl.workshops.index, { headers: this.getHeaders() });
  }

  getWorkshopsSimple(): Observable<any> {
    return this.http.get(this.apiUrl.workshops.simple, { headers: this.getHeaders() });
  }

  getWorkshop(id: number): Observable<any> {
    return this.http.get(this.apiUrl.workshops.show(id), { headers: this.getHeaders() });
  }

  createWorkshop(data: any): Observable<any> {
    return this.http.post(this.apiUrl.workshops.index, data, { headers: this.getHeaders() });
  }

  updateWorkshop(id: number, data: any): Observable<any> {
    return this.http.put(this.apiUrl.workshops.show(id), data, { headers: this.getHeaders() });
  }

  deleteWorkshop(id: number): Observable<any> {
    return this.http.delete(this.apiUrl.workshops.show(id), { headers: this.getHeaders() });
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl.workshops.show(id)}/toggle-status`, {}, { headers: this.getHeaders() });
  }

  getModules(workshopId: number): Observable<any> {
    return this.http.get(this.apiUrl.workshops.modules(workshopId), { headers: this.getHeaders() });
  }

  createModule(workshopId: number, data: any): Observable<any> {
    return this.http.post(this.apiUrl.workshops.modules(workshopId), data, { headers: this.getHeaders() });
  }

  updateModule(workshopId: number, moduleId: number, data: any): Observable<any> {
    return this.http.put(this.apiUrl.workshops.module(workshopId, moduleId), data, { headers: this.getHeaders() });
  }

  deleteModule(workshopId: number, moduleId: number): Observable<any> {
    return this.http.delete(this.apiUrl.workshops.module(workshopId, moduleId), { headers: this.getHeaders() });
  }

  getEditions(workshopId: number): Observable<any> {
    return this.http.get(this.apiUrl.workshops.editions(workshopId), { headers: this.getHeaders() });
  }

  createEdition(workshopId: number, data: any): Observable<any> {
    return this.http.post(this.apiUrl.workshops.editions(workshopId), data, { headers: this.getHeaders() });
  }

  updateEdition(id: number, data: any): Observable<any> {
    return this.http.put(this.apiUrl.workshops.editionShow(id), data, { headers: this.getHeaders() });
  }

  deleteEdition(id: number): Observable<any> {
    return this.http.delete(this.apiUrl.workshops.editionShow(id), { headers: this.getHeaders() });
  }

  toggleEditionStatus(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl.workshops.editionShow(id)}/toggle-status`, {}, { headers: this.getHeaders() });
  }

  getEditionConcepts(id: number): Observable<any> {
    return this.http.get(this.apiUrl.workshops.editionConcepts(id), { headers: this.getHeaders() });
  }

  createEditionConcept(id: number, data: any): Observable<any> {
    return this.http.post(this.apiUrl.workshops.editionConcepts(id), data, { headers: this.getHeaders() });
  }

  deleteConcept(id: number): Observable<any> {
    return this.http.delete(this.apiUrl.workshops.conceptDelete(id), { headers: this.getHeaders() });
  }

  getEditionsSimple(): Observable<any> {
    return this.http.get(this.apiUrl.workshops.editionsSimple, { headers: this.getHeaders() });
  }

  getEnrollments(params?: any): Observable<any> {
    let url = this.apiUrl.workshops.enrollments;
    if (params) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  createEnrollment(data: any): Observable<any> {
    return this.http.post(this.apiUrl.workshops.enrollments, data, { headers: this.getHeaders() });
  }

  updateEnrollment(id: number, data: any): Observable<any> {
    return this.http.put(this.apiUrl.workshops.enrollmentUpdate(id), data, { headers: this.getHeaders() });
  }

  deleteEnrollment(id: number): Observable<any> {
    return this.http.delete(this.apiUrl.workshops.enrollmentUpdate(id), { headers: this.getHeaders() });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
