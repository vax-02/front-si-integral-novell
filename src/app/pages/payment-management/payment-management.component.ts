import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CareerService } from '../../service/career.service';
import { ConceptService } from '../../service/concept.service';
import { ToastService } from '../../shared/services/toast.service';

interface Concepto {
  codigo: string;
  nombre: string;
  tipo: 'MATRICULA' | 'MENSUALIDAD';
}

interface ConfiguracionCobro {
  gestion: string;
  tipoConcepto: 'MATRICULA' | 'MENSUALIDAD' | '';
  carrera: any;
  concepto: string;
  monto: number;
  fechaInicio: string;
  fechaFin: string;
  cantidadCuotas: number;
  mesInicial: number;
  semanaPago: number;
}

interface CuotaGenerada {
  mes: string;
  mesNumero: number;
  monto: number;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
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
    management_id: null,
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

  public conceptosDisponibles: Concepto[] = [
    { codigo: 'MAT', nombre: 'Matrícula', tipo: 'MATRICULA' },
    { codigo: 'MEN', nombre: 'Mensualidad', tipo: 'MENSUALIDAD' },
    { codigo: 'INS', nombre: 'Inscripción', tipo: 'MATRICULA' },
  ];

  public meses: string[] = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  public configuracion: ConfiguracionCobro = {
    gestion: '',
    tipoConcepto: '',
    carrera: '',
    concepto: '',
    monto: 0,
    fechaInicio: '',
    fechaFin: '',
    cantidadCuotas: 0,
    mesInicial: 1,
    semanaPago: 1,
  };

  public cuotasGeneradas: CuotaGenerada[] = [];
  public mensajeValidacion: string = '';

  // Propiedades computadas
  get totalActivos(): number {
    return this.concepts.filter((c) => c.is_active).length;
  }

  get totalMensualidades(): number {
    return this.concepts.filter((c) => c.type === 'MENSUALIDAD').length;
  }

  get totalMatriculas(): number {
    return this.concepts.filter((c) => c.type === 'MATRICULA').length;
  }

  // ============ Eventos del formulario ============
  onTipoConceptoChange(): void {
    this.limpiarCampos();
    this.generarCuotas();
    this.validarConfiguracion();
  }

  onFechaChange(): void {
    this.generarCuotas();
    this.validarConfiguracion();
  }

  onMontoChange(): void {
    this.generarCuotas();
    this.validarConfiguracion();
  }

  onSemanaPagoChange(): void {
    this.generarCuotas();
    this.validarConfiguracion();
  }

  onCantidadCuotasChange(): void {
    if (this.configuracion.cantidadCuotas > 12) {
      this.configuracion.cantidadCuotas = 12;
    }
    if (this.configuracion.cantidadCuotas < 1) {
      this.configuracion.cantidadCuotas = 1;
    }
    this.generarCuotas();
    this.validarConfiguracion();
  }

  onMesInicialChange(): void {
    this.generarCuotas();
    this.validarConfiguracion();
  }

  generarCuotas(): void {
    this.cuotasGeneradas = [];
    this.mensajeValidacion = '';

    if (
      !this.configuracion.tipoConcepto ||
      !this.configuracion.fechaInicio ||
      this.configuracion.monto <= 0
    ) {
      return;
    }

    if (this.configuracion.tipoConcepto === 'MATRICULA') {
      this.cuotasGeneradas.push({
        mes: 'Matrícula Única',
        mesNumero: 0,
        monto: this.configuracion.monto,
        fechaVencimiento: this.configuracion.fechaInicio,
        estado: 'PENDIENTE',
      });
    } else if (this.configuracion.tipoConcepto === 'MENSUALIDAD') {
      const cantidad = this.configuracion.cantidadCuotas || 1;
      const mesInicio = this.configuracion.mesInicial || 1;
      const semanaPago = this.configuracion.semanaPago || 1;
      const gestion =
        parseInt(this.configuracion.gestion) || new Date().getFullYear();
      const diasSemana = [5, 12, 19, 26];

      for (let i = 0; i < cantidad; i++) {
        let mesNumero = mesInicio + i;
        let year = gestion;
        if (mesNumero > 12) {
          mesNumero -= 12;
          year++;
        }
        const dia = diasSemana[Math.min(semanaPago - 1, 3)];
        const mesStr = mesNumero.toString().padStart(2, '0');
        const diaStr = dia.toString().padStart(2, '0');
        const fechaVencimiento = `${year}-${mesStr}-${diaStr}`;

        this.cuotasGeneradas.push({
          mes: this.meses[mesNumero - 1],
          mesNumero: mesNumero,
          monto: this.configuracion.monto,
          fechaVencimiento: fechaVencimiento,
          estado: 'PENDIENTE',
        });
      }
    }
  }

  validarConfiguracion(): boolean {
    this.mensajeValidacion = '';
    if (!this.configuracion.gestion) {
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
    if (!this.configuracion.concepto) {
      this.mensajeValidacion = 'Seleccione un concepto de pago';
      return false;
    }
    if (this.configuracion.monto <= 0) {
      this.mensajeValidacion = 'El monto debe ser mayor a 0';
      return false;
    }
    if (!this.configuracion.fechaInicio || !this.configuracion.fechaFin) {
      this.mensajeValidacion = 'Seleccione las fechas de inicio y fin';
      return false;
    }

    const fechaInicio = new Date(this.configuracion.fechaInicio);
    const fechaFin = new Date(this.configuracion.fechaFin);
    if (fechaInicio > fechaFin) {
      this.mensajeValidacion =
        'La fecha de inicio debe ser menor a la fecha fin';
      return false;
    }

    if (this.configuracion.tipoConcepto === 'MENSUALIDAD') {
      if (
        !this.configuracion.cantidadCuotas ||
        this.configuracion.cantidadCuotas < 1
      ) {
        this.mensajeValidacion = 'Especifique la cantidad de cuotas';
        return false;
      }
      if (!this.configuracion.mesInicial) {
        this.mensajeValidacion = 'Seleccione el mes inicial';
        return false;
      }
    }
    return true;
  }

  getCareerName(careerId?: any): string {
    const id = careerId || this.configuracion.carrera;
    const carrera = this.carreras.find((c) => c.id == id);
    return carrera ? carrera.name : '';
  }

  getConceptoNombre(codigo?: string): string {
    const cod = codigo || this.configuracion.concepto;
    const concepto = this.conceptosDisponibles.find(
      (item) => item.codigo === cod,
    );
    return concepto ? concepto.nombre : '';
  }

  getPeriodo(): string {
    if (!this.configuracion.fechaInicio || !this.configuracion.fechaFin)
      return '--';
    const inicio = new Date(this.configuracion.fechaInicio);
    const fin = new Date(this.configuracion.fechaFin);
    if (inicio.getFullYear() === fin.getFullYear()) {
      return `${this.meses[inicio.getMonth()]} - ${this.meses[fin.getMonth()]} ${fin.getFullYear()}`;
    }
    return `${inicio.getFullYear()} - ${fin.getFullYear()}`;
  }

  calcularTotal(): number {
    if (this.cuotasGeneradas.length === 0) return 0;
    return this.cuotasGeneradas.reduce((sum, cuota) => sum + cuota.monto, 0);
  }

  limpiarCampos(): void {
    this.configuracion.concepto = '';
    this.configuracion.monto = 0;
    this.cuotasGeneradas = [];
  }

  resetFormulario(): void {
    this.configuracion = {
      gestion: '',
      tipoConcepto: '',
      carrera: '',
      concepto: '',
      monto: 0,
      fechaInicio: '',
      fechaFin: '',
      cantidadCuotas: 0,
      mesInicial: 1,
      semanaPago: 1,
    };
    this.cuotasGeneradas = [];
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

    const conceptoSeleccionado = this.conceptosDisponibles.find(
      (c) => c.codigo === this.configuracion.concepto,
    );
    const data = {
      gestion: this.configuracion.gestion,
      tipoConcepto: this.configuracion.tipoConcepto,
      carrera: this.configuracion.carrera,
      concepto: conceptoSeleccionado
        ? conceptoSeleccionado.nombre
        : this.configuracion.concepto,
      monto: this.configuracion.monto,
      fechaInicio: this.configuracion.fechaInicio,
      fechaFin: this.configuracion.fechaFin,
      cantidadCuotas:
        this.configuracion.tipoConcepto === 'MENSUALIDAD'
          ? this.configuracion.cantidadCuotas
          : 0,
      mesInicial:
        this.configuracion.tipoConcepto === 'MENSUALIDAD'
          ? this.configuracion.mesInicial
          : null,
      semanaPago:
        this.configuracion.tipoConcepto === 'MENSUALIDAD'
          ? this.configuracion.semanaPago
          : null,
    };


    this.conceptService.createConcept(data).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.success('Concepto creado exitosamente');
        this.closeRegisterModal();
        this.resetFormulario();
        this.loadConcepts();
        console.log("se creo")
      },
      error: (err) => {
        this.saving = false;
        const msg =
          err.error?.error ||
          'Error al guardar el concepto. Intente nuevamente.';
        this.mensajeValidacion = msg;
        this.toast.error('No se pudo guardar los datos');
        console.log("no se creo")

      },
    });
  }

  // ============ CRUD: Ver detalle ============
  openViewModal(concept: any) {
    this.selectedConcept = concept;
    this.viewModalOpen = true;

    // Generar cuotas preview para el detalle
    this.configuracion = {
      gestion: concept.gestion?.toString() || '',
      tipoConcepto: concept.type || '',
      carrera: concept.career_id || '',
      concepto: concept.concept_name || '',
      monto: Number(concept.amount) || 0,
      fechaInicio: concept.start_date || '',
      fechaFin: concept.end_date || '',
      cantidadCuotas: concept.cuotas || 0,
      mesInicial: concept.start_month || 1,
      semanaPago: concept.week_pay || 1,
    };
    this.generarCuotas();
  }

  closeViewModal(): void {
    this.viewModalOpen = false;
    this.selectedConcept = null;
  }

  // ============ CRUD: Editar ============
  openEditModal(concept: any) {
    this.selectedConcept = concept;
    this.configuracion = {
      gestion: concept.gestion?.toString() || '',
      tipoConcepto: concept.type || '',
      carrera: concept.career_id,
      concepto: concept.concept_name || '',
      monto: Number(concept.amount) || 0,
      fechaInicio: concept.start_date || '',
      fechaFin: concept.end_date || '',
      cantidadCuotas: concept.cuotas || 0,
      mesInicial: concept.start_month || 1,
      semanaPago: concept.week_pay || 1,
    };
    this.generarCuotas();
    this.mensajeValidacion = '';
    this.editModalOpen = true;
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.selectedConcept = null;
    this.resetFormulario();
  }

  updateConcept(): void {
    if (!this.validarConfiguracion() || !this.selectedConcept) return;
    this.saving = true;

    const data = {
      concepto: this.configuracion.concepto,
      monto: this.configuracion.monto,
      fechaInicio: this.configuracion.fechaInicio,
      fechaFin: this.configuracion.fechaFin,
      cantidadCuotas:
        this.configuracion.tipoConcepto === 'MENSUALIDAD'
          ? this.configuracion.cantidadCuotas
          : 0,
      mesInicial:
        this.configuracion.tipoConcepto === 'MENSUALIDAD'
          ? this.configuracion.mesInicial
          : null,
      semanaPago:
        this.configuracion.tipoConcepto === 'MENSUALIDAD'
          ? this.configuracion.semanaPago
          : null,
      is_active: this.selectedConcept.is_active,
    };

    this.conceptService.updateConcept(this.selectedConcept.id, data).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.success(
          response.message || 'Concepto actualizado exitosamente',
        );
        this.closeEditModal();
        this.loadConcepts();
      },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.error || 'Error al actualizar el concepto.';
        this.mensajeValidacion = msg;
        this.toast.error(msg);
      },
    });
  }

  // ============ CRUD: Eliminar / Desactivar ============
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
        this.toast.success('Concepto eliminado/desactivado exitosamente');
        this.cancelDelete();
        this.loadConcepts();
      },
      error: (err) => {
        this.deleting = false;
        this.toast.error('Error al eliminar el concepto.');
      },
    });
  }

  // ============ Inicialización ============
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
    this.conceptService.getConcepts(this.filters).subscribe({
      next: (response) => {
        this.concepts = response.data.data;
        this.currentPage = response.data.current_page;
        this.lastPage = response.data.last_page;
        this.totalConcepts = response.data.total;
        this.from = response.data.from ?? 0;
        this.to = response.data.to ?? 0;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        //this.toast.error("Error al carga datos")
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
