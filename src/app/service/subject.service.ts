import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private apiUrl = API_ENDPOINTS;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getSubjects(page = 1, perPage = 10, filters: any = {}): Observable<any> {
    let params: any = { page, per_page: perPage };

    if (filters.name) {
      params.name = filters.name;
    }

    if (filters.sigla) {
      params.sigla = filters.sigla;
    }

    if (filters.career) {
      params.career = filters.career;
    }

    return this.http.get(`${this.apiUrl.carrers.index.replace('/careers', '')}/subjects`, {
      headers: this.getHeaders(),
      params,
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
