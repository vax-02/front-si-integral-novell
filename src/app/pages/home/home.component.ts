import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { PayService } from '../../service/pay.service';

interface Institution {
  name: string;
  address: string;
  cellphone: string;
  email: string;
}

interface Kpis {
  total_students: number;
  assigned_students: number;
  total_docentes: number;
  total_careers: number;
  total_subjects: number;
  total_parallels: number;
  total_capacity: number;
  occupancy_rate: number;
  income_year: number;
  income_month: number;
  income_today: number;
  pays_today: number;
  pays_week: number;
  pays_month: number;
  pays_year: number;
}

interface MonthlyIncome {
  month: string;
  total: number;
}

interface NamedAmount {
  name: string;
  total: number;
}

interface CareerStats {
  name: string;
  active: number;
  withdrawn: number;
}

interface LevelCount {
  course_name: string;
  count: number;
}

interface SubjectFailure {
  name: string;
  sigla: string;
  total_students: number;
  failed_students: number;
  failure_rate: number;
}

interface RecentPay {
  student: string;
  concept: string;
  amount: number;
  time: string;
}

interface BusiestParallel {
  paralelo: string;
  turno: string;
  course_name: string;
  career_name: string;
  students_count: number;
  limit: number;
  occupancy: number;
}

interface DashboardResponse {
  institution: Institution | null;
  gestion: number;
  kpis: Kpis;
  monthly_income: MonthlyIncome[];
  income_by_career: NamedAmount[];
  income_by_concept: NamedAmount[];
  students_by_career: CareerStats[];
  students_by_level: LevelCount[];
  subject_failure: SubjectFailure[];
  recent_pay_activity: RecentPay[];
  busiest_parallels: BusiestParallel[];
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, ChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  institution: Institution | null = null;
  gestion = new Date().getFullYear();

  totalStudents = 0;
  assignedStudents = 0;
  totalDocentes = 0;
  occupancyRate = 0;
  totalCapacity = 0;
  incomeYear = 0;
  incomeMonth = 0;
  incomeToday = 0;
  paysToday = 0;
  paysWeek = 0;
  paysMonth = 0;
  paysYear = 0;

  monthLabels: string[] = [];
  incomeSeries: ApexCharts.ApexOptions['series'] = [];

  careerLabels: string[] = [];
  careerSeries: ApexCharts.ApexOptions['series'] = [];

  subjectFailure: SubjectFailure[] = [];
  recentPayActivity: RecentPay[] = [];
  busiestParallels: BusiestParallel[] = [];

  loading = true;
  error = false;

  constructor(private payService: PayService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = false;

    this.payService.getDashboardData().subscribe({
      next: (res: DashboardResponse) => {
        this.institution = res.institution;
        this.gestion = res.gestion;

        const k = res.kpis;
        this.totalStudents = k.total_students;
        this.assignedStudents = k.assigned_students;
        this.totalDocentes = k.total_docentes;
        this.occupancyRate = k.occupancy_rate;
        this.totalCapacity = k.total_capacity;
        this.incomeYear = k.income_year;
        this.incomeMonth = k.income_month;
        this.incomeToday = k.income_today;
        this.paysToday = k.pays_today;
        this.paysWeek = k.pays_week;
        this.paysMonth = k.pays_month;
        this.paysYear = k.pays_year;

        this.monthLabels = res.monthly_income.map((m) => m.month);
        this.incomeSeries = [
          {
            name: 'Ingresos',
            data: res.monthly_income.map((m) => m.total),
          },
        ];

        this.careerLabels = res.students_by_career.map((c) => c.name.toUpperCase());
        this.careerSeries = [
          {
            name: 'Activos',
            data: res.students_by_career.map((c) => c.active),
          },
          {
            name: 'Inactivos',
            data: res.students_by_career.map((c) => c.withdrawn),
          },
        ];

        this.subjectFailure = res.subject_failure;
        this.recentPayActivity = res.recent_pay_activity;
        this.busiestParallels = res.busiest_parallels;

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  initials(name: string = ''): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
}
