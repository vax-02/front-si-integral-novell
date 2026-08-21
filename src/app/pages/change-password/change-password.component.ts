import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user.service';
import { ToastService } from '../../shared/services/toast.service';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { ButtonComponent } from '../../shared/button/button.component';

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
    ReactiveFormsModule,
    CommonModule,
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data = {
      password: this.currentPassword?.value,
      new: this.newPassword?.value,
    };

    this.userService.changePassword(data).subscribe({
      next: () => {
        this.toast.success('Contraseña actualizada correctamente');
        this.form.reset();
        this.loading = false;
      },
      error: (err) => {
        const message = err.error?.message || 'Error al actualizar la contraseña';
        this.toast.error(message);
        this.loading = false;
      },
    });
  }
}
