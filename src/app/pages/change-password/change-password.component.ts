import { Component, inject } from '@angular/core';

import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user.service';
import { ToastService } from '../../shared/services/toast.service';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return password === confirm ? null : { passwordMismatch: true };
}
@Component({
  selector: 'app-change-password',
  imports: [
    ButtonComponent,
    BaseInputComponent,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  loading = false;

  form = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  get currentPassword() {
    return this.form.get('currentPassword');
  }

  get newPassword() {
    return this.form.get('newPassword');
  }

  get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  constructor(private auth:AuthService){}
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data = {
      password: this.form.get('currentPassword')?.value,
      new: this.form.get('newPassword')?.value,
    };

    this.userService.changePassword(data).subscribe({
      next: (response) => {
        this.toast.success('Contraseña actualizada');
        this.form.reset();
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Error al actualizar contraseña');
        this.loading = false;
      },
    });
  }
}
