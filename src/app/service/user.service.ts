import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
@Injectable({
  providedIn: 'root'
})
export class UserService {
 private apiUrl = API_ENDPOINTS;

  constructor(private http: HttpClient) { }
   login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl.auth.login, {
      email,
      password
    });
  }
}
