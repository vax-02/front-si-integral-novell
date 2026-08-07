import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocenteService } from '../../service/docente.service';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { SubjectService } from '../../service/subject.service';
import { ToastService } from '../../shared/services/toast.service';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent, BaseModalConfirmComponent],
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
    title: '',
    description: '',
    all_subjects: false,
    subjects: [] as any[],
  };
  selectedFile: File | null = null;
  uploading = false;

  // Tipos de archivo permitidos (coinciden con el backend)
  readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  readonly maxFileSize = 20 * 1024 * 1024; // 20 MB

  // Confirmar eliminar
  confirmDeleteId: number | null = null;
  confirmDeleteOpen = false;
  deleting = false;

  // Editar visibilidad
  showEditVisibilityForm = false;
  editMaterialId: number | null = null;
  editData = {
    all_parallels: false,
    parallel_ids: [] as number[],
    subject_ids: [] as number[],
  };
  editingVisibility = false;

  constructor(
    private docenteService: DocenteService,
    private subjectService: SubjectService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
    this.loadMaterials();

    // Si viene con subject_id en query params, preseleccionar
    this.route.queryParams.subscribe(params => {
      if (params['subject_id']) {
        this.selectedSubjectId = Number(params['subject_id']);
        this.loadMaterials();
      }
    });
  }

  loadSubjects() {
    this.loadingSubjects = true;
    this.docenteService.getMySubjects().subscribe({
      next: (resp) => {
        console.log(resp.subjects)
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
    this.subjectService.getMaterials(this.selectedSubjectId).subscribe({
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
    const file = event.target.files[0] || null;
    if (!file) {
      this.selectedFile = null;
      return;
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (!this.allowedExtensions.includes(ext)) {
      this.toast.error(`Tipo de archivo no permitido. Usa: ${this.allowedExtensions.join(', ')}`);
      event.target.value = '';
      this.selectedFile = null;
      return;
    }

    if (file.size > this.maxFileSize) {
      this.toast.error('El archivo supera el tamaño máximo de 20 MB.');
      event.target.value = '';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  /** Marcar todas las materias (todas las materias y paralelos) */
  onToggleAllSubjects(checked: boolean) {
    this.uploadData.all_subjects = checked;
    this.subjects.forEach(s => (s.selected = checked));
    this.rebuildSubjectSelections();
  }

  /** Marcar/desmarcar una materia individual (card = materia + paralelo) */
  setSubjectSelected(subj: any, checked: boolean) {
    subj.selected = checked;
    this.rebuildSubjectSelections();
  }

  /** Reconstruir la lista de materias seleccionadas con su visibilidad por paralelo */
  rebuildSubjectSelections() {
    const byId = new Map<number, any>();
    for (const a of this.subjects) {
      if (!a.selected) continue;
      if (!byId.has(a.id)) {
        byId.set(a.id, {
          subject_id: a.id,
          name: a.name,
          sigla: a.sigla,
          all_parallels: false,
          parallel_ids: [] as number[],
        });
      }
      byId.get(a.id).parallel_ids.push(a.parallel_id);
    }

    for (const [id, sel] of byId) {
      const totalParallels = new Set(this.getSubjectParallels(id).map(p => p.parallel_id)).size;
      const selectedParallels = new Set(sel.parallel_ids).size;
      // Si están seleccionados todos los paralelos de la materia, all_parallels se activa automáticamente
      sel.all_parallels = totalParallels > 0 && selectedParallels >= totalParallels;
      sel.parallel_ids = [...new Set(sel.parallel_ids)];
    }

    this.uploadData.subjects = [...byId.values()];
  }

  getSelectedCount(): number {
    return this.subjects.filter(s => s.selected).length;
  }

  submitUpload() {
    if (!this.uploadData.title || !this.selectedFile) return;

    let selections: any[];

    if (this.uploadData.all_subjects) {
      // Todas las materias → todos los paralelos de cada una
      selections = [...new Set(this.subjects.map(s => s.id))].map(id => ({
        subject_id: id,
        all_parallels: true,
        parallel_ids: [] as number[],
      }));
    } else {
      selections = this.uploadData.subjects.map(s => ({
        subject_id: s.subject_id,
        all_parallels: s.all_parallels ? 1 : 0,
        parallel_ids: s.all_parallels ? [] : s.parallel_ids,
      }));
    }

    if (selections.length === 0) {
      this.toast.error('Selecciona al menos una materia');
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    selections.forEach((sel, i) => {
      formData.append(`subjects[${i}][subject_id]`, String(sel.subject_id));
      formData.append(`subjects[${i}][all_parallels]`, sel.all_parallels ? '1' : '0');
      (sel.parallel_ids as number[]).forEach(pid => {
        formData.append(`subjects[${i}][parallel_ids][]`, String(pid));
      });
    });
    formData.append('title', this.uploadData.title);
    formData.append('description', this.uploadData.description || '');
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.subjectService.createMaterial(formData).subscribe({
      next: () => {
        this.uploading = false;
        this.resetUploadForm();
        this.loadMaterials();
        this.toast.success('Material subido correctamente');
      },
      error: (ee) => {
        this.uploading = false;
        this.toast.error(ee.error?.error || 'Error al subir el material');
        console.log(ee);
      },
    });
  }

  resetUploadForm() {
    this.uploadData = { title: '', description: '', all_subjects: false, subjects: [] };
    this.subjects.forEach(s => (s.selected = false));
    this.selectedFile = null;
    this.showUploadForm = false;
  }

  // ── Editar visibilidad ──
  openEditVisibility(material: any) {
    // Materias que actualmente ven este material (comparten el mismo archivo físico)
    const siblings = this.materials.filter(m => m.file_path === material.file_path);
    const subjectIds = siblings.length
      ? [...new Set(siblings.map(m => m.subject_id))]
      : [material.subject_id];

    this.editMaterialId = material.id;
    this.editData = {
      all_parallels: material.all_parallels,
      parallel_ids: material.parallels ? material.parallels.map((p: any) => p.id) : [],
      subject_ids: subjectIds,
    };
    this.subjects.forEach(s => (s.editSelected = subjectIds.includes(s.id)));
    this.showEditVisibilityForm = true;
  }

  /** Materias distintas (agrupadas por id) para la selección */
  getDistinctEditSubjects(): any[] {
    const seen = new Map<number, any>();
    for (const s of this.subjects) {
      if (!seen.has(s.id)) seen.set(s.id, s);
    }
    return [...seen.values()];
  }

  /** Marcar/desmarcar una materia que verá el material */
  toggleEditSubject(subj: any, checked: boolean, event?: Event) {
    event?.preventDefault();
    this.subjects
      .filter(s => s.id === subj.id || s.sigla === subj.sigla)
      .forEach(s => (s.editSelected = checked));
    this.editData.subject_ids = [...new Set(
      this.subjects.filter(s => s.editSelected).map(s => s.id)
    )];
  }

  /** Marcar/desmarcar todas las materias */
  toggleAllEditSubjects(checked: boolean) {
    this.subjects.forEach(s => (s.editSelected = checked));
    this.editData.subject_ids = checked
      ? [...new Set(this.subjects.map(s => s.id))]
      : [];
  }

  /** ¿Están seleccionadas todas las materias? */
  isAllEditSubjectsSelected(): boolean {
    return this.editData.subject_ids.length > 0 &&
      this.editData.subject_ids.length === new Set(this.subjects.map(s => s.id)).size;
  }

  toggleEditParallel(parallelId: number, event?: Event) {
    event?.preventDefault();
    const idx = this.editData.parallel_ids.indexOf(parallelId);
    if (idx >= 0) {
      this.editData.parallel_ids.splice(idx, 1);
    } else {
      this.editData.parallel_ids.push(parallelId);
    }
  }

  /** Materia de referencia para mostrar sus paralelos (solo si se eligió una) */
  getEditSubjectId(): number | null {
    return this.editData.subject_ids.length === 1 ? this.editData.subject_ids[0] : null;
  }

  submitEditVisibility() {
    if (!this.editMaterialId) return;
    if (this.editData.subject_ids.length === 0) {
      this.toast.error('Selecciona al menos una materia');
      return;
    }
    if (this.editData.subject_ids.length > 1 && !this.editData.all_parallels) {
      this.toast.error('Para varias materias marca "todos los paralelos"');
      return;
    }
    if (!this.editData.all_parallels && this.editData.parallel_ids.length === 0) {
      this.toast.error('Selecciona al menos un paralelo o marca "todos"');
      return;
    }

    this.editingVisibility = true;
    const payload: any = {
      all_parallels: this.editData.all_parallels ? '1' : '0',
      subject_ids: this.editData.subject_ids,
    };
    if (!this.editData.all_parallels) {
      payload.parallel_ids = this.editData.parallel_ids;
    }

    this.subjectService.updateMaterial(this.editMaterialId, payload).subscribe({
      next: () => {
        this.editingVisibility = false;
        this.showEditVisibilityForm = false;
        this.editMaterialId = null;
        this.loadMaterials();
        this.toast.success('Visibilidad actualizada correctamente');
      },
      error: (ee) => {
        this.editingVisibility = false;
        this.toast.error('Error al actualizar la visibilidad');
        console.log(ee);
      },
    });
  }

  cancelEditVisibility() {
    this.showEditVisibilityForm = false;
    this.editMaterialId = null;
    this.subjects.forEach(s => (s.editSelected = false));
  }

  // ── Ver archivo ──
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
        console.log(err);
      }
    });
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
    this.subjectService.deleteMaterial(this.confirmDeleteId).subscribe({
      next: () => {
        this.deleting = false;
        this.cancelDelete();
        this.loadMaterials();
        this.toast.success('Material eliminado correctamente');
      },
      error: () => {
        this.deleting = false;
        this.toast.error('Error al eliminar el material');
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

  /** Obtener paralelos de una materia seleccionada (por sigla y/o id de materia) */
  getSubjectParallels(subjectId: number): any[] {
    // Buscar la materia seleccionada para obtener su sigla
    const selected = this.subjects.find(s => s.id === subjectId);
    if (!selected) return [];
    // Filtrar todas las entradas con la misma sigla (misma materia en diferentes paralelos)
    return this.subjects.filter(s => s.sigla === selected.sigla);
  }

}
