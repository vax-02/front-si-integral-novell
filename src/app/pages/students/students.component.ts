import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { CareerService } from '../../service/career.service';
import { ConceptService } from '../../service/concept.service';
import { CareerForSelect } from '../../interfaces/career';
import { StudentService } from '../../service/student.service';
import { ToastService } from '../../shared/services/toast.service';

export interface Student {
  id: number;
  user_id: number;
  career_id: number;
  student_careers : any[],
  user: {
    id: number;
    name: string;
    first_lastname: string;
    second_lastname: string;
    email: string;
    ci: string | number;
    status: number
  };
  careers: (CareerForSelect & { pivot?: { status: string } })[];
}
interface Card {
  total: number;
  actives: number;
  inactives: number;
}
@Component({
  selector: 'app-students',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent {
  private searchTimeout: any;
  tipo: string = '';
  students: Student[] = [];
  dataCards: Card = {
    total: 0,
    actives: 0,
    inactives: 0,
  };

  search: string = '';
  currentPage = 1;
  perPage = 10;
  lastPage = 1;
  totalStudents = 0;
  loading = false;
  saving = false;

    registerModalStudent = false;
  viewModalStudent = false;
  editModalStudent = false;
  optionModalStudent = false;
    careersForSelect: CareerForSelect[] = [];
  selectedStudent: Student | null = null;

  // Propiedades del formulario de inscripción/edición
  enrollment = {
    name: '',
    first_lastname: '',
    second_lastname: '',
    ci: '',
    email: '',
    cellphone: '',
    career_id: null as number | null,
    turno: '',
    gestion: new Date().getFullYear().toString(),
    birth_certificate: false,
    school_diploma: false,
    carnet: false,
  };

  // Propiedades para adición de carrera
  newCareer = {
    career_id: null as number | null,
    turno: '',
    gestion: new Date().getFullYear().toString(),
  };

  // Conceptos de pago cargados desde el backend (solo informativo)
  conceptosCarrera: any[] = [];
  matriculaConcept: any = null;
  mensualidadConcept: any = null;
  sinConceptos: boolean = false;
  loadingConceptos: boolean = false;

  constructor(
    private careerService: CareerService,
    private conceptService: ConceptService,
    private studentService: StudentService,
    private toast: ToastService,
  ) {}
  ngOnInit() {
    this.loadCareersForSelect();
    this.loadStudents();
  }
  loadCareersForSelect() {
    this.careerService.getCareersForSelect().subscribe({
      next: (response) => {
        this.careersForSelect = response.careers;
      },
      error: (err) => {
        this.toast.error('Error al cargar carreras');
      },
    });
  }
  loadStudents() {
    this.loading = true;
    this.studentService
      .getStudents(this.currentPage, this.perPage, this.search)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.totalStudents = response.total;
          this.dataCards.total = response.total;
          this.dataCards.actives = response.actives;
          this.dataCards.inactives = response.inactive;

          this.currentPage = response.students.current_page;
          this.lastPage = response.students.last_page;
          this.students = response.students.data;
          console.log(this.students)
        },
        error: (err) => {
          this.loading = false;
          this.toast.error('Error al cargar estudiantes');
          console.log(err);
        },
      });
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadStudents();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadStudents();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadStudents();
  }

  get from() {
    return (this.currentPage - 1) * this.perPage + 1;
  }

  get to() {
    return Math.min(this.currentPage * this.perPage, this.totalStudents);
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadStudents();
    }, 400);
  }

  // ============ Manejo del formulario de inscripción ============

  openModalStudent() {
    this.resetEnrollmentForm();
    this.registerModalStudent = true;
  }

  resetEnrollmentForm() {
    this.enrollment = {
      name: '',
      first_lastname: '',
      second_lastname: '',
      ci: '',
      email: '',
      cellphone: '',
      career_id: null,
      turno: '',
      gestion: new Date().getFullYear().toString(),
      birth_certificate: false,
      school_diploma: false,
      carnet: false,
    };
    this.conceptosCarrera = [];
    this.matriculaConcept = null;
    this.mensualidadConcept = null;
    this.sinConceptos = false;
    this.saving = false;
  }

  onCareerChange() {
    if (!this.enrollment.career_id || !this.enrollment.gestion) {
      this.conceptosCarrera = [];
      this.matriculaConcept = null;
      this.mensualidadConcept = null;
      this.sinConceptos = false;
      return;
    }

    this.loadingConceptos = true;
    this.sinConceptos = false;
    this.matriculaConcept = null;
    this.mensualidadConcept = null;

    const filters = {
      career_id: this.enrollment.career_id,
      gestion: this.enrollment.gestion,
      per_page: 50,
    };

    this.conceptService.getConcepts(filters).subscribe({
      next: (response) => {
        this.loadingConceptos = false;
        this.conceptosCarrera = response.data.data || [];

        if (this.conceptosCarrera.length === 0) {
          this.sinConceptos = true;
          return;
        }

        // Buscar conceptos de matrícula y mensualidad (solo informativo)
        this.matriculaConcept = this.conceptosCarrera.find(
          (c: any) => c.type === 'MATRICULA' && c.is_active
        );
        this.mensualidadConcept = this.conceptosCarrera.find(
          (c: any) => c.type === 'MENSUALIDAD' && c.is_active
        );
      },
      error: (err) => {
        this.loadingConceptos = false;
        this.sinConceptos = true;
      },
    });
  }

  validarFormulario(): boolean {
    if (!this.enrollment.name) { this.toast.error('El nombre es requerido'); return false; }
    if (!this.enrollment.first_lastname) { this.toast.error('El apellido paterno es requerido'); return false; }
    if (!this.enrollment.ci) { this.toast.error('El C.I. es requerido'); return false; }
    if (!this.enrollment.email) { this.toast.error('El correo electrónico es requerido'); return false; }
    if (!this.enrollment.career_id) { this.toast.error('Seleccione una carrera'); return false; }
    if (!this.enrollment.turno) { this.toast.error('Seleccione un turno'); return false; }
    if (this.sinConceptos) {
      this.toast.warning('No hay conceptos de pago configurados para esta carrera y gestión. Los pagos se generarán cuando se creen.');
    }
    return true;
  }

    saveStudent() {
    if (!this.validarFormulario()) return;
    this.saving = true;

    const data = {
      name: this.enrollment.name,
      first_lastname: this.enrollment.first_lastname,
      second_lastname: this.enrollment.second_lastname,
      ci: this.enrollment.ci,
      email: this.enrollment.email,
      cellphone: this.enrollment.cellphone,
      career_id: this.enrollment.career_id,
      turno: this.enrollment.turno,
      gestion: this.enrollment.gestion,
      birth_certificate: this.enrollment.birth_certificate,
      school_diploma: this.enrollment.school_diploma,
      carnet: this.enrollment.carnet,
    };

    if (this.editModalStudent && this.selectedStudent) {
      this.studentService.updateStudent(this.selectedStudent.id, data).subscribe({
        next: (response) => {
          this.saving = false;
          this.toast.success(response.message || 'Estudiante actualizado exitosamente');
          this.editModalStudent = false;
          this.loadStudents();
        },
        error: (err) => {
          this.saving = false;
          this.toast.error(err.error?.error || 'Error al actualizar estudiante');
        }
      });
    } else {
      this.studentService.createStudent(data).subscribe({
        next: (response) => {
          this.saving = false;
          this.toast.success(response.message || 'Estudiante inscrito exitosamente');
          this.registerModalStudent = false;
          this.loadStudents();
        },
        error: (err) => {
          this.saving = false;
          const msg = err.error?.error || 'Error al inscribir estudiante';
          this.toast.error(msg);
        },
      });
    }
  }

  openModalView(student: Student) {
    this.selectedStudent = student;
    this.viewModalStudent = true;
  }

  openModalEdit(student: Student) {
    this.selectedStudent = student;
    this.enrollment = {
      name: student.user.name,
      first_lastname: student.user.first_lastname,
      second_lastname: student.user.second_lastname,
      ci: student.user.ci.toString(),
      email: student.user.email,
      cellphone: '', // Si el backend no lo envía en la lista, se puede cargar con getStudent
      career_id: student.career_id,
      turno: '', // Igual que celular
      gestion: new Date().getFullYear().toString(),
      birth_certificate: false,
      school_diploma: false,
      carnet: false,
    };
    
    // Cargar datos completos si es necesario
    this.studentService.getStudent(student.id).subscribe(res => {
      const s = res.student;
      this.enrollment.cellphone = s.cellphone || '';
      this.enrollment.turno = s.turno || '';
      this.enrollment.birth_certificate = !!s.birth_certificate;
      this.enrollment.school_diploma = !!s.school_diploma;
      this.enrollment.carnet = !!s.carnet;
    });

    this.editModalStudent = true;
  }

  openModalOption(student: Student) {
    this.selectedStudent = student;
    this.optionModalStudent = true;
    this.newCareer = {
      career_id: null,
      turno: '',
      gestion: new Date().getFullYear().toString()
    };
  }

  addCareer() {
    if (!this.newCareer.career_id || !this.newCareer.turno) {
      this.toast.error('Complete los datos de la nueva carrera');
      return;
    }
    this.saving = true;
    const data = {
      student_id: this.selectedStudent?.id,
      career_id: this.newCareer.career_id,
      turno: this.newCareer.turno,
      gestion: this.newCareer.gestion
    };

    this.studentService.addCareer(data).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Carrera adicionada correctamente');
        this.optionModalStudent = false;
        this.loadStudents();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.error || 'Error al adicionar carrera');
      }
    });
  }

  withdraw(careerId: number) {
    if (!confirm('¿Está seguro de dar de baja al estudiante de esta carrera?')) return;
    this.studentService.withdrawCareer(this.selectedStudent!.id, careerId).subscribe({
      next: () => {
        this.toast.success('Baja procesada');
        this.loadStudents();
        this.optionModalStudent = false;
      },
      error: (err) => this.toast.error(err.error?.error || 'Error al procesar baja')
    });
  }

  reinstate(careerId: number) {
    this.studentService.reinstateCareer(this.selectedStudent!.id, careerId).subscribe({
      next: () => {
        this.toast.success('Readmisión procesada');
        this.loadStudents();
        this.optionModalStudent = false;
      },
      error: (err) => this.toast.error(err.error?.error || 'Error al procesar readmisión')
    });
  }


  saveBaja() {
    if (this.tipo === 'baja') {
      // estado = INACTIVO
    }
    if (this.tipo === 'congelado') {
      // estado = CONGELADO
    }
  }
}