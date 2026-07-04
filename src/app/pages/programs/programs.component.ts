import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { CareerService } from '../../service/career.service';
import { ToastService } from '../../shared/services/toast.service';
import { CareersResponse } from '../../interfaces/career';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';

interface Subject {
  name: string;
  year: number;
  prerequisite: string | null;
}

@Component({
  selector: 'app-programs',
  imports: [
    CommonModule,
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
  ],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.css',
})
export class ProgramsComponent {
  modalViewProgram: boolean = false;
  modalDetailSubjetcs: boolean = false;

  loadingModalDetails: boolean = false;
  careerSelected: any = null;
  loading = false;
  data: CareersResponse = {
    Careers: [],
    total: 0,
    totalSubjects: 0,
    careersActivas: 0,
  };
  constructor(
    private careerService: CareerService,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {
    this.careerForm = this.fb.group({
      name: ['', Validators.required],
      duration: ['', Validators.required],
    });
  }
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
      },
      error: (error) => {
        this.loading = false;
        this.toast.error('Error al cargar las carreras');
      },
    });
  }
  openViewProgram(id: number) {
    this.modalViewProgram = true;
    this.loadingModalDetails = true;
    this.careerSelected = null;

    this.careerService.getCareerById(id).subscribe({
      next: (response) => {
        this.loading = false;
        this.loadingModalDetails = false;
        this.careerSelected = response;
      },
      error: (error) => {
        this.loading = false;
        this.loadingModalDetails = false;
        this.toast.error('Error al cargar los detalles de la carrera');
      },
    });
  }

  closeViewProgram() {
    this.modalViewProgram = false;
    this.loadingModalDetails = false;
    this.careerSelected = null;
  }

  modalCareer = false;

  modoIngreso: 'manual' | 'archivo' = 'manual';

  careerForm: FormGroup;

  years = [
    { value: 1, label: '1 Año' },
    { value: 2, label: '2 Años' },
    { value: 3, label: '3 Años' },
  ];

  subjects: Subject[] = [];

  selectedFile: File | null = null;

  abrirModal() {
    this.modalCareer = true;
  }

  cerrarModal() {
    this.modalCareer = false;
    this.resetForm();
  }

  agregarMateria() {
    this.subjects.push({
      name: '',
      year: 1,
      prerequisite: null,
    });
  }

  eliminarMateria(index: number) {
    this.subjects.splice(index, 1);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
    }
  }

  saveCareer() {
    this.modalDetailSubjetcs = true;
    /*
    if (this.careerForm.invalid) {
      this.careerForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.careerForm.value,
      subjects: this.subjects,
      file: this.selectedFile,
    };

    console.log(payload);

    // Aquí llamas a tu servicio
    // this.careerService.store(payload).subscribe(...)

    this.cerrarModal();*/
  }

  private resetForm() {
    this.careerForm.reset();

    this.subjects = [];

    this.selectedFile = null;

    this.modoIngreso = 'manual';
  }
  getSubjectName(id: number): string {
    const allSubjects =
      this.careerSelected?.subjects_by_level?.flatMap((g: any) => g.subjects) ||
      [];

    const subject = allSubjects.find((s: any) => s.id === id);

    return subject ? subject.sigla : '—';
  }
  dowloadTemplate() {
    this.careerService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_carreras.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.toast.error('Error al descargar la plantilla');
      },
    });
  }

  previewSubjects = [
    {
      level: '1er Semestre',
      code: 'MAT101',
      name: 'Matemática I',
      prerequisite: '',
      valid: true,
    },
    {
      level: '2do Semestre',
      code: 'MAT201',
      name: 'Matemática II',
      prerequisite: 'MAT101',
      valid: true,
    },
    {
      level: '3er Semestre',
      code: '',
      name: 'Programación II',
      prerequisite: 'INF101',
      valid: false,
    },
  ];

  validSubjects = 2;
  errorSubjects = 1;

  importErrors = [
    'Fila 5: La sigla de la materia está vacía.',
    'Fila 8: El prerequisito INF999 no existe.',
  ];
  saveStudyPlan() {
    // Aquí iría la lógica para guardar el plan de estudios
    this.toast.success('Plan de estudios guardado exitosamente.');
    this.modalDetailSubjetcs = false;
  }
}
