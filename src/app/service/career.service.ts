import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
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
  
  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
