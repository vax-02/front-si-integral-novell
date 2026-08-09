import { Router, RouterModule, Routes } from '@angular/router';
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../core/services/auth.service';
import { Roles } from '../../core/constants/roles.constants';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly router = inject(Router);
  user!: User;
  Roles = Roles;
  collapsed = false;
  openAcademico = true;
  openControl = false;
  openFinanzas = false;
  openAdmin = false;
  openSecretaria = false;
  openConfig = false;

  isMobile = false;

  constructor(private auth: AuthService) {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.user = user;
       
      }
    });
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;

    // Si cambia de móvil a desktop, restaurar estado
    if (wasMobile && !this.isMobile) {
      this.collapsed = false;
    }

    // Si es móvil, siempre colapsado
    if (this.isMobile) {
      this.collapsed = true;
    }
  }
  toggleSidebar() {
    if (this.isMobile) {
      this.collapsed = !this.collapsed;
    } else {
      this.collapsed = !this.collapsed;
    }
  }
  toggleAcademico() {
    this.toggleGroup('openAcademico');
  }
  toggleControl() {
    this.toggleGroup('openControl');
  }
  toggleFinanzas() {
    this.toggleGroup('openFinanzas');
  }
  toggleAdmin() {
    this.toggleGroup('openAdmin');
  }
  infoProfile() {}
  toggleSecretaria() {
    this.toggleGroup('openSecretaria');
  }
  toggleConfig() {
    this.toggleGroup('openConfig');
  }
  private toggleGroup(key: 'openAcademico' | 'openControl' | 'openFinanzas' | 'openAdmin' | 'openSecretaria' | 'openConfig') {
    const opening = !this[key];
    this.openAcademico = false;
    this.openControl = false;
    this.openFinanzas = false;
    this.openAdmin = false;
    this.openSecretaria = false;
    this.openConfig = false;
    this[key] = opening;
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  getInitials(nombre: string = ''): string {
    if (!nombre) return '';

    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
  getColor(nombre: string = ''): string {
    const colors = [
      'bg-blue-600',
      'bg-red-500',
      'bg-green-600',
      'bg-purple-600',
    ];
    const index = nombre.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
