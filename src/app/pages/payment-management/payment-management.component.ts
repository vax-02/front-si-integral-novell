import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CareerService } from '../../service/career.service';
import { ConceptService } from '../../service/concept.service';
import { ToastService } from '../../shared/services/toast.service';

interface ConfiguracionCobro {
  carrera: number,
  tipoConcepto: string,
  descripcion: string,
  gestion: number,
  semestre : number,
  monto: number    
}


@Component({
  selector: 'app-payment-management',
  imports: [
    ButtonComponent,
    BaseModalComponent,
    FormsModule,
    CommonModule,
    BaseInputComponent,
  ],
  templateUrl: './payment-management.component.html',
  styleUrl: './payment-management.component.css',
})
export class PaymentManagementComponent {
  // Modales
  registerModalOpen: boolean = false;
  editModalOpen: boolean = false;
  viewModalOpen: boolean = false;
  deleteConfirmOpen: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;

  // Datos
  concepts: any[] = [];
  selectedConcept: any = null;
  conceptToDelete: any = null;

  filters = {
    search: '',
    gestion: null,
    career_id: null,
    page: 1,
    per_page: 10,
  };

  currentPage = 1;
  lastPage = 1;
  totalConcepts = 0;
  from = 0;
  to = 0;
  public gestiones: string[] = [];

  carreras: any[] = [];


  public configuracion: ConfiguracionCobro = {
    carrera: 0,
    tipoConcepto: '',
    descripcion: '',
    gestion: 0,
    semestre : 0,
    monto: 0    
  };

  public mensajeValidacion: string = '';

  get totalActivos(): number {
    return this.concepts.length;
  }

  get totalMensualidades(): number {
    return this.concepts.filter((c) => c.type === 'Mensualidad').length;
  }

  get totalMatriculas(): number {
    return this.concepts.filter((c) => c.type === 'Matricula').length;
  }

  onTipoConceptoChange(): void {
    this.limpiarCampos();
    this.validarConfiguracion();
  }

  onFechaChange(): void {
    this.validarConfiguracion();
  }

  onMontoChange(): void {
    this.validarConfiguracion();
  }

  onSemanaPagoChange(): void {
    this.validarConfiguracion();
  }

  
  validarConfiguracion(): boolean {
    this.mensajeValidacion = '';
    if (this.configuracion.gestion == 0 ) {
      this.mensajeValidacion = 'Seleccione una gestión académica';
      return false;
    }
    if (!this.configuracion.tipoConcepto) {
      this.mensajeValidacion = 'Seleccione el tipo de concepto';
      return false;
    }
    if (!this.configuracion.carrera) {
      this.mensajeValidacion = 'Seleccione una carrera';
      return false;
    }
    if (this.configuracion.monto <= 0) {
      this.mensajeValidacion = 'El monto debe ser mayor a 0';
      return false;
    }
    return true;
  }

  getCareerName(careerId?: any): string {
    const id = careerId || this.configuracion.carrera;
    const carrera = this.carreras.find((c) => c.id == id);
    return carrera ? carrera.name : '';
  }




  limpiarCampos(): void {
    this.configuracion.descripcion = '';
    this.configuracion.monto = 0;
  }

  resetFormulario(): void {
    this.configuracion = {
      carrera: 0,
      tipoConcepto: '',
      descripcion: '',
      gestion: 0,
      semestre : 0,
      monto: 0,
    };
    this.mensajeValidacion = '';
  }

  // ============ CRUD: Crear ============
  openRegisterModal() {
    this.resetFormulario();
    this.registerModalOpen = true;
  }

  closeRegisterModal(): void {
    this.registerModalOpen = false;
  }

  saveConfiguration(): void {
    if (!this.validarConfiguracion()) return;
    this.saving = true;

 
    const data = {
      career_id: this.configuracion.carrera,
      type: this.configuracion.tipoConcepto,
      gestion: this.configuracion.gestion,
      semestre : this.configuracion.semestre == 0? null : this.configuracion.semestre,
      amount : this.configuracion.monto,
      description : this.configuracion.descripcion,
    };


    this.conceptService.createConcept(data).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.success('Concepto creado exitosamente');
        this.closeRegisterModal();
        this.resetFormulario();
        this.loadConcepts();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error('No se pudo guardar los datos');
      },
    });
  }

  openViewModal(concept: any) {
    this.selectedConcept = concept;
    this.viewModalOpen = true;

    this.configuracion = {
      carrera: concept.career_id || '',
      tipoConcepto: concept.type || '',
      gestion: concept.gestion?.toString() || '',
      semestre: concept.semestre?.toString() || '',
      descripcion: concept.description || '' ,
      monto: Number(concept.amount) || 0,
    };
  }

  closeViewModal(): void {
    this.viewModalOpen = false;
    this.selectedConcept = null;
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.selectedConcept = null;
    this.resetFormulario();
  }

  
  confirmDelete(concept: any) {
    this.conceptToDelete = concept;
    this.deleteConfirmOpen = true;
  }

  cancelDelete(): void {
    this.deleteConfirmOpen = false;
    this.conceptToDelete = null;
  }

  deleteConcept(): void {
    if (!this.conceptToDelete) return;
    this.deleting = true;

    this.conceptService.deleteConcept(this.conceptToDelete.id).subscribe({
      next: (response) => {
        this.deleting = false;
        this.toast.success('Concepto eliminado exitosamente');
        this.cancelDelete();
        this.loadConcepts();
      },
      error: (err) => {
        this.deleting = false;
        this.toast.error('Error al eliminar el concepto.');
      },
    });
  }

  constructor(
    private careerService: CareerService,
    private conceptService: ConceptService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadCareers();
    this.loadConcepts();
    this.generateGestion();
  }

  loadCareers() {
    this.careerService.getCareersForSelect().subscribe({
      next: (resp) => {
        this.carreras = resp.careers;
      },
      error: () => {},
    });
  }

  loadConcepts() {
    this.loading = true;
    // Solo enviar filtros con valor para que al estar vacíos cargue todos los datos
    const params: any = { page: this.filters.page, per_page: this.filters.per_page };
    if (this.filters.search.trim()) params.search = this.filters.search.trim();
    if (this.filters.gestion) params.gestion = this.filters.gestion;
    if (this.filters.career_id) params.career_id = this.filters.career_id;

    this.conceptService.getConcepts(params).subscribe({
      next: (response) => {
        this.concepts = response.data;
        this.currentPage = response.current_page;
        this.lastPage = response.last_page;
        this.totalConcepts = response.total;
        this.from = response.from ?? 0;
        this.to = response.to ?? 0;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  changePage(page: number) {
    this.filters.page = page;
    this.loadConcepts();
  }
  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.filters.page++;
      this.loadConcepts();
    }
  }
  previousPage() {
    if (this.currentPage > 1) {
      this.filters.page--;
      this.loadConcepts();
    }
  }

  filter() {
    this.filters.page = 1;
    this.loadConcepts();
  }

  generateGestion(): void {
    const currentYear = new Date().getFullYear();
    this.gestiones = [];
    for (let i = 0; i <= 5; i++) {
      this.gestiones.push((currentYear + i).toString());
    }
  }
}
