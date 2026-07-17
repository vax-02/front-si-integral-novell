import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayService {
  private apiUrl = API_ENDPOINTS;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getPays(studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl.pays.index}?student_id=${studentId}`, {
      headers: this.getHeaders(),
    });
  }

  getDataCards(): Observable<any> {
    return this.http.get(`${this.apiUrl.pays.index}/cards`, {
      headers: this.getHeaders(),
    });
  }
  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }}
