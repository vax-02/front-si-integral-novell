import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayService } from '../../service/pay.service';

interface PaymentGroup {
  career_id: number;
  career_name: string;
  payments: any[];
  total: number;
}

@Component({
  selector: 'app-student-payments',
  imports: [CommonModule],
  templateUrl: './student-payments.component.html',
  styleUrl: './student-payments.component.css',
})
export class StudentPaymentsComponent {
  readonly groups = signal<PaymentGroup[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalPaid = signal(0);
  readonly totalPayments = signal(0);

  constructor(private payService: PayService) {}

  ngOnInit() {
    this.loadPays();
  }

  loadPays() {
    this.loading.set(true);
    this.error.set(null);

    this.payService.getMyPays().subscribe({
      next: (resp) => {
        this.loading.set(false);
        const groups: PaymentGroup[] = resp.pays || [];
        this.groups.set(groups);

        let totalPaid = 0;
        let totalPayments = 0;
        for (const group of groups) {
          for (const p of group.payments) {
            if (p.status == 1) {
              totalPaid += parseFloat(p.amount) - parseFloat(p.discount || 0);
              totalPayments++;
            }
          }
        }
        this.totalPaid.set(totalPaid);
        this.totalPayments.set(totalPayments);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar el historial de pagos.');
      },
    });
  }
}
