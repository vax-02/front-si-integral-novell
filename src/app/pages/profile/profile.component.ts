import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { BaseModalComponent } from '../../shared/base-modal/base-modal.component';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService, User } from '../../core/services/auth.service';
import { Roles } from '../../core/constants/roles.constants';
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
export class ProfileComponent {
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
    this.loading = true;
    if (this.profileForm.valid) {
      const phoneValue = this.profileForm.get('phone')?.value;
      const data = {
        phone: phoneValue,
      };
      this.userService.updateProfile(this.user.id, data).subscribe({
        next: (response) => {
          this.user!.cellphone = phoneValue;
          localStorage.setItem('user', JSON.stringify(this.user));

          this.loading = false;
          this.editModalStudent = false;
          this.toast.success('Perfil actualizado');
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Erro al actualizar');
        },
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.profileForm.markAllAsTouched();
    }
  }

  // Cancelar edición
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
    console.log(this.auth.user)
  }
}
