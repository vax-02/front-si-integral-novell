import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { UserService } from '../../service/user.service';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { ToastService } from '../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users',
  imports: [
    ButtonComponent,
    BaseModalComponent,
    BaseInputComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  private searchTimeout: any;
  form!: FormGroup;
  users: any[] = [];
  roles = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Secretaria' },
    { id: 3, name: 'Docente' },
    { id: 4, name: 'Estudiante' },
  ];
  
  cards = {
    tAdmins: 0,
    tSecres: 0,
    tDoc: 0,
    tEst: 0,
  };
  search: string = '';
  currentPage = 1;
  perPage = 10;

  lastPage = 1;
  totalUsers = 0;
  userModalCreate = false;
  loading = false;
  loadingModal = false;
  constructor(
    private userService: UserService,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }
  initForm() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido_paterno: ['', Validators.required],
      apellido_materno: [''],
      ci: ['', Validators.required, Validators.pattern(/^\d{5,12}$/), Validators.minLength(5), Validators.maxLength(12)],
      role_id: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      celular: ['', Validators.pattern(/^\d{8}$/)],
    });
  }
  loadUsers() {
    this.loading = true;
    this.userService
      .getUsers(this.currentPage, this.perPage, this.search)
      .subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Usuarios cargados:', response);
          this.totalUsers = response.total_users;

          this.cards.tAdmins = response.total_admins;
          this.cards.tSecres = response.total_secretarias;
          this.cards.tDoc = response.total_docentes;
          this.cards.tEst = response.total_estudiantes;

          this.currentPage = response.users.current_page;
          this.lastPage = response.users.last_page;
          //this.totalUsers = response.total;
          this.users = response.users.data;
          console.log('Usuarios cargados:', this.users);
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Error al cargar los usuarios');
          console.log('Error al cargar los usuarios:', error);
        },
      });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loadingModal = true;
    const data = {
        'role_id' : this.form.value.role_id,
        'ci' : this.form.value.ci,
        'name' : this.form.value.nombre,
        'first_lastname' : this.form.value.apellido_paterno,
        'second_lastname' : this.form.value.apellido_materno,
        'email' : this.form.value.email,
        'password' : this.form.value.password,
        'cellphone' : this.form.value.celular,
        'status' : this.form.value.status,
    };

    this.userService.createUser(data).subscribe({
      next: () => {
        this.loadingModal = false;
        this.userModalCreate = false;

        this.form.reset();

        this.loadUsers(); 
        this.toast.success('Usuario creado exitosamente');
      },
      error: () => {
        this.loadingModal = false;
        this.toast.error('Error al crear el usuario');
      },
    });
  }
  cancel() {
    this.userModalCreate = false;
    this.form.reset();
  }
  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }
  get from() {
    return (this.currentPage - 1) * this.perPage + 1;
  }

  get to() {
    return Math.min(this.currentPage * this.perPage, this.totalUsers);
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1; // reset página
      this.loadUsers();
    }, 400);
  }
}
