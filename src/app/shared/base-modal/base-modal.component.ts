import { Component, Input, Output, EventEmitter,NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-modal.component.html',
  styleUrl: './base-modal.component.css',
})
export class BaseModalComponent {
  @Input() isOpen = false;

  @Input() title = '';
  @Input() subtitle?: string;

  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  @Input() confirmText = 'Guardar';
  @Input() cancelText = 'Cancelar';

  @Input() showFooter = true;
  @Input() showCancel = true;
  @Input() showConfirm = true;
  @Input() loading = false;
  @Input() confirmButtonClass = 'bg-blue-600 hover:bg-blue-700';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get modalSize() {
    switch (this.size) {
      case 'xs':
        return 'max-w-xs';
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-xl';
      case 'lg':
        return 'max-w-3xl';
      case 'xl':
        return 'max-w-5xl';
      default:
        return 'max-w-xl';
    }
  }

  close() {
    this.cancel.emit();
  }
}
