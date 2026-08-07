import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private apiUrl = API_ENDPOINTS;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getSubjects(page = 1, perPage = 10, filters: any = {}): Observable<any> {
    let params: any = { page, per_page: perPage };

    if (filters.name) {
      params.name = filters.name;
    }

    if (filters.sigla) {
      params.sigla = filters.sigla;
    }

    if (filters.career) {
      params.career = filters.career;
    }

    return this.http.get(`${this.apiUrl.carrers.index.replace('/careers', '')}/subjects`, {
      headers: this.getHeaders(),
      params,
    });
  }

  /** Obtener detalle: paralelos donde se dicta + docentes asignados */
  getDetail(subjectId: number): Observable<any> {
    return this.http.get(this.apiUrl.subjects.detail(subjectId), {
      headers: this.getHeaders(),
    });
  }

  /** Obtener historial de asignaciones docentes */
  getHistory(subjectId: number): Observable<any> {
    return this.http.get(this.apiUrl.subjects.history(subjectId), {
      headers: this.getHeaders(),
    });
  }

  /** Asignar docente a materia + paralelo */
  assignDocente(subjectId: number, docenteId: number, parallelId: number): Observable<any> {
    return this.http.post(
      this.apiUrl.subjects.assignDocente(subjectId),
      { docente_id: docenteId, parallel_id: parallelId },
      { headers: this.getHeaders() },
    );
  }

  /** Desasignar docente (baja lógica) */
  removeDocente(subjectId: number, docenteId: number, parallelId: number): Observable<any> {
    return this.http.post(
      this.apiUrl.subjects.removeDocente(subjectId),
      { docente_id: docenteId, parallel_id: parallelId },
      { headers: this.getHeaders() },
    );
  }

  /** Listar materiales del docente (todas las materias o una en específico) */
  getMaterials(subjectId: number | null = null): Observable<any> {
    const params: any = {};
    if (subjectId) {
      params.subject_id = subjectId;
    }
    return this.http.get(this.apiUrl.materials.index, {
      headers: this.getHeaders(),
      params,
    });
  }

  /** Listar materiales enlazados a un paralelo específico */
  getMaterialsByParallel(parallelId: number): Observable<any> {
    return this.http.get(this.apiUrl.parallels.materialsByParallel(parallelId), {
      headers: this.getHeaders(),
    });
  }

  /** Subir material (puede asignarse a una o varias materias) */
  createMaterial(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl.materials.store, formData, {
      headers: this.getHeaders(),
    });
  }

  /** Actualizar visibilidad de un material */
  updateMaterial(id: number, payload: any): Observable<any> {
    return this.http.put(this.apiUrl.materials.update(id), payload, {
      headers: this.getHeaders(),
    });
  }

  /** Eliminar un material */
  deleteMaterial(id: number): Observable<any> {
    return this.http.delete(this.apiUrl.materials.delete(id), {
      headers: this.getHeaders(),
    });
  }

  dowloadFile(materialId : number): Observable<any>{
    return this.http.get(this.apiUrl.materials.download(materialId),{
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`,
    });
  }
}
