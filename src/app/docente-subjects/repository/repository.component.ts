import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocenteService } from '../../service/docente.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { API_ENDPOINTS } from '../../config/api-endpoints';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { SubjectService } from '../../service/subject.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './repository.component.html',
  styleUrl: './repository.component.css',
})
export class RepositoryComponent implements OnInit {
  // Materias del docente
  subjects: any[] = [];
  loadingSubjects = false;

  // Materiales subidos
  materials: any[] = [];
  loadingMaterials = false;

  // Filtro
  selectedSubjectId: number | null = null;

  // Formulario subir
  showUploadForm = false;
  uploadData = {
    subject_id: null as number | null,
    title: '',
    description: '',
    all_parallels: false,
    parallel_ids: [] as number[],
  };
  selectedFile: File | null = null;
  uploading = false;

  // Confirmar eliminar
  confirmDeleteId: number | null = null;
  confirmDeleteOpen = false;
  deleting = false;

  constructor(
    private docenteService: DocenteService,
    private http: HttpClient,
    private subjectService: SubjectService,
    private auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
    this.loadMaterials();
  }

  loadSubjects() {
    this.loadingSubjects = true;
    this.docenteService.getMySubjects().subscribe({
      next: (resp) => {
        this.loadingSubjects = false;
        this.subjects = resp.subjects || [];
      },
      error: () => {
        this.loadingSubjects = false;
        this.subjects = [];
      },
    });
  }

  loadMaterials() {
    this.loadingMaterials = true;
    let url = API_ENDPOINTS.materials.index;
    if (this.selectedSubjectId) {
      url += `?subject_id=${this.selectedSubjectId}`;
    }
    this.http.get<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (resp) => {
        this.loadingMaterials = false;
        this.materials = resp.materials || [];
      },
      error: () => {
        this.loadingMaterials = false;
        this.materials = [];
      },
    });
  }

  onSubjectFilterChange() {
    this.loadMaterials();
  }

  // ── Subir material ──
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  toggleParallel(parallelId: number) {
    const idx = this.uploadData.parallel_ids.indexOf(parallelId);
    if (idx >= 0) {
      this.uploadData.parallel_ids.splice(idx, 1);
    } else {
      this.uploadData.parallel_ids.push(parallelId);
    }
  }

  submitUpload() {
    if (!this.uploadData.subject_id || !this.uploadData.title || !this.selectedFile) return;
    if (!this.uploadData.all_parallels && this.uploadData.parallel_ids.length === 0) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('subject_id', String(this.uploadData.subject_id));
    formData.append('title', this.uploadData.title);
    formData.append('description', this.uploadData.description || '');
    
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('all_parallels', this.uploadData.all_parallels ? '1' : '0');

    if (!this.uploadData.all_parallels) {
      this.uploadData.parallel_ids.forEach(id => {
        formData.append('parallel_ids[]', String(id));
      });
    }

    this.http.post<any>(API_ENDPOINTS.materials.store, formData, { headers: this.getHeaders(false) }).subscribe({
      next: (resp) => {
        this.uploading = false;
        this.resetUploadForm();
        this.loadMaterials();
      },
      error: (ee) => {
        this.uploading = false;
        console.log(ee)
      },
    });
  }

  resetUploadForm() {
    this.uploadData = { subject_id: null, title: '', description: '', all_parallels: false, parallel_ids: [] };
    this.selectedFile = null;
    this.showUploadForm = false;
  }

  // ── Eliminar ──
  confirmDelete(materialId: number) {
    this.confirmDeleteId = materialId;
    this.confirmDeleteOpen = true;
  }

  cancelDelete() {
    this.confirmDeleteId = null;
    this.confirmDeleteOpen = false;
  }

  deleteMaterial() {
    if (!this.confirmDeleteId) return;
    this.deleting = true;
    this.http.delete(API_ENDPOINTS.materials.delete(this.confirmDeleteId), { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.deleting = false;
        this.cancelDelete();
        this.loadMaterials();
      },
      error: () => {
        this.deleting = false;
      },
    });
  }

  // ── Descargar ──
  downloadMaterial(materialId: number) {
    this.subjectService.dowloadFile(materialId).subscribe({
      next: (blob : Blob) => {
        const url = window.URL.createObjectURL(blob);
        // Abrir en nueva ventana
        const newWindow = window.open(url, '_blank');
        // Si se abrió correctamente, revocar la URL después de un tiempo
        if (newWindow) {
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        } else {
          // Si el popup fue bloqueado, descargar directamente
          const a = document.createElement('a');
          a.href = url;
          a.download = `archivo_${materialId}`; // O extraer el nombre del header
          a.click();
          window.URL.revokeObjectURL(url);
        }
      },
      error:(err) =>{
        this.toast.error('Error al descargar');
        console.log(err)
      }
    })
  }

  /** Obtener el nombre de la materia por ID */
  getSubjectName(id: number): string {
    const subj = this.subjects.find(s => s.id === id);
    return subj ? `${subj.name} (${subj.sigla})` : '—';
  }

  /** Obtener paralelos de una materia seleccionada */
  getSubjectParallels(subjectId: number): any[] {
    const subj = this.subjects.find(s => s.id === subjectId);
    return subj ? [subj] : [];
  }


  private getHeaders(skipContentType = true): HttpHeaders {
    let headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
    return headers;
  }
}