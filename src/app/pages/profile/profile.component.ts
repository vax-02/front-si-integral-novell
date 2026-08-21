import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService, User } from '../../core/services/auth.service';
import { Roles } from '../../core/constants/roles.constants';
import { getDefaultRoute } from '../../core/guards/role.guard';

@Component({
  selector: 'app-profile',
  imports: [
    BaseModalComponent,
    BaseInputComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  editModalStudent = false;
  loading = false;
  profileForm!: FormGroup;
  user!: User;
  Roles = Roles;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router,
  ) {
    this.user = this.auth.user!;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      phone: [
        this.user?.cellphone || '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(8),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
    });
  }

  getIniciales(nombre: string = ''): string {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  openEditModal(): void {
    this.editModalStudent = true;
    this.profileForm.patchValue({
      phone: this.user?.cellphone || '',
    });
  }

  updateProfile(): void {
    if (!this.user) return;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const phoneValue = this.profileForm.get('phone')?.value;
    const data = { phone: phoneValue };

    this.userService.updateProfile(this.user.id, data).subscribe({
      next: () => {
        this.user.cellphone = phoneValue;
        this.auth.updateUser(this.user);
        this.loading = false;
        this.editModalStudent = false;
        this.toast.success('Perfil actualizado correctamente');
      },
      error: (err) => {
        const message = err.error?.message || 'Error al actualizar el perfil';
        this.toast.error(message);
        this.loading = false;
      },
    });
  }

  cancelEdit(): void {
    this.editModalStudent = false;
    this.profileForm.reset();
  }

  get phone() {
    return this.profileForm.get('phone');
  }

  showRoles = false;

  changeRole(role: any) {
    this.auth.updateCurrentRole(role);
    this.user.currentRole = role;
    this.showRoles = false;
    this.router.navigate([getDefaultRoute(role.id)]);
  }
}
