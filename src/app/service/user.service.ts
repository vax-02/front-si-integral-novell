import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = API_ENDPOINTS;
  private headers: HttpHeaders;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {
    this.headers = new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`, // Assuming you have a token for authentication
    });
  }
  login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl.auth.login, {
      email,
      password,
    });
  }

  getUsers(page: number, perPage: number, search: string) {
    return this.http.get<any>(
      `${this.apiUrl.users}?page=${page}&per_page=${perPage}&search=${search}`,
      { headers: this.headers },
    );
  }
  createUser(data: any) {
    return this.http.post(`${this.apiUrl.users}`, data, { headers: this.headers });
  }
  updateProfile(userId: number, updatedData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl.users}/${userId}/profile`,
      updatedData,
      { headers: this.headers },
    );
  }
  changePassword(data: any): Observable<any> {
    const updatedData = {
      current: data.password,
      new: data.new,
    };
    return this.http.put(`${this.apiUrl.users}/change-password`, updatedData, {
      headers: this.headers,
    });
  }
}
