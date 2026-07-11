import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';

interface Installment {
  month: string;
  amount: number;
}

@Component({
  selector: 'app-payment-management',
  imports: [ButtonComponent, BaseModalComponent, BaseInputComponent],
  templateUrl: './payment-management.component.html',
  styleUrl: './payment-management.component.css',
})
export class PaymentManagementComponent {
  registerModalOpen: boolean = false;
  openRegisterModal() {
    this.registerModalOpen = true;
  }
  closeRegisterModal(): void {
    this.registerModalOpen = false;
  }

  
  saveConfiguration(): void {
    console.log('Guardar configuración');

    this.registerModalOpen = false;
  }
  preview = {
    management: '2026',

    career: 'Ingeniería en Sistemas',

    period: 'Primer Semestre',

    concept: 'Mensualidad',

    amount: 250,

    installments: 5,

    total: 1250,
  };

  installments: Installment[] = [
    { month: 'Febrero', amount: 250 },

    { month: 'Marzo', amount: 250 },

    { month: 'Abril', amount: 250 },

    { month: 'Mayo', amount: 250 },

    { month: 'Junio', amount: 250 },
  ];
  
}
