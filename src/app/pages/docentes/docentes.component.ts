import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DegreeService } from '../../service/degree.service';
import { DocenteService } from '../../service/docente.service';
@Component({
  selector: 'app-docentes',
  imports: [
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.css',
})
export class DocentesComponent {
  docenteSeleccionado: any;
  modalAddDocente: boolean = false;
  modalViewDocente: boolean = false;
  modalOptionDocente: boolean = false;
  especialidades: string[] = [];
  especialidadInput: string = '';
  tabDoc = 'asignar';
  estado = '';
  search: string = '';
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  totalDocentes = 0;
  pageFrom = 0;
  pageTo = 0;
  activeCount = 0;
  inactiveCount = 0;
  docentes: any[] = [];
  loading = false;
  private searchTimeout: any;

  // Campos del formulario de Docente
  nombre: string = '';
  apellidoPaterno: string = '';
  apellidoMaterno: string = '';
  ci: string = '';
  correo: string = '';
  celular: string = '';
  gradoAcademico: string = '';

  // Documentos
  documentos = {
    hojaVida: false,
    tituloProfesional: false,
    ciCopia: false,
    certificados: false,
  };

  // Errores de validación
  errores: { [key: string]: string } = {};
  addEspecialidad() {
    const value = this.especialidadInput.trim();

    if (value && !this.especialidades.includes(value)) {
      this.especialidades.push(value);
    }

    this.especialidadInput = '';
  }

  constructor(private degreeService: DegreeService, private docenteService: DocenteService) {}
  ngOnInit() {
    this.loadDegrees();
    this.loadDocentes();
  }

  loadDegrees() {
    this.degreeService.getDegrees().subscribe({
      next: (data) => {
        console.log('Grados académicos obtenidos:', data);
      },
      error: (err) => {
        console.error('Error al obtener los grados académicos:', err);
      },
    });
  }
  loadDocentes(): void {
    this.loading = true;
    this.docenteService.getDocentes(this.currentPage, this.perPage, this.search).subscribe({
      next: (data) => {
        this.loading = false;
        this.currentPage = data.docentes.current_page ?? 1;
        this.lastPage = data.docentes.last_page ?? 1;
        this.totalDocentes = data.docentes.total ?? data.docentes.total_docentes ?? 0;
        this.docentes = data.docentes.data ?? [];
        console.log(data.docentes.data)
        this.activeCount = data.docentes.active_total ?? data.docentes.total_activos ?? this.docentes.filter((d: any) => d.status).length;
        this.inactiveCount = data.docentes.inactive_total ?? data.docentes.total_inactivos ?? this.docentes.filter((d: any) => !d.status).length;
        this.pageFrom = data.docentes.from ?? this.from;
        this.pageTo = data.docentes.to ?? this.to;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al obtener los docentes:', err);
      },
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDocentes();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadDocentes();
    }
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadDocentes();
    }, 400);
  }

  get from(): number {
    return this.pageFrom || (this.docentes.length === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1);
  }

  get to(): number {
    return this.pageTo || Math.min(this.currentPage * this.perPage, this.totalDocentes);
  }

  removeEspecialidad(index: number) {
    this.especialidades.splice(index, 1);
  }
  openAddDocente() {
    this.modalAddDocente = true;
  }
  openViewDocente(docente: any) {
    this.docenteSeleccionado = docente;
    this.modalViewDocente = true;
  }
  openOptionDocente(id : number) {
    // Lógica para abrir el modal de opciones
    this.modalOptionDocente = true;

  }
  closeAddDocente() {
    this.modalAddDocente = false;
  }

  /**
   * Valida todos los campos del formulario
   * @returns {boolean} true si todos los campos son válidos
   */
  validarCampos(): boolean {
    this.errores = {};
    let esValido = true;

    // Validar Nombre
    if (!this.nombre || this.nombre.trim() === '') {
      this.errores['nombre'] = 'El nombre es requerido';
      esValido = false;
    }

    // Validar Apellido Paterno
    if (!this.apellidoPaterno || this.apellidoPaterno.trim() === '') {
      this.errores['apellidoPaterno'] = 'El apellido paterno es requerido';
      esValido = false;
    }

    // Validar Apellido Materno
    if (!this.apellidoMaterno || this.apellidoMaterno.trim() === '') {
      this.errores['apellidoMaterno'] = 'El apellido materno es requerido';
      esValido = false;
    }

    // Validar C.I.
    if (!this.ci || this.ci.trim() === '') {
      this.errores['ci'] = 'El C.I. es requerido';
      esValido = false;
    } else if (!/^\d{7,10}$/.test(this.ci)) {
      this.errores['ci'] = 'El C.I. debe contener entre 7 y 10 dígitos';
      esValido = false;
    }

    // Validar Correo
    if (!this.correo || this.correo.trim() === '') {
      this.errores['correo'] = 'El correo electrónico es requerido';
      esValido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo)) {
      this.errores['correo'] = 'El formato del correo no es válido';
      esValido = false;
    }

    // Validar Celular
    if (!this.celular || this.celular.trim() === '') {
      this.errores['celular'] = 'El celular es requerido';
      esValido = false;
    } else if (!/^\d{7,10}$/.test(this.celular)) {
      this.errores['celular'] = 'El celular debe contener entre 7 y 10 dígitos';
      esValido = false;
    }

    // Validar Grado Académico
    if (!this.gradoAcademico || this.gradoAcademico.trim() === '') {
      this.errores['gradoAcademico'] = 'El grado académico es requerido';
      esValido = false;
    }

    return esValido;
  }

  /**
   * Prepara los datos del docente para enviar al servicio
   * @returns {object} Objeto con los datos del docente o null si hay errores
   */
  prepararDatos(): any {
    if (!this.validarCampos()) {
      console.error('Errores de validación:', this.errores);
      return null;
    }

    const datos = {
      datosPersonales: {
        nombre: this.nombre.trim(),
        apellidoPaterno: this.apellidoPaterno.trim(),
        apellidoMaterno: this.apellidoMaterno.trim(),
        ci: this.ci.trim(),
      },
      contacto: {
        correo: this.correo.trim(),
        celular: this.celular.trim(),
      },
      informacionProfesional: {
        gradoAcademico: this.gradoAcademico.trim(),
      },
      documentos: this.documentos,
    };

    return datos;
  }

  /**
   * Guarda el docente validando y preparando los datos
   */
  saveDocente() {
    const datos = this.prepararDatos();

    if (datos) {
      console.log('Datos listos para enviar:', datos);
      // Aquí llamarás tu servicio: this.docenteService.crearDocente(datos);
    } else {
      console.warn('No se puede guardar, hay errores en el formulario');
    }
  }
}
