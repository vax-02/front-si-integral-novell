import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
function noDangerousCharsValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null;
  }

  const dangerousPattern = /['";<>`]|--|\/\*|\*\//;

  return dangerousPattern.test(value) ? { dangerousChars: true } : null;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, BaseInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  // Señales para estado de UI (carga, error general, mostrar/ocultar password)
  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly showPassword = signal(false);
  msg_error: string = '';

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
        noDangerousCharsValidator,
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        noDangerousCharsValidator,
      ],
    ],
  });

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.serverError.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    console.log(this.loading());

    const credentials = {
      email: this.loginForm.getRawValue().email.trim(),
      password: this.loginForm.getRawValue().password,
    };

    this.userService.login(credentials.email, credentials.password).subscribe({
      next: (response) => {
        console.log('Login correcto:', response);
        
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', JSON.stringify(response.token));


        if (response.user.role_id == 1) {
          this.router.navigate(['/home/dashboard']);
        } /*else if (response.user.role_id == 2) {
          localStorage.setItem('userRole', 'my-subjects');
          this.router.navigate(['/home/professor']);
        } else if (response.user.role_id == 3) {
          localStorage.setItem('userRole', 'admin');
          this.router.navigate(['/home/dashboard']);
        }*/
      },
      error: (error) => {
        this.msg_error = error.error.message;
      },
    });
    this.loading.set(false);
  }
}
