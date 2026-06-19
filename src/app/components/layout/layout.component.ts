import { Router, RouterModule, Routes } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly router = inject(Router);
  
  role = localStorage.getItem('userRole');
  collapsed = false;
  openAcademico = true;
  openControl = false;
  openFinanzas = false;
  openAdmin = false;
  openConfig = false;
  ngOnInit() {
    console.log(this.role);  
  }
  toggleSidebar() {
    this.collapsed = !this.collapsed;
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
  logout(){
    localStorage.clear();
    this.router.navigate(['/login']);    
  }
}
