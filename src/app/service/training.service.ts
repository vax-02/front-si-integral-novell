import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private apiUrl = API_ENDPOINTS;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  createCourse(data:any): Observable<any> {
    return this.http.get(this.apiUrl.degrees, {
      headers: this.getHeaders(),
    });
  }
  getTraining(): Observable<any> {
    return this.http.get(this.apiUrl.degrees, {
      headers: this.getHeaders(),
    });
  }

  updateTraining(id: number, data: any): Observable<any> {
    return this.http.get(this.apiUrl.degrees, {
      headers: this.getHeaders(),
    });
  }
  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
