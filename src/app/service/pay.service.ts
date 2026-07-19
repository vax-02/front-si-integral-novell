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

  createPay(data: any): Observable<any> {
    return this.http.post(this.apiUrl.pays.store, data, {
      headers: this.getHeaders(),
    });
  }


  anularPay(payId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl.pays.index}/${payId}`, {
      headers: this.getHeaders(),
    });
  }

  getReceipt(payId:number): Observable<Blob> {
    return this.http.get(`${this.apiUrl.pays.index}/${payId}/receipt`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }
  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
      'Accept': 'application/pdf'
    });
  }}
