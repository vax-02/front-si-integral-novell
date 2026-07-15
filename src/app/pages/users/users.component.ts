import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { UserService } from '../../service/user.service';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseModalConfirmComponent } from '../../shared/base-modal-confirm/base-modal-confirm.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { ToastService } from '../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Roles, RolesList } from '../../core/constants/roles.constants';

@Component({
  selector: 'app-users',
  imports: [
    ButtonComponent,
    BaseModalComponent,
    BaseModalConfirmComponent,
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
  userRoles: any[] = [];
  roles = Roles;
  RolesList = RolesList;
  modalRoles: boolean = false;
  subtitleModalRoles: string = '';
  selectedUserId: number | null = null;
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
  editingUserId: number | null = null;
  modalConfirmReset = false;
  selectedResetUserId: number | null = null;
  resetLoading = false;
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
      ci: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{5,12}$/),
          Validators.minLength(5),
          Validators.maxLength(12),
        ],
      ],
      role_id: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      celular: [
        '',
        [
          Validators.pattern(/^\d{8}$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ],
      ],
    });
  }

  get f() {
    return this.form.controls;
  }
  loadUsers() {
    this.loading = true;
    this.userService
      .getUsers(this.currentPage, this.perPage, this.search)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.totalUsers = response.total_users;

          this.cards.tAdmins = response.total_admins;
          this.cards.tSecres = response.total_secretarias;
          this.cards.tDoc = response.total_docentes;
          this.cards.tEst = response.total_estudiantes;

          this.currentPage = response.users.current_page;
          this.lastPage = response.users.last_page;
          this.users = response.users.data;
          console.log(response.users.data);
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Error al cargar los usuarios');
          console.log(error);
        },
      });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loadingModal = true;
    const payload: any = {
      role_id: this.form.value.role_id,
      ci: this.form.value.ci,
      name: this.form.value.nombre,
      first_lastname: this.form.value.apellido_paterno,
      second_lastname: this.form.value.apellido_materno,
      email: this.form.value.email,
      cellphone: this.form.value.celular,
      status: 1,
    };

    const request$ = this.editingUserId
      ? this.userService.updateUser(this.editingUserId, payload)
      : this.userService.createUser(payload);

    const isEdit = !!this.editingUserId;

    request$.subscribe({
      next: () => {
        this.loadingModal = false;
        this.userModalCreate = false;
        this.editingUserId = null;
        this.form.reset({ status: 1 });

        this.loadUsers();
        this.toast.success(
          isEdit
            ? 'Usuario actualizado exitosamente'
            : 'Usuario creado exitosamente',
        );
      },
      error: (error) => {
        this.loadingModal = false;
        this.toast.error(
          isEdit
            ? 'Error al actualizar el usuario'
            : 'Error al crear el usuario',
        );
        if (error.error && error.error.errors) {
          if (error.error.errors.ci) {
            this.toast.error('Ese C.I. ya fue registrado');
          }
          if (error.error.errors.email) {
            this.toast.error('Ese correo electrónico ya fue registrado');
          }
        }
      },
    });
  }
  cancel() {
    this.userModalCreate = false;
    this.editingUserId = null;
    this.form.reset({ status: 1 });
  }

  openCreateModal() {
    this.editingUserId = null;
    this.form.reset({ status: 1 });
    this.userModalCreate = true;
  }

  openEditModal(user: any) {
    this.editingUserId = user.id;
    this.form.patchValue({
      nombre: user.name || '',
      apellido_paterno: user.first_lastname || '',
      apellido_materno: user.second_lastname || '',
      ci: user.ci || '',
      role_id: user.role?.id ?? null,
      email: user.email || '',
      celular: user.cellphone || '',
      password: '',
      status: user.status ?? 1,
    });
    this.userModalCreate = true;
  }

  get modalTitle(): string {
    return this.editingUserId ? 'Editar usuario' : 'Crear usuario';
  }

  get confirmText(): string {
    return this.editingUserId ? 'Actualizar' : 'Crear';
  }

  toggleUserStatus(id: number) {
    this.userService.changeStatus(id).subscribe({
      next: () => {
        const user = this.users.find((u) => u.id === id);

        if (user) {
          user.status = user.status ? 0 : 1;
        }

        this.toast.success('Estado del usuario actualizado exitosamente');
      },
      error: (error) => {
        this.toast.error('Error al actualizar el estado del usuario');
      },
    });
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
  openManageRoles(user: any) {
    this.modalRoles = true;
    this.subtitleModalRoles =
      user.name + ' ' + user.first_lastname + ' ' + user.second_lastname;
    this.selectedUserId = user.id;
    this.userRoles =  user.user_role ?? []
    console.log(this.userRoles)
  }

  hasRole(roleId: number): boolean {
    return this.userRoles.some((role) => role.role.id === roleId);
  }
  toggleRole(role: any) {
    const exists = this.hasRole(role.id);

    if (exists) {
      this.userRoles = this.userRoles.filter((r) => r.role.id !== role.id);
    } else {
      this.userRoles.push({ role });
    }
  }
  changeRoles(){
    if (!this.selectedUserId) return;

    const roleIds = this.userRoles.map((r: any) => r.role?.id ?? r.id);

    this.loadingModal = true;
    this.userService.syncUserRoles(this.selectedUserId, roleIds).subscribe({
      next: () => {
        this.loadingModal = false;
        this.modalRoles = false;
        this.selectedUserId = null;
        this.toast.success('Roles actualizados exitosamente');
        this.loadUsers();
      },
      error: (error) => {
        this.loadingModal = false;
        this.toast.error('Error al actualizar los roles');
        console.log(error);
      },
    });
  }

  openResetPasswordModal(user: any) {
    this.selectedResetUserId = user.id;
    this.modalConfirmReset = true;
  }

  cancelResetPassword() {
    this.modalConfirmReset = false;
    this.selectedResetUserId = null;
  }

  confirmResetPassword() {
    if (!this.selectedResetUserId) return;

    this.resetLoading = true;
    this.userService.resetPassword(this.selectedResetUserId).subscribe({
      next: () => {
        this.resetLoading = false;
        this.modalConfirmReset = false;
        this.selectedResetUserId = null;
        this.toast.success('Contraseña reestablecida exitosamente');
      },
      error: (error) => {
        this.resetLoading = false;
        this.toast.error('Error al reestablecer la contraseña');
        console.log(error);
      },
    });
  }
}
