import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { Roles } from '../../core/constants/roles.constants';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { AuthService } from '../../core/services/auth.service';
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
  loading = signal(false);
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

  constructor(private auth: AuthService) {}
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

    this.userService.login(credentials.email, credentials.password).subscribe({
      next: (response) => {
        const currentRole = [...response.user.roles].sort(
          (a: any, b: any) => a.id - b.id,
        )[0];
        
        response.user.currentRole = currentRole;
        this.auth.saveSession(response.token, response.user);
        switch (currentRole.id) {
          case Roles.ADMIN.id:
            this.router.navigate(['/home/dashboard']);
            break;

          case Roles.DOCENTE.id:
            this.router.navigate(['/home/professor']);
            break;
          case Roles.ESTUDIANTE.id:
            this.router.navigate(['/home/student']);
            break;
          default:
            this.router.navigate(['/home']);
        }
        this.loading.set(false);
      },
      error: (error) => {
        switch (error.error.code) {
          case 'CREDENCIALES':
            this.msg_error = 'Correo o contraseña incorrectos';
            break;
          case 'INACTIVO':
            this.msg_error = 'Tu cuenta está inactiva';
            break;
          default:
            this.msg_error = 'Error inesperado';
        }
        this.loading.set(false);
      },
    });
  }
}
