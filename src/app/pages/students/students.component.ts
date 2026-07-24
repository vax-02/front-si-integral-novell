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
import { ParallelService } from '../../service/parallel.service';

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
  parallels: any[] = []
  tipo: string = '';
  modalParallels : boolean = false
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
  selectedStudent: any | null = null;

  // Propiedades del formulario de inscripción/edición
  enrollment = {
    name: '',
    first_lastname: '',
    second_lastname: '',
    ci: '',
    email: '',
    cellphone: '',
    parallel_id: 0,
    career_id: null as number | null,
    gestion: new Date().getFullYear().toString(),
    birth_certificate: false,
    school_diploma: false,
    carnet: false,
  };

  // Propiedades para adición de carrera
  newCareer = {
    career_id: null as number | null,
    parallel_id: null as number | null,
  };
  newCareerParallels: any[] = [];

  // Propiedades para el modal de opciones (3 tabs)
  optionTab: string = 'add-career'; // 'add-career' | 'change-parallel' | 'withdraw'
  // Para cambio de paralelo
  changeParallelCareerId: number | null = null;
  changeParallels: any[] = [];
  changeParallelId: number | null = null;
  studentCareers: any[] = [];

  // Conceptos de pago cargados desde el backend (solo informativo)
  conceptosCarrera: any[] = [];

  constructor(
    private careerService: CareerService,
    private conceptService: ConceptService,
    private studentService: StudentService,
    private parallelService: ParallelService,
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
      parallel_id : 0,
      gestion: new Date().getFullYear().toString(),
      birth_certificate: false,
      school_diploma: false,
      carnet: false,
    };
    this.parallels = [];
    this.saving = false;
  }

  onCareerChange() {
    if (!this.enrollment.career_id) {
      this.parallels = [];
      return;
    }
    this.parallelService.getParallelsForCareerForNewStudent(this.enrollment.career_id).subscribe({
        next: (response) =>{
          this.parallels = response.parallels;
          console.log(this.parallels);
        },
        error: (err) =>{

        }
    });
  }

  validarFormulario(): boolean {
    if (!this.enrollment.name) { this.toast.error('El nombre es requerido'); return false; }
    if (!this.enrollment.first_lastname) { this.toast.error('El apellido paterno es requerido'); return false; }
    if (!this.enrollment.ci) { this.toast.error('El C.I. es requerido'); return false; }
    if (!this.enrollment.email) { this.toast.error('El correo electrónico es requerido'); return false; }
    if (!this.enrollment.career_id) { this.toast.error('Seleccione una carrera'); return false; }
    return true;
  }
  validarFormularioUpdate(): boolean {
    if (!this.enrollment.name) { this.toast.error('El nombre es requerido'); return false; }
    if (!this.enrollment.first_lastname) { this.toast.error('El apellido paterno es requerido'); return false; }
    if (!this.enrollment.ci) { this.toast.error('El C.I. es requerido'); return false; }
    if (!this.enrollment.email) { this.toast.error('El correo electrónico es requerido'); return false; }
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
      parallel_id : this.enrollment.parallel_id,
      birth_certificate: this.enrollment.birth_certificate,
      school_diploma: this.enrollment.school_diploma,
      carnet: this.enrollment.carnet,
    };


    if (this.editModalStudent && this.selectedStudent) {
      this.studentService.updateStudent(this.selectedStudent.id, data).subscribe({
        next: (response) => {
          this.saving = false;
          this.toast.success('Estudiante actualizado exitosamente');
          this.editModalStudent = false;
          this.loadStudents();
        },
        error: (err) => {
          this.saving = false;
          this.toast.error('Error al actualizar estudiante');
        }
      });
    } else {
      this.studentService.createStudent(data).subscribe({
        next: (response) => {
          this.saving = false;
          this.toast.success('Estudiante inscrito exitosamente');
          this.registerModalStudent = false;
          this.loadStudents();
        },
        error: (err) => {
          this.saving = false;
          this.toast.error('Error al inscribir estudiante');
          console.log(err)
        },
      });
    }
  }

  updateStudent() {
    if (!this.validarFormularioUpdate()) return;
    this.saving = true;
  
    const data = {
      name: this.enrollment.name,
      first_lastname: this.enrollment.first_lastname,
      second_lastname: this.enrollment.second_lastname,
      ci: this.enrollment.ci,
      email: this.enrollment.email,
      cellphone: this.enrollment.cellphone,
      birth_certificate: this.enrollment.birth_certificate,
      school_diploma: this.enrollment.school_diploma,
      carnet: this.enrollment.carnet,
    };

    this.studentService.updateStudent(this.selectedStudent!.id, data).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.success('Estudiante actualizado exitosamente');
        this.editModalStudent = false;
        this.loadStudents();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error('Error al actualizar estudiante');
        console.log(err)
      }
    });
  }
  openModalView(student: Student) {
    this.selectedStudent = student;
    console.log(this.selectedStudent)
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
      career_id: null,
      parallel_id: 0,
      gestion: new Date().getFullYear().toString(),
      birth_certificate: false,
      school_diploma: false,
      carnet: false,
    };
    
    // Cargar datos completos si es necesario
    this.studentService.getStudent(student.id).subscribe({
      next: (res) =>{
        const s = res.student;
        this.enrollment.cellphone = s.cellphone || '';
        this.enrollment.birth_certificate = !!s.birth_certificate;
        this.enrollment.school_diploma = !!s.school_diploma;
        this.enrollment.carnet = !!s.carnet;
      },error: (err) =>{
        console.log(err)
      }
    });

    this.editModalStudent = true;
  }

  openModalOption(student: Student) {
    this.selectedStudent = student;
    this.optionModalStudent = true;
    this.optionTab = 'add-career';
    this.newCareer = {
      career_id: null,
      parallel_id: null 
    };
    this.changeParallelCareerId = null;
    this.changeParallels = [];
    this.changeParallelId = null;

    // Cargar las carreras del estudiante para el modal
    this.studentService.getStudent(student.id).subscribe(res => {
      this.studentCareers = res.student.student_careers || [];
    });
  }

  // ============ Pestaña 1: Adicionar Carrera ============

  onNewCareerCareerChange() {
    if (!this.newCareer.career_id) {
      this.newCareerParallels = [];
      this.newCareer.parallel_id = null;
      return;
    }
    this.parallelService.getParallelsForCareerForNewStudent(this.newCareer.career_id).subscribe({
      next: (response) => {
        this.newCareerParallels = response.parallels;
        this.newCareer.parallel_id = null;
      },
      error: () => {
        this.toast.error('Error al cargar paralelos');
      }
    });
  }

  isStudentInCareer(careerId: number): boolean {
    if (!this.selectedStudent?.student_careers) return false;
    return this.selectedStudent.student_careers.some(
      (sc: any) => sc.career_id === careerId || sc.career?.id === careerId
    );
  }

  addCareer() {
    if (!this.newCareer.career_id ) {
      this.toast.error('Seleccione una carrera');
      return;
    }
    // Validar que no esté ya inscrito
    if (this.isStudentInCareer(this.newCareer.career_id)) {
      this.toast.error('El estudiante ya está inscrito en esta carrera');
      return;
    }
    this.saving = true;
    const data = {
      student_id: this.selectedStudent?.id,
      career_id: this.newCareer.career_id,
      parallel_id: this.newCareer.parallel_id 
    };

    this.studentService.addCareer(data).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Carrera adicionada correctamente');
        this.loadStudents();
        // Recargar carreras del estudiante
        this.studentService.getStudent(this.selectedStudent!.id).subscribe(res => {
          this.studentCareers = res.student.student_careers || [];
        });
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.error || 'Error al adicionar carrera');
      }
    });
  }

  // ============ Pestaña 2: Cambiar de Paralelo ============

  onCareerForParallelChange() {
    if (!this.changeParallelCareerId) {
      this.changeParallels = [];
      return;
    }
    this.parallelService.getParallelsForCareerForNewStudent(this.changeParallelCareerId).subscribe({
      next: (response) => {
        this.changeParallels = response.parallels;
        this.changeParallelId = null;
      },
      error: () => {
        this.toast.error('Error al cargar paralelos');
      }
    });
  }

  saveChangeParallel() {
    if (!this.changeParallelCareerId) {
      this.toast.error('Seleccione una carrera');
      return;
    }
    if (!this.changeParallelId) {
      this.toast.error('Seleccione un paralelo');
      return;
    }
    this.saving = true;
    
    // Buscar el student_career_id correspondiente
    const careerEntry = this.studentCareers.find(
      (sc: any) => sc.career_id === this.changeParallelCareerId || sc.career?.id === this.changeParallelCareerId
    );

    this.studentService.updateStudentParallel(this.selectedStudent!.id, {
      career_id: this.changeParallelCareerId,
      parallel_id: this.changeParallelId
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Paralelo cambiado correctamente');
        this.loadStudents();
      },
      error: (err: any) => {
        this.saving = false;
        this.toast.error(err.error?.error || 'Error al cambiar paralelo');
      }
    });
  }

  // ============ Pestaña 3: Dar de Baja / Readmisión ============

  withdraw(careerId: number) {
    if (!confirm('¿Está seguro de dar de baja al estudiante de esta carrera?')) return;
    this.studentService.withdrawCareer(this.selectedStudent!.id, careerId).subscribe({
      next: () => {
        this.toast.success('Baja procesada');
        this.loadStudents();
        // Recargar carreras del estudiante
        this.studentService.getStudent(this.selectedStudent!.id).subscribe(res => {
          this.studentCareers = res.student.student_careers || [];
        });
      },
      error: (err) => this.toast.error(err.error?.error || 'Error al procesar baja')
    });
  }

  reinstate(careerId: number) {
    this.studentService.reinstateCareer(this.selectedStudent!.id, careerId).subscribe({
      next: () => {
        this.toast.success('Readmisión procesada');
        this.loadStudents();
        // Recargar carreras del estudiante
        this.studentService.getStudent(this.selectedStudent!.id).subscribe(res => {
          this.studentCareers = res.student.student_careers || [];
        });
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