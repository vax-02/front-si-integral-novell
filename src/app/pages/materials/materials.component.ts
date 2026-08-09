import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { API_ENDPOINTS } from '../../config/api-endpoints';
import { SubjectService } from '../../service/subject.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.css',
})
export class MaterialsComponent implements OnInit {
  materials: any[] = [];
  loading = false;
  error = '';

  // Agrupados por materia
  groupedMaterials: { subject_id: number; subject_name: string; subject_sigla: string; items: any[] }[] = [];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private subjectService: SubjectService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials() {
    this.loading = true;
    this.error = '';
    this.http.get<any>(API_ENDPOINTS.studentMaterials, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.loading = false;
        this.materials = resp.materials || [];
        this.groupBySubject();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar los materiales.';
      },
    });
  }

  groupBySubject() {
    const groups = new Map<number, { subject_id: number; subject_name: string; subject_sigla: string; items: any[] }>();

    for (const material of this.materials) {
      const subjectId = material.subject_id;
      if (!groups.has(subjectId)) {
        groups.set(subjectId, {
          subject_id: subjectId,
          subject_name: material.subject?.name || 'Materia',
          subject_sigla: material.subject?.sigla || '',
          items: [],
        });
      }
      groups.get(subjectId)!.items.push(material);
    }

    this.groupedMaterials = Array.from(groups.values());
  }

  downloadMaterial(materialId: number) {
    this.subjectService.dowloadFile(materialId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `material_${materialId}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.toast.error('Error al descargar');
      },
    });
  }

  viewMaterial(materialId: number) {
    this.subjectService.dowloadFile(materialId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      },
      error: (err) => {
        this.toast.error('Error al abrir el archivo');
      },
    });
  }

  getDocenteName(material: any): string {
    const docente = material.docente;
    if (!docente || !docente.user) return '—';
    const u = docente.user;
    return `${u.name || ''} ${u.first_lastname || ''} ${u.second_lastname || ''}`.trim() || '—';
  }

  getFileIcon(fileType: string | null): string {
    if (!fileType) return 'fa-file';
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('video')) return 'fa-file-video';
    if (fileType.includes('word')) return 'fa-file-word';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'fa-file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint';
    return 'fa-file';
  }

  getFileColor(fileType: string | null): string {
    if (!fileType) return 'bg-slate-400';
    if (fileType.includes('pdf')) return 'bg-red-400';
    if (fileType.includes('image')) return 'bg-blue-400';
    if (fileType.includes('video')) return 'bg-green-400';
    if (fileType.includes('word')) return 'bg-indigo-400';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'bg-emerald-400';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'bg-orange-400';
    return 'bg-slate-400';
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
