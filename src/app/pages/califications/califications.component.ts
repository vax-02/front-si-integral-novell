import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { CareersResponse } from '../../interfaces/career';
import { CareerService } from '../../service/career.service';
import { ToastService } from '../../shared/services/toast.service';
@Component({
  selector: 'app-califications',
  imports: [FormsModule,CommonModule, ButtonComponent, BaseModalComponent],
  templateUrl: './califications.component.html',
  styleUrl: './califications.component.css',
})
export class CalificationsComponent {
  data: CareersResponse = {
     Careers: [],
     total: 0,
     totalSubjects: 0,
     careersActivas: 0,
  };
  loading = false;

  modalViewProgram: boolean = false;
  modalDetailSubjetcs: boolean = false;

  loadingModalDetails: boolean = false;
  careerSelected: any = null;
  activeCareerId: number | null = null;
  
  constructor(private careerService: CareerService, private toast : ToastService){}

  ngOnInit() {
    this.loadCareers();
  }

  loadCareers() {
    this.loading = true;
    this.careerService.getCareers().subscribe({
      next: (response) => {
        this.loading = false;
        this.data.Careers = response.careers;
        this.data.total = response.total;
        this.data.totalSubjects = response.totalSubjects;
        this.data.careersActivas = response.careersActivas;
        console.log(response)
      },
      error: (err) => {
        this.loading = false;
        this.toast.error('Error al cargar las carreras');
        console.log('error en la carga de carreras')
        console.log(err)

      },
    });
  }
  openViewProgram(id: number) {
    this.modalViewProgram = true;
    this.loadingModalDetails = true;
    this.careerSelected = null;
    this.activeCareerId = id;

    this.loadCareerDetails(id);
  }
  closeViewProgram() {
    this.modalViewProgram = false;
    this.loadingModalDetails = false;
    this.careerSelected = null;
  }

  toNumeral(val: number) : string{
    switch(val){
      case 1: return 'Primer'
      case 2: return 'Segundo'
      case 3: return 'Tercer'
      case 4: return 'Cuarto'
      case 5: return 'Quinto'
      case 6: return 'Sexto'
      default : return ''
    }
  }

  getSubjectName(id: number): string {
    const allSubjects =
      this.careerSelected?.subjects_by_level?.flatMap((g: any) => g.subjects) ||
      [];

    const subject = allSubjects.find((s: any) => s.id === id);

    return subject ? subject.sigla : '—';
  }

  modalQualification : boolean = false
  openModalQualification(subject : any){
    this.modalQualification = true
  }
  private loadCareerDetails(id: number) {
    this.careerService.getCareerById(id).subscribe({
      next: (response) => {
        this.loading = false;
        this.loadingModalDetails = false;
        this.careerSelected = response;
        //console.log(this.careerSelected)
      },
      error: () => {
        this.loading = false;
        this.loadingModalDetails = false;
        this.toast.error('Error al cargar los detalles de la carrera');
      },
    });
  }

}
