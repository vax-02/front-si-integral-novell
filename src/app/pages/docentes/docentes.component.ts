import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-docentes',
  imports: [ButtonComponent, BaseModalComponent, BaseInputComponent,FormsModule, CommonModule],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.css',
})
export class DocentesComponent {
  modalAddDocente: boolean = false;
  modalViewDocente: boolean = false;
  modalOptionDocente: boolean = false;
  especialidades: string[] = [];
  especialidadInput: string = '';
tabDoc = 'asignar'
estado = ''
  addEspecialidad() {
    const value = this.especialidadInput.trim();

    if (value && !this.especialidades.includes(value)) {
      this.especialidades.push(value);
    }

    this.especialidadInput = '';
  }

  removeEspecialidad(index: number) {
    this.especialidades.splice(index, 1);
  }
  openAddDocente() {
    this.modalAddDocente = true;
  }
  openViewDocente() {
    this.modalViewDocente = true;
  }
  openOptionDocente(){
    this.modalOptionDocente = true;
  }
  closeAddDocente() {
    this.modalAddDocente = false;
  }
  saveDocente() {}
}
