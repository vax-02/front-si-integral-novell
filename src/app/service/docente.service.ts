import { Injectable } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private apiUrl = API_ENDPOINTS;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getDocentes(page: number = 1, perPage: number = 10, search: string = ''): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (search?.trim()) {
      params.set('search', search.trim());
    }

    return this.http.get<any>(`${this.apiUrl.docentes}?${params.toString()}`, {
      headers: this.getHeaders(),
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }

}
