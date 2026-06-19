import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  // Señales para estado de UI (carga, error general, mostrar/ocultar password)
  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly showPassword = signal(false);

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

    const credentials = {
      email: this.loginForm.getRawValue().email.trim(),
      password: this.loginForm.getRawValue().password,
    };

    if (credentials.email == 'est@gmail.com') {
      localStorage.setItem('userRole', 'student');
      this.router.navigate(['/home/my-subjects']);
    } else if (credentials.email == 'prof@gmail.com') {
      localStorage.setItem('userRole', 'my-subjects');
      this.router.navigate(['/home/professor']);
    } else if (credentials.email == 'admin@gmail.com') {
      localStorage.setItem('userRole', 'admin');
      this.router.navigate(['/home/dashboard']);
    }

    

  }
}
