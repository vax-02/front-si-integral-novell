import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CareerService } from '../../service/career.service';
import { ConceptService } from '../../service/concept.service';
import { ToastService } from '../../shared/services/toast.service';
import { WorkshopService } from '../../service/workshop.service';

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
  workshopConcepts: any[] = [];
  allConcepts: any[] = [];
  filteredConcepts: any[] = [];
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
    return this.allConcepts.length;
  }

  get totalMensualidades(): number {
    return this.allConcepts.filter((c) => c.type === 'Mensualidad' || c.type === 'Cuota').length;
  }

  get totalMatriculas(): number {
    return this.allConcepts.filter((c) => c.type === 'Matricula' || c.type === 'Inscripcion').length;
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
    if ((this.configuracion.tipoConcepto === 'Otro' || this.configuracion.tipoConcepto === 'Tramite')
        && !this.configuracion.descripcion?.trim()) {
      this.mensajeValidacion = 'La descripción es obligatoria para este tipo de concepto';
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

    if (this.conceptToDelete.source === 'taller') {
      this.workshopService.deleteConcept(this.conceptToDelete.id).subscribe({
        next: () => {
          this.deleting = false;
          this.toast.success('Concepto eliminado exitosamente');
          this.cancelDelete();
          this.loadWorkshopConcepts();
        },
        error: (err) => {
          this.deleting = false;
          this.toast.error(err?.error?.message || 'Error al eliminar el concepto.');
        },
      });
    } else {
      this.conceptService.deleteConcept(this.conceptToDelete.id).subscribe({
        next: () => {
          this.deleting = false;
          this.toast.success('Concepto eliminado exitosamente');
          this.cancelDelete();
          this.loadConcepts();
        },
        error: (err) => {
          this.deleting = false;
          this.toast.error(err?.error?.message || 'Error al eliminar el concepto.');
        },
      });
    }
  }

  constructor(
    private careerService: CareerService,
    private conceptService: ConceptService,
    private toast: ToastService,
    private workshopService: WorkshopService,
  ) {}

  ngOnInit() {
    this.loadCareers();
    this.loadConcepts();
    this.loadWorkshopConcepts();
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
        this.mergeConcepts();
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  loadWorkshopConcepts() {
    this.workshopService.getAllWorkshopConcepts().subscribe({
      next: (res) => {
        this.workshopConcepts = (res.concepts || []).map((c: any) => ({
          ...c,
          source: 'taller',
          taller_name: c.edition?.workshop?.name || '',
          edicion_name: c.edition?.name || '',
          gestion: null,
          semestre: null,
          career: null,
          career_id: null,
        }));
        this.mergeConcepts();
      },
      error: () => {},
    });
  }

  mergeConcepts() {
    const careerNormalized = this.concepts.map((c: any) => ({
      ...c,
      source: 'carrera',
      taller_name: '',
      edicion_name: '',
    }));
    this.allConcepts = [...careerNormalized, ...this.workshopConcepts];
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.allConcepts];
    const search = this.filters.search.trim().toLowerCase();

    if (search) {
      result = result.filter((c) =>
        c.type?.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search) ||
        c.career?.name?.toLowerCase().includes(search) ||
        c.taller_name?.toLowerCase().includes(search) ||
        c.edicion_name?.toLowerCase().includes(search)
      );
    }
    if (this.filters.gestion) {
      result = result.filter((c) => c.gestion == this.filters.gestion);
    }
    if (this.filters.career_id) {
      result = result.filter((c) => c.career_id == this.filters.career_id);
    }

    this.filteredConcepts = result;
  }

  changePage(page: number) {
    this.filters.page = page;
    this.applyFilters();
  }
  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.filters.page++;
      this.applyFilters();
    }
  }
  previousPage() {
    if (this.currentPage > 1) {
      this.filters.page--;
      this.applyFilters();
    }
  }

  filter() {
    this.filters.page = 1;
    this.applyFilters();
  }

  generateGestion(): void {
    const currentYear = new Date().getFullYear();
    this.gestiones = [];
    for (let i = 0; i <= 5; i++) {
      this.gestiones.push((currentYear + i).toString());
    }
  }

  // ============ CONCEPTO COBRO TALLER ============
  workshopPaymentModalOpen = false;
  savingWorkshopPayment = false;
  wpMensajeValidacion = '';

  wpWorkshops: any[] = [];
  wpEditions: any[] = [];

  wpForm = {
    workshop_id: '',
    edition_id: '',
    type: '',
    description: '',
    amount: 0,
  };

  openWorkshopPaymentModal() {
    this.resetWpForm();
    this.workshopPaymentModalOpen = true;
    this.loadWpWorkshops();
  }

  closeWorkshopPaymentModal() {
    this.workshopPaymentModalOpen = false;
  }

  resetWpForm() {
    this.wpForm = {
      workshop_id: '',
      edition_id: '',
      type: '',
      description: '',
      amount: 0,
    };
    this.wpEditions = [];
    this.wpMensajeValidacion = '';
  }

  loadWpWorkshops() {
    this.workshopService.getWorkshopsSimple().subscribe({
      next: (res) => { this.wpWorkshops = res.workshops || res; },
      error: () => { this.toast.error('Error al cargar talleres'); },
    });
  }

  onWorkshopChange() {
    this.wpForm.edition_id = '';
    this.wpEditions = [];

    if (!this.wpForm.workshop_id) return;

    this.workshopService.getEditions(Number(this.wpForm.workshop_id)).subscribe({
      next: (res) => { this.wpEditions = res.editions || res; },
      error: () => { this.toast.error('Error al cargar ediciones'); },
    });
  }

  getWpWorkshopName(): string {
    const w = this.wpWorkshops.find((w: any) => w.id == this.wpForm.workshop_id);
    return w ? w.name : '';
  }

  getWpEditionName(): string {
    const e = this.wpEditions.find((e: any) => e.id == this.wpForm.edition_id);
    return e ? `${e.name} (${e.shift})` : '';
  }

  saveWpPaymentValidation(): boolean {
    this.wpMensajeValidacion = '';
    if (!this.wpForm.workshop_id) {
      this.wpMensajeValidacion = 'Seleccione un taller';
      return false;
    }
    if (!this.wpForm.edition_id) {
      this.wpMensajeValidacion = 'Seleccione una edición';
      return false;
    }
    if (!this.wpForm.type) {
      this.wpMensajeValidacion = 'Seleccione el tipo de concepto';
      return false;
    }
    if (this.wpForm.type === 'Otro' && !this.wpForm.description?.trim()) {
      this.wpMensajeValidacion = 'La descripción es obligatoria para este tipo de concepto';
      return false;
    }
    if (!this.wpForm.amount || this.wpForm.amount <= 0) {
      this.wpMensajeValidacion = 'El monto debe ser mayor a 0';
      return false;
    }
    return true;
  }

  saveWorkshopPayment() {
    if (!this.saveWpPaymentValidation()) return;
    this.savingWorkshopPayment = true;

    const data = {
      type: this.wpForm.type,
      description: this.wpForm.description || null,
      amount: this.wpForm.amount,
    };

    this.workshopService.createEditionConcept(Number(this.wpForm.edition_id), data).subscribe({
      next: () => {
        this.savingWorkshopPayment = false;
        this.toast.success('Concepto de cobro creado exitosamente');
        this.closeWorkshopPaymentModal();
        this.loadWorkshopConcepts();
      },
      error: (err) => {
        this.savingWorkshopPayment = false;
        this.toast.error(err?.error?.message || 'Error al crear concepto de cobro');
      },
    });
  }
}
