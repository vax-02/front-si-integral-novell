import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private token = localStorage.getItem('token')
  private apiUrl = API_ENDPOINTS;

  constructor(private http: HttpClient) {}
  login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl.auth.login, {
      email,
      password,
    });
  }

  updateProfile(userId: string, updatedData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`, // Assuming you have a token for authentication
    });
    return this.http.put(`${this.apiUrl.users}/${userId}/profile`, updatedData, { headers });
  }
}
