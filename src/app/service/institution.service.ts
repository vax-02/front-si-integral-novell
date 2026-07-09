import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstitutionService {
  private apiUrl = API_ENDPOINTS;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getInstitution(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl.institution}`, {
      headers: this.getHeaders(),
    });
  }
  updateInstitution(id: number = 1, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl.institution}/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
