import { Router, RouterModule, Routes } from '@angular/router';
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly router = inject(Router);

  role = 'admin';
  user = JSON.parse(localStorage.getItem('user') || '{}');
  collapsed = false;
  openAcademico = true;
  openControl = false;
  openFinanzas = false;
  openAdmin = false;
  openConfig = false;

  isMobile = false;

  constructor() {}

  ngOnInit() {
    this.checkScreenSize();
  }

  ngOnDestroy() {}

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
    this.openAcademico = !this.openAcademico;
  }
  toggleControl() {
    this.openControl = !this.openControl;
  }
  toggleFinanzas() {
    this.openFinanzas = !this.openFinanzas;
  }
  toggleAdmin() {
    this.openAdmin = !this.openAdmin;
  }
  infoProfile() {}
  toggleConfig() {
    this.openConfig = !this.openConfig;
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  getInitials(nombre: string): string {
    if (!nombre) return '';

    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
  getColor(nombre: string): string {
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
