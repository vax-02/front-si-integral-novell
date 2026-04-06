import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
@Component({
  selector: 'app-students',
  imports: [CommonModule, ButtonComponent, BaseModalComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent {
  tipo : string = ""
  registerModalStudent = false;
  viewModalStudent = false;
  editModalStudent = false;
  optionModalStudent = false;

  saveStudent (){
    this.registerModalStudent = false;
  }
  openModalStudent(){
    this.registerModalStudent = true;
  }
  openModalView(){
    this.viewModalStudent = true;
  }
  openModalEdit(){
    this.editModalStudent = true;
  }
  openModalOption(){
    this.optionModalStudent = true;
  }
  saveBaja() {
  if (this.tipo === 'baja') {
    // estado = INACTIVO
  }

  if (this.tipo === 'congelado') {
    // estado = CONGELADO
  }
}
}
