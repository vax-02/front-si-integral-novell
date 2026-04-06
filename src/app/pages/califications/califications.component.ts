import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
@Component({
  selector: 'app-califications',
  imports: [FormsModule,CommonModule, ButtonComponent, BaseModalComponent],
  templateUrl: './califications.component.html',
  styleUrl: './califications.component.css',
})
export class CalificationsComponent {
  modalNotas: boolean = false;
  campos: any[] = [];
  estudiantes: any[] = [
    { nombre: 'Juan Pérez', notas: [] },
    { nombre: 'María López', notas: [] },
  ];

  nuevoCampo = {
    nombre: '',
    peso: 0,
  };
  openNotas(){
    this.modalNotas = true;
  }
  addCampo() {
    if (!this.nuevoCampo.nombre || !this.nuevoCampo.peso) return;

    this.campos.push({ ...this.nuevoCampo });

    // agregar espacio de nota a cada estudiante
    this.estudiantes.forEach((e) => e.notas.push(0));

    this.nuevoCampo = { nombre: '', peso: 0 };
  }

  removeCampo(index: number) {
    this.campos.splice(index, 1);

    this.estudiantes.forEach((e) => e.notas.splice(index, 1));
  }

  totalPeso() {
    return this.campos.reduce((sum, c) => sum + Number(c.peso), 0);
  }

  calcularPromedio(est: any) {
    let total = 0;

    this.campos.forEach((c, i) => {
      total += (est.notas[i] || 0) * (c.peso / 100);
    });

    return total;
  }
}
