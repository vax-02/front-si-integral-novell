import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkshopService } from '../../service/workshop.service';
import { ToastService } from '../../shared/services/toast.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';
import { Workshop } from '../../interfaces/workshop';

@Component({
  selector: 'app-workshops',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, BaseModalComponent, BaseInputComponent, BaseModalConfirmComponent],
  templateUrl: './workshops.component.html',
  styleUrl: './workshops.component.css',
})
export class WorkshopsComponent implements OnInit {
  loading = false;
  workshops: Workshop[] = [];
  total = 0;
  active = 0;

  workshopForm: FormGroup;
  editionForm: FormGroup;

  workshopModalOpen = false;
  workshopModalMode: 'create' | 'edit' = 'create';
  editingWorkshop: Workshop | null = null;

  detailModalOpen = false;
  selectedWorkshop: any = null;
  loadingDetail = false;
  activeTab: 'modules' | 'editions' = 'modules';
  newModuleName = '';

  moduleToDelete: any = null;
  confirmModuleDeleteOpen = false;

  editionToDelete: any = null;
  confirmEditionDeleteOpen = false;

  selectedEdition: any = null;
  editionDetailModalOpen = false;
  loadingEditionDetail = false;
  editionModalOpen = false;


  workshopToDelete: any = null;
  confirmWorkshopDeleteOpen = false;
  saving = false;
  savingModule = false;
  savingEdition = false;


  constructor(
    private workshopService: WorkshopService,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {
    this.workshopForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });

    this.editionForm = this.fb.group({
      name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: [''],
      shift: ['Mañana', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.loadWorkshops();
  }

  loadWorkshops() {
    this.loading = true;
    this.workshopService.getWorkshops().subscribe({
      next: (res) => {
        this.loading = false;
        this.workshops = res.workshops;
        this.total = res.total;
        this.active = res.active;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar talleres');
      },
    });
  }

  openWorkshopModal(mode: 'create' | 'edit' = 'create', workshop?: Workshop) {
    this.workshopModalMode = mode;
    this.editingWorkshop = workshop || null;
    if (mode === 'edit' && workshop) {
      this.workshopForm.patchValue({ name: workshop.name, description: workshop.description || '' });
    } else {
      this.workshopForm.reset({ name: '', description: '' });
    }
    this.workshopModalOpen = true;
  }

  closeWorkshopModal() {
    this.workshopModalOpen = false;
    this.editingWorkshop = null;
    this.workshopForm.reset({ name: '', description: '' });
  }

  saveWorkshop() {
    if (this.saving) return;
    if (this.workshopForm.invalid) {
      this.workshopForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const data = this.workshopForm.value;

    const request$ = this.workshopModalMode === 'edit' && this.editingWorkshop
      ? this.workshopService.updateWorkshop(this.editingWorkshop.id, data)
      : this.workshopService.createWorkshop(data);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeWorkshopModal();
        this.toast.success(this.workshopModalMode === 'edit' ? 'Taller actualizado.' : 'Taller creado.');
        this.loadWorkshops();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err?.error?.message || 'No se pudo guardar el taller.');
      },
    });
  }

  openDeleteWorkshopConfirm(workshop: Workshop) {
    this.workshopToDelete = workshop;
    this.confirmWorkshopDeleteOpen = true;
  }

  closeDeleteWorkshopConfirm() {
    this.confirmWorkshopDeleteOpen = false;
    this.workshopToDelete = null;
  }

  deleteWorkshop() {
    if (!this.workshopToDelete) return;
    this.workshopService.deleteWorkshop(this.workshopToDelete.id).subscribe({
      next: () => {
        this.toast.success('Taller eliminado.');
        this.closeDeleteWorkshopConfirm();
        this.loadWorkshops();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'No se pudo eliminar.');
      },
    });
  }

  toggleWorkshopStatus(workshop: Workshop) {
    this.workshopService.toggleStatus(workshop.id).subscribe({
      next: (res) => {
        workshop.status = res.status;
        this.toast.success(res.message);
        this.loadWorkshops();
      },
      error: () => this.toast.error('No se pudo cambiar el estado.'),
    });
  }

  openDetail(workshop: Workshop) {
    this.detailModalOpen = true;
    this.loadingDetail = true;
    this.activeTab = 'modules';
    this.workshopService.getWorkshop(workshop.id).subscribe({
      next: (res) => {
        this.selectedWorkshop = res;
        this.loadingDetail = false;
      },
      error: () => {
        this.loadingDetail = false;
        this.toast.error('Error al cargar detalles');
      },
    });
  }

  closeDetail() {
    this.detailModalOpen = false;
    this.selectedWorkshop = null;
  }

  addModule() {
    if (this.savingModule) return;
    if (!this.newModuleName.trim() || !this.selectedWorkshop) return;
    this.savingModule = true;
    this.workshopService.createModule(this.selectedWorkshop.id, { name: this.newModuleName.trim() }).subscribe({
      next: () => {
        this.savingModule = false;
        this.toast.success('Módulo agregado.');
        this.newModuleName = '';
        this.openDetail(this.selectedWorkshop);
        this.loadWorkshops();
      },
      error: (err) => {
        this.savingModule = false;
        this.toast.error(err?.error?.message || 'Error al agregar módulo.');
      },
    });
  }

  openDeleteModuleConfirm(mod: any) {
    this.moduleToDelete = mod;
    this.confirmModuleDeleteOpen = true;
  }

  closeDeleteModuleConfirm() {
    this.confirmModuleDeleteOpen = false;
    this.moduleToDelete = null;
  }

  deleteModule() {
    if (!this.moduleToDelete || !this.selectedWorkshop) return;
    this.workshopService.deleteModule(this.selectedWorkshop.id, this.moduleToDelete.id).subscribe({
      next: () => {
        this.toast.success('Módulo eliminado.');
        this.closeDeleteModuleConfirm();
        this.openDetail(this.selectedWorkshop);
        this.loadWorkshops();
      },
      error: (err) => this.toast.error(err?.error?.message || 'No se pudo eliminar.'),
    });
  }

  saveEdition() {
    if (this.savingEdition) return;
    if (this.editionForm.invalid || !this.selectedWorkshop) return;
    this.savingEdition = true;
    this.workshopService.createEdition(this.selectedWorkshop.id, this.editionForm.value).subscribe({
      next: () => {
        this.savingEdition = false;
        this.editionModalOpen = false;
        this.editionForm.reset({ name: '', start_date: '', end_date: '', shift: 'Mañana', capacity: '' });
        this.toast.success('Edición creada.');
        this.openDetail(this.selectedWorkshop);
        this.loadWorkshops();
      },
      error: (err) => {
        this.savingEdition = false;
        this.toast.error(err?.error?.message || 'Error al crear edición.');
      },
    });
  }

  openEditionModal() {
    this.editionForm.reset({ name: '', start_date: '', end_date: '', shift: 'Mañana', capacity: '' });
    this.editionModalOpen = true;
  }

  closeEditionModal() {
    this.editionModalOpen = false;
  }

  openDeleteEditionConfirm(edition: any) {
    this.editionToDelete = edition;
    this.confirmEditionDeleteOpen = true;
  }

  closeDeleteEditionConfirm() {
    this.confirmEditionDeleteOpen = false;
    this.editionToDelete = null;
  }

  deleteEdition() {
    if (!this.editionToDelete) return;
    this.workshopService.deleteEdition(this.editionToDelete.id).subscribe({
      next: () => {
        this.toast.success('Edición eliminada.');
        this.closeDeleteEditionConfirm();
        if (this.selectedWorkshop) {
          this.openDetail(this.selectedWorkshop);
        }
        this.loadWorkshops();
      },
      error: (err) => this.toast.error(err?.error?.message || 'No se pudo eliminar.'),
    });
  }

  toggleEditionStatus(edition: any) {
    this.workshopService.toggleEditionStatus(edition.id).subscribe({
      next: (res) => {
        edition.status = res.status;
        this.toast.success(res.message);
      },
      error: () => this.toast.error('No se pudo cambiar el estado.'),
    });
  }

  openEditionDetail(edition: any) {
    this.selectedEdition = null;
    this.editionDetailModalOpen = true;
    this.loadingEditionDetail = true;
    this.workshopService.getEditionConcepts(edition.id).subscribe({
      next: (res) => {
        this.selectedEdition = { ...edition, concepts: res.concepts };
        this.loadingEditionDetail = false;
      },
      error: () => {
        this.loadingEditionDetail = false;
        this.toast.error('Error al cargar conceptos');
      },
    });
  }

  closeEditionDetail() {
    this.editionDetailModalOpen = false;
    this.selectedEdition = null;
  }

}
