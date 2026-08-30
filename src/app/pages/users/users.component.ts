import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { UserService } from '../../service/user.service';
import { DocenteService } from '../../service/docente.service';
import { DegreeService } from '../../service/degree.service';
import { StudentService } from '../../service/student.service';
import { CareerService } from '../../service/career.service';
import { ParallelService } from '../../service/parallel.service';
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
  // ── Modal Docente ──────────────────────────────────────────────────────
  modalDocente = false;
  loadingDocente = false;
  degrees: any[] = [];
  degreeId: number | null = null;
  documentos = {
    hojaVida: false,
    tituloProfesional: false,
    ciCopia: false,
    certificados: false,
  };
  userCreatedId: number | null = null;
  userCreatedData: any = null;
  initialRoleIds: number[] = [];

  // ── Modal Estudiante ──────────────────────────────────────────────────
  modalEstudiante = false;
  loadingEstudiante = false;
  careers: any[] = [];
  parallels: any[] = [];
  studentData = {
    career_id: null as number | null,
    parallel_id: null as number | null,
    convalidation_type: '' as 'BTH' | 'Tecnico_Medio' | '',
    birth_certificate: false,
    school_diploma: false,
    carnet: false,
  };

  constructor(
    private userService: UserService,
    private docenteService: DocenteService,
    private degreeService: DegreeService,
    private studentService: StudentService,
    private careerService: CareerService,
    private parallelService: ParallelService,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
    this.loadDegrees();
    this.loadCareers();

    this.form.get('ci')?.valueChanges.subscribe(() => {
      const control = this.f['ci'];
      if (control.errors?.['ciExists']) {
        const { ciExists: _ciExists, ...rest } = control.errors;
        control.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
    this.form.get('email')?.valueChanges.subscribe(() => {
      const control = this.f['email'];
      if (control.errors?.['emailExists']) {
        const { emailExists: _emailExists, ...rest } = control.errors;
        control.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
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
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Error al cargar los usuarios');
        },
      });
  }

  loadDegrees() {
    this.degreeService.getDegrees().subscribe({
      next: (data) => {
        this.degrees = data.degrees ?? data;
      },
      error: () => {
        this.toast.error('Error al cargar grados académicos');
      },
    });
  }

  loadCareers() {
    this.careerService.getCareersForSelect().subscribe({
      next: (data) => {
        this.careers = data.careers ?? data;
      },
      error: () => {
        this.toast.error('Error al cargar carreras');
      },
    });
  }

  onCareerChange() {
    this.studentData.parallel_id = null;
    this.parallels = [];
    if (this.studentData.career_id) {
      this.parallelService.getParallelsForCareerForNewStudent(this.studentData.career_id).subscribe({
        next: (data) => {
          this.parallels = data.parallels ?? data;
        },
        error: () => {
          this.toast.error('Error al cargar paralelos');
        },
      });
    }
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
            this.f['ci'].setErrors({ ciExists: true });
          }
          if (error.error.errors.email) {
            this.f['email'].setErrors({ emailExists: true });
          }
        }
      },
    });
  }
  cancel() {
    this.userModalCreate = false;
    this.editingUserId = null;
    this.f['role_id'].setValidators([Validators.required]);
    this.f['role_id'].updateValueAndValidity();
    this.f['ci'].setValidators([
      Validators.required,
      Validators.pattern(/^\d{5,12}$/),
      Validators.minLength(5),
      Validators.maxLength(12),
    ]);
    this.f['ci'].updateValueAndValidity();
    this.form.reset({ status: 1 });
  }

  openCreateModal() {
    this.editingUserId = null;
    this.f['role_id'].setValidators([Validators.required]);
    this.f['role_id'].updateValueAndValidity();
    this.f['ci'].setValidators([
      Validators.required,
      Validators.pattern(/^\d{5,12}$/),
      Validators.minLength(5),
      Validators.maxLength(12),
    ]);
    this.f['ci'].updateValueAndValidity();
    this.form.reset({ status: 1 });
    this.userModalCreate = true;
  }

  openEditModal(user: any) {
    this.editingUserId = user.id;
    this.f['role_id'].clearValidators();
    this.f['role_id'].updateValueAndValidity();
    this.f['ci'].clearValidators();
    this.f['ci'].updateValueAndValidity();
    this.form.patchValue({
      nombre: user.name || '',
      apellido_paterno: user.first_lastname || '',
      apellido_materno: user.second_lastname || '',
      ci: user.ci || '',
      role_id: user.roles?.[0]?.id ?? null,
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
      next: (response) => {
        const user = this.users.find((u) => u.id === id);
        if (user) {
          user.status = response.status ?? (user.status ? 0 : 1);
        }
        this.toast.success('Estado del usuario actualizado exitosamente');
      },
      error: (err) => {
        const message = err.error?.message || 'Error al actualizar el estado del usuario';
        this.toast.error(message);
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
    this.userRoles = (user.roles ?? []).map((role: any) => ({ role }));
    this.initialRoleIds = (user.roles ?? []).map((r: any) => r.id);
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
    const isAddingDocente = roleIds.includes(Roles.DOCENTE.id) && !this.initialRoleIds.includes(Roles.DOCENTE.id);
    const isAddingEstudiante = roleIds.includes(Roles.ESTUDIANTE.id) && !this.initialRoleIds.includes(Roles.ESTUDIANTE.id);

    if (isAddingDocente || isAddingEstudiante) {
      this.userCreatedId = this.selectedUserId;
      this.pendingRoleIds = roleIds;
      this.pendingForms = [];
      this.modalRoles = false;

      if (isAddingDocente) this.pendingForms.push('docente');
      if (isAddingEstudiante) this.pendingForms.push('estudiante');

      this.openNextForm();
      return;
    }

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
      },
    });
  }

  openNextForm() {
    const next = this.pendingForms.shift();
    if (next === 'docente') {
      this.resetDocenteForm();
      this.modalDocente = true;
    } else if (next === 'estudiante') {
      this.resetStudentForm();
      this.modalEstudiante = true;
    } else {
      this.syncRolesAndClose();
    }
  }

  syncRolesAndClose() {
    if (!this.userCreatedId || this.pendingRoleIds.length === 0) {
      this.resetModalState();
      return;
    }

    this.loadingModal = true;
    this.userService.syncUserRoles(this.userCreatedId, this.pendingRoleIds).subscribe({
      next: () => {
        this.loadingModal = false;
        this.toast.success('Roles actualizados exitosamente');
        this.resetModalState();
        this.loadUsers();
      },
      error: () => {
        this.loadingModal = false;
        this.toast.error('Error al actualizar los roles');
        this.resetModalState();
      },
    });
  }

  resetModalState() {
    this.userCreatedId = null;
    this.pendingRoleIds = [];
    this.pendingForms = [];
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
        this.toast.success('Contraseña restablecida exitosamente');
      },
      error: (err) => {
        const message = err.error?.message || 'Error al restablecer la contraseña';
        this.toast.error(message);
        this.resetLoading = false;
      },
    });
  }

  // ── Modal Docente ──────────────────────────────────────────────────────
  resetDocenteForm() {
    this.degreeId = null;
    this.documentos = {
      hojaVida: false,
      tituloProfesional: false,
      ciCopia: false,
      certificados: false,
    };
  }

  cancelDocente() {
    this.modalDocente = false;
    this.resetDocenteForm();
    this.openNextForm();
  }

  pendingRoleIds: number[] = [];
  pendingForms: ('docente' | 'estudiante')[] = [];

  saveDocente() {
    if (!this.degreeId) {
      this.toast.error('El grado académico es requerido');
      return;
    }

    this.loadingDocente = true;

    const payload = {
      user_id: this.userCreatedId,
      degree_id: this.degreeId,
      cv: this.documentos.hojaVida,
      professional_title: this.documentos.tituloProfesional,
      carnet: this.documentos.ciCopia,
      certificate: this.documentos.certificados,
    };

    this.docenteService.createDocenteFromUser(payload).subscribe({
      next: () => {
        this.loadingDocente = false;
        this.modalDocente = false;
        this.resetDocenteForm();
        this.toast.success('Docente creado exitosamente');
        this.openNextForm();
      },
      error: (err) => {
        this.loadingDocente = false;
        const message = err.error?.message || 'Error al crear el docente';
        this.toast.error(message);
      },
    });
  }

  hasDocenteRole(): boolean {
    return this.userRoles.some((r) => (r.role?.id ?? r.id) === Roles.DOCENTE.id);
  }

  // ── Modal Estudiante ──────────────────────────────────────────────────
  resetStudentForm() {
    this.studentData = {
      career_id: null,
      parallel_id: null,
      convalidation_type: '',
      birth_certificate: false,
      school_diploma: false,
      carnet: false,
    };
    this.parallels = [];
  }

  cancelStudent() {
    this.modalEstudiante = false;
    this.resetStudentForm();
    this.openNextForm();
  }

  saveStudent() {
    if (!this.studentData.career_id) {
      this.toast.error('La carrera es requerida');
      return;
    }
    if (!this.studentData.parallel_id) {
      this.toast.error('El paralelo es requerido');
      return;
    }

    this.loadingEstudiante = true;

    const payload: any = {
      user_id: this.userCreatedId,
      career_id: this.studentData.career_id,
      parallel_id: this.studentData.parallel_id,
      birth_certificate: this.studentData.birth_certificate,
      school_diploma: this.studentData.school_diploma,
      carnet: this.studentData.carnet,
    };

    if (this.studentData.convalidation_type) {
      payload.convalidation_type = this.studentData.convalidation_type;
    }

    this.studentService.createStudentFromUser(payload).subscribe({
      next: () => {
        this.loadingEstudiante = false;
        this.modalEstudiante = false;
        this.resetStudentForm();
        this.toast.success('Estudiante creado exitosamente');
        this.openNextForm();
      },
      error: (err) => {
        this.loadingEstudiante = false;
        const message = err.error?.message || 'Error al crear el estudiante';
        this.toast.error(message);
      },
    });
  }
}
