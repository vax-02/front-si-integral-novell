import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DocenteService } from '../../service/docente.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';

@Component({
  selector: 'app-schedule-docente',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,

  ],
  templateUrl: './schedule-docente.component.html',
  styleUrl: './schedule-docente.component.css'
})
export class ScheduleDocenteComponent {
  private searchTimeout: any;
  docenteSeleccionado: any = null;
  modalViewDocente : boolean = false
  search = '';
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  loading : boolean = false

  totalDocentes : number = 0;
  activeCount: number = 0;
  inactiveCount : number = 0;
  docentes: any[] = [];


  constructor(private docenteService: DocenteService,private toast : ToastService){}

  ngOnInit(){
    this.loadDocentes();
  }
  loadDocentes(): void {
    this.loading = true;
    this.docenteService
      .getDocentes(this.currentPage, this.perPage, this.search)
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.totalDocentes = data.total ?? 0;
          this.activeCount = data.activos ?? 0;
          this.inactiveCount = data.inactivos ?? 0;
          this.currentPage = data.docentes.current_page;
          this.lastPage = data.docentes.last_page;
          this.docentes = data.docentes.data;
        },
        error: (err) => {
          this.loading = false;
          this.toast.error('Error al cargar docentes');
        },
      });
  }

  openViewDocente(docente: any): void {
    this.docenteSeleccionado = docente;
    this.modalViewDocente = true;
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadDocentes();
    }, 400);
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadDocentes();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDocentes();
    }
  }

  get from(): number {
    return (this.currentPage - 1) * this.perPage + 1;
  }
  get to(): number {
    return Math.min(this.currentPage * this.perPage, this.totalDocentes);
  }

}
