import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../base-modal/base-modal.component';

@Component({
  selector: 'app-base-modal-confirm',
  standalone: true,
  imports: [CommonModule, BaseModalComponent],
  templateUrl: './base-modal-confirm.component.html',
})
export class BaseModalConfirmComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Deseas continuar con esta acción?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() loading = false;
  @Input() confirmClass = 'bg-red-600 hover:bg-red-700';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  close(): void {
    this.cancel.emit();
  }

  confirmAction(): void {
    this.confirm.emit();
  }
}
