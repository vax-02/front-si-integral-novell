import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button.component';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { StudentService } from '../../service/student.service';
import { Student } from '../students/students.component';
import { ToastService } from '../../shared/services/toast.service';
import { PayService } from '../../service/pay.service';
import { ConceptService } from '../../service/concept.service';
import { API_ENDPOINTS } from '../../config/api-endpoints';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
    BaseModalConfirmComponent,
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
})
export class PaymentsComponent {

  anularLoading : boolean = false
  modalConfirm : boolean = false
  payIdSelectd : number = 0
paymentForm = {
  career_id: null,
  concept_id: null,
  amount: 0,
  discount: 0,
  description: ''
};
  private searchTimeout: any;
  registerModalOpen = false;
  detailModalOpen = false;
  loading: boolean = false;
  modalPay : boolean = false
  loadingModalData: boolean = false
  modalDetail: boolean = false;
  modalReceipt: boolean = false;
  currentPage = 1;
  perPage = 10;
  search: string = '';
  totalStudents = 0;
  lastPage = 1;
  students: Student[] = [];
  studentSelected: Student = {
    id: 0,
    student_careers : [],
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

  totalPays : number = 0
  totalPaysForMonth : number = 0
  pays : any = []
  conceptsFiltered: any[] = [];
  conceptSelected: any = null;
  detailConcept: any = null;
  savingPay: boolean = false;
  payCreated: any = null;

  get currentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }

  get currentMonthName(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[new Date().getMonth()];
  }

  constructor(
    private studentService: StudentService,
    private payServie: PayService,
    private conceptService: ConceptService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadStudents();
    this.loadCards();
  }
  loadCards(){
    this.payServie.getDataCards().subscribe({
      next : (response) =>{
        this.totalPays = response.total_pays
        this.totalPaysForMonth = response.pays_for_month;
      },
      error : (err) =>{

      }
    });
  }
  openRegisterModal() {
    this.registerModalOpen = true;
  }
  openDetailModal() {
    this.detailModalOpen = true;
  }

  savePayment() {
    if (!this.paymentForm.concept_id) {
      this.toast.warning('Seleccione un concepto');
      return;
    }
    if (this.paymentForm.amount <= 0) {
      this.toast.warning('El monto debe ser mayor a 0');
      return;
    }

    this.savingPay = true;
    const data = {
      student_id: this.studentSelected.id,
      concept_id: this.paymentForm.concept_id,
      amount: this.paymentForm.amount,
      discount: this.paymentForm.discount || 0,
      description: this.paymentForm.description || null,
    };

    this.payServie.createPay(data).subscribe({
      next: (response) => {
        this.savingPay = false;
        this.payCreated = response.pay;
        this.modalPay = false;
        this.modalReceipt = true;
        this.openDetail(this.studentSelected)
        this.loadCards();
      },
      error: (err) => {
        this.savingPay = false;
        this.toast.error('Error al registrar el pago');
        console.log(err);
      }
    });
  }

  printReceipt() {
    if (!this.payCreated) return;
    this.printReceiptForId(this.payCreated.id);
  }
  printReceiptForId(receiptId : number){
    this.payServie.getReceipt(receiptId).subscribe({
      next: (blob: Blob) =>{
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
      },
      error: (err) => {
        console.log('asd----------'+err)
      }
    })
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
        console.log(err);

      },
    });
  }
  openPay(student :any){
    this.modalPay = true;
    this.studentSelected = student;
    this.conceptsFiltered = [];
    this.conceptSelected = null;
    this.detailConcept = null;
    this.paymentForm = {
      career_id: null,
      concept_id: null,
      amount: 0,
      discount: 0,
      description: ''
    };
  }

  loadConceptsByCareer(careerId: number) {
    if (!careerId) {
      this.conceptsFiltered = [];
      this.conceptSelected = null;
      this.detailConcept = null;
      this.paymentForm.concept_id = null;
      this.paymentForm.amount = 0;
      this.paymentForm.description = '';
      return;
    }
    this.conceptService.getConcepts({ career_id: careerId, per_page: 100 }).subscribe({
      next: (response) => {
        this.conceptsFiltered = response.data || [];
        this.conceptSelected = null;
        this.detailConcept = null;
        this.paymentForm.concept_id = null;
        this.paymentForm.amount = 0;
        this.paymentForm.description = '';
      },
      error: (err) => {
        this.toast.error('Error al cargar conceptos');
        console.log(err);
      }
    });
  }

  onConceptChange() {
    const conceptId = this.paymentForm.concept_id;
    if (!conceptId) {
      this.conceptSelected = null;
      this.detailConcept = null;
      this.paymentForm.amount = 0;
      this.paymentForm.description = '';
      return;
    }
    this.conceptSelected = this.conceptsFiltered.find(c => c.id == conceptId);
    if (this.conceptSelected) {
      this.paymentForm.amount = this.conceptSelected.amount;
      this.detailConcept = this.conceptSelected;
      // Auto-generar descripción si es Mensualidad
      if (this.conceptSelected.type === 'Mensualidad') {
        this.paymentForm.description = `Mensualidad de ${this.currentMonthName}`;
      } else {
        this.paymentForm.description = this.conceptSelected.description || '';
      }
    }
  }
  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadStudents();
    }, 400);
  }
  anularPay(){
    this.anularLoading = true
    this.payServie.anularPay(this.payIdSelectd).subscribe({
      next: (response) =>{
        this.toast.info('Pago anulado correctamente');
        this.openDetail(this.studentSelected)
        this.anularLoading = false
        this.modalConfirm = false
      },
      error: (err) =>{
        this.toast.info('Error al anular pago');
        this.anularLoading = false
      }
    })
  }
  confirmAnular(payId : number){
    this.modalConfirm = true;
    this.payIdSelectd = payId
    
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