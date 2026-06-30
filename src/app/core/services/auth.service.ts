import { Injectable } from '@angular/core';

export interface User {
  "id": number,
  "role_id": number,
  "role": string,
  "ci": string | number,
  "name": string,
  "first_lastname":string,
  "second_lastname":string | null,
  "email":string,
  "cellphone": string | number,
  "status": number
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  get token(): string | null {
    return localStorage.getItem('token');
  }

  get user(): User | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  updateUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
  saveSession(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.user?.role ?? '');
  }
  constructor() {}
}
