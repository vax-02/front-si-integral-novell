import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export interface User {
  id: number;
  role_id: number;
  currentRole: any;
  roles: any;
  ci: string | number;
  name: string;
  first_lastname: string;
  second_lastname: string | null;
  email: string;
  cellphone: string | number;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());

  user$ = this.userSubject.asObservable();

  private loadUser(): User | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
  get token(): string | null {
    return localStorage.getItem('token');
  }

  get user(): User | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
  get userId(): number | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data).id : null;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  updateUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }
  updateCurrentRole(role: any): void {
    const user = this.user;
    if (!user) return;
    user.currentRole = role;
    this.updateUser(user);
  }
  saveSession(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    this.userSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  hasRole(role: string): boolean {
    return this.user?.currentRole.id === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.user?.currentRole.id ?? '');
  }
  constructor() {}
}
