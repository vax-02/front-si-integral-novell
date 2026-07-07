import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { CareerService } from '../../service/career.service';
import { CareerForSelect } from '../../interfaces/career';
import { StudentService } from '../../service/student.service';
import { ToastService } from '../../shared/services/toast.service';

interface Student {
  id: number;
  user_id: number;
  career_id: number;
  status: number;
  user: {
    id: number;
    name: string;
    first_lastname: string;
    second_lastname: string;
    email: string;
    ci: string | number;
  };
  career: {
    id: number;
    name: string;
  };
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

  registerModalStudent = false;
  viewModalStudent = false;
  editModalStudent = false;
  optionModalStudent = false;
  careersForSelect: CareerForSelect[] = [];

  constructor(
    private careerService: CareerService,
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
        },
        error: (err) => {
          this.loading = false;
          this.toast.error('Error al cargar estudiantes');
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
  saveStudent() {
    this.registerModalStudent = false;
  }
  openModalStudent() {
    this.registerModalStudent = true;
  }
  openModalView() {
    this.viewModalStudent = true;
  }
  openModalEdit() {
    this.editModalStudent = true;
  }
  openModalOption() {
    this.optionModalStudent = true;
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
