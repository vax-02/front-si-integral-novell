import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from "../../shared/button/button.component";
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';

@Component({
  selector: 'app-programs',
  imports: [CommonModule, ButtonComponent, BaseModalComponent],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.css'
})
export class ProgramsComponent {
  tab: string = 'materias';
  modalViewProgram : boolean = false;

  openViewProgram (){
    this.modalViewProgram = true;
  }

  
}
