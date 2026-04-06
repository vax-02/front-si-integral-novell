import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [ButtonComponent, BaseModalComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
})
export class PaymentsComponent {
  registerModalOpen = false;
  detailModalOpen = false;
  openRegisterModal() {
    this.registerModalOpen = true;
  }
  openDetailModal() {
    this.detailModalOpen = true;
  }

  savePayment() {
    // Lógica para guardar el pago
    console.log('Pago guardado');
    this.registerModalOpen = false;
  }
}
