import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastService, ToastData } from '../services/toast.service';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-base-toast',
  imports: [CommonModule],
  templateUrl: './base-toast.component.html',
  styleUrl: './base-toast.component.css',
})
export class BaseToastComponent implements OnInit {
  show = false;
  message = '';
  type: 'success' | 'error' | 'warning' | 'info' = 'success';

  private timeout: any;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe((toast: ToastData) => {
      this.message = toast.message;
      this.type = toast.type;
      this.show = true;

      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.show = false;
      }, 3000);
    });
  }
}
