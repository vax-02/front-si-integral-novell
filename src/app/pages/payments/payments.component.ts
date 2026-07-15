import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { StudentService } from '../../service/student.service';
import { Student } from '../students/students.component';
import { ToastService } from '../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { PayService } from '../../service/pay.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
    CommonModule,
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
})
export class PaymentsComponent {
  registerModalOpen = false;
  detailModalOpen = false;
  loading: boolean = false;
  loadingModalData: boolean = false
  modalDetail: boolean = false;
  currentPage = 1;
  perPage = 10;
  search: string = '';
  totalStudents = 0;
  lastPage = 1;
  students: Student[] = [];
  studentSelected: Student = {
    id: 0,
    user_id: 0,
    career_id: 0,
    user: {
      id: 0,
      name: '',
      first_lastname: '',
      second_lastname: '',
      email: '',
      ci: '',
      status: 0,
    },
    careers: [],
  };
  pays : any = []
  constructor(
    private studentService: StudentService,
    private payServie: PayService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadStudents();
  }
  openRegisterModal() {
    this.registerModalOpen = true;
  }
  openDetailModal() {
    this.detailModalOpen = true;
  }

  savePayment() {
    // Lógica para guardar el pago
    console.log('Pago guardado');
    this.registerModalOpen = false;
  }

  loadStudents() {
    this.loading = true;
    this.studentService
      .getStudents(this.currentPage, this.perPage, this.search)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.totalStudents = response.total;
          this.currentPage = response.students.current_page;
          this.lastPage = response.students.last_page;
          this.students = response.students.data;
          console.log(this.students);
        },
        error: (err) => {
          this.loading = false;
          this.toast.error('Error al cargar estudiantes');
          console.log(err);
        },
      });
  }
  openDetail(student: any) {
    this.studentSelected = student;
    this.modalDetail = true;
    this.loadingModalData = true
    this.payServie.getPays(student.id).subscribe({
      next: (response) => {
        console.log(response);
        this.pays = response.pays
        this.loadingModalData = false
      },
      error: (err) => {
        this.loadingModalData = false

      },
    });
  }
  get from() {
    return (this.currentPage - 1) * this.perPage + 1;
  }

  get to() {
    return Math.min(this.currentPage * this.perPage, this.totalStudents);
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
}
