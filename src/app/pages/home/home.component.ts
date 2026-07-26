import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { PayService } from '../../service/pay.service';

interface MonthlyIncome {
  month: string;
  total: number;
}

interface SubjectFailure {
  name: string;
  failure_rate: number;
  total_students: number;
  failed_students: number;
}

interface RecentPay {
  student: string;
  amount: number;
  time: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, ChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  // KPI data
  totalStudents = 0;
  totalDocentes = 0;
  monthlyIncome = 0;
  totalCareers = 0;
  totalSubjects = 0;
  totalParallels = 0;

  // Chart data
  chartSeries: ApexCharts.ApexOptions['series'] = [];
  chartCategories: string[] = [];

  // Mensualidades (pays)
  paysToday = 0;
  paysThisWeek = 0;
  paysThisMonth = 0;

  // Materias con reprobación
  subjectsFailure: SubjectFailure[] = [];

  // Actividad reciente de pagos
  recentPayActivity: RecentPay[] = [];

  // Loading state
  loading = true;

  constructor(private payService: PayService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    this.payService.getDashboardData().subscribe({
      next: (res) => {
        // KPIs generales
        this.totalStudents = res.kpis.total_students;
        this.totalDocentes = res.kpis.total_docentes;
        this.totalCareers = res.kpis.total_careers;
        this.totalSubjects = res.kpis.total_subjects;
        this.totalParallels = res.kpis.total_parallels;

        // Chart
        this.chartCategories = res.monthly_income.map(
          (m: MonthlyIncome) => m.month,
        );
        this.chartSeries = [
          {
            name: 'Ingresos',
            data: res.monthly_income.map((m: MonthlyIncome) => m.total),
          },
        ];

        // Monthly income for KPI
        const lastMonth =
          res.monthly_income[res.monthly_income.length - 1];
        this.monthlyIncome = lastMonth?.total ?? 0;

        // Mensualidades pays
        this.paysToday = res.mensualidades_pays.today;
        this.paysThisWeek = res.mensualidades_pays.this_week;
        this.paysThisMonth = res.mensualidades_pays.this_month;

        // Subjects failure
        this.subjectsFailure = res.subjects_failure;

        // Recent activity
        this.recentPayActivity = res.recent_pay_activity;

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.log(err)
      },
    });
  }
}