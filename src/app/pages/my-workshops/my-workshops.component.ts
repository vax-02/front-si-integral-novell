import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayService } from '../../service/pay.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-my-workshops',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-workshops.component.html',
  styleUrl: './my-workshops.component.css',
})
export class MyWorkshopsComponent implements OnInit {
  enrollments: any[] = [];
  loading = false;
  expandedId: number | null = null;

  constructor(
    private payService: PayService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadEnrollments();
  }

  loadEnrollments() {
    this.loading = true;
    this.payService.getMyWorkshops().subscribe({
      next: (res) => {
        this.enrollments = res.enrollments || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar inscripciones');
      },
    });
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  isExpanded(id: number): boolean {
    return this.expandedId === id;
  }
}
