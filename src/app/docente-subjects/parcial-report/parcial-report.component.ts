import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { API_ENDPOINTS } from '../../config/api-endpoints';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-parcial-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parcial-report.component.html',
  styleUrl: './parcial-report.component.css',
})
export class ParcialReportComponent implements OnInit {
  reportData: any = null;
  loading = true;
  error = '';
  exporting = false;

  subjectId: number = 0;
  parallelId: number = 0;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.subjectId = Number(params['subject_id']);
      this.parallelId = Number(params['parallel_id']);

      if (this.subjectId && this.parallelId) {
        this.loadReport();
      } else {
        this.error = 'Faltan parámetros para cargar el informe.';
        this.loading = false;
      }
    });
  }

  loadReport() {
    this.loading = true;
    this.error = '';

    const url = API_ENDPOINTS.grades.parcialReport;
    this.http
      .get<any>(url, {
        headers: this.getHeaders(),
        params: {
          subject_id: this.subjectId,
          parallel_id: this.parallelId,
        },
      })
      .subscribe({
        next: (resp) => {
          this.loading = false;
          this.reportData = resp;
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al cargar el informe de parciales.';
        },
      });
  }

  exportExcel() {
    if (!this.subjectId || !this.parallelId) return;

    this.exporting = true;
    const url = API_ENDPOINTS.grades.exportParcialReport;
    this.http
      .get(url, {
        headers: this.getHeaders(),
        params: {
          subject_id: this.subjectId,
          parallel_id: this.parallelId,
        },
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          this.exporting = false;
          const a = window.document.createElement('a');
          const subjectName = this.reportData?.subject?.sigla || 'materia';
          const parallelName = this.reportData?.parallel?.paralelo || '';
          a.href = window.URL.createObjectURL(blob);
          a.download = `Informe_Parciales_${subjectName}_${parallelName}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(a.href);
          this.toast.success('Informe exportado correctamente');
        },
        error: () => {
          this.exporting = false;
          this.toast.error('Error al exportar el informe');
        },
      });
  }

  printReport() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/home/professor/grades'], {
      queryParams: { subject_id: this.subjectId },
    });
  }

  getParciales(): number[] {
    if (!this.reportData?.columns_by_parcial) return [];
    return Object.keys(this.reportData.columns_by_parcial)
      .map(Number)
      .sort((a, b) => a - b);
  }

  getColumnsForParcial(parcial: number): any[] {
    return this.reportData?.columns_by_parcial?.[parcial] || [];
  }

  getParcialData(student: any, parcial: number): any {
    return student.parciales?.[parcial] || { theoretical_average: null, practical_average: null, final_grade: null };
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }
}
