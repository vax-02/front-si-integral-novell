import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { homeRoleGuard, roleGuard } from './core/guards/role.guard';
import { Roles } from './core/constants/roles.constants';

export const routes: Routes = [
  // Rutas públicas (sin login): presentación y login independientes
  { path: '', loadComponent: () => import('./pages/presentation/presentation.component').then(m => m.PresentationComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },

  // Área autenticada
  { path: 'home', canActivate: [authGuard], component: LayoutComponent, children: [
    { path: '', pathMatch: 'full', canActivate: [authGuard, homeRoleGuard], children: [] },

    //docentes
    { path: 'professor/subjets', canActivate: [roleGuard], data: { roles: [Roles.DOCENTE.id] }, loadComponent: () => import('./docente-subjects/docente-subjects.component').then(m => m.DocenteSubjectsComponent) },
    { path: 'professor/grades', canActivate: [roleGuard], data: { roles: [Roles.DOCENTE.id] }, loadComponent: () => import('./docente-subjects/grades/grades.component').then(m => m.GradesComponent) },
    { path: 'professor/repository', canActivate: [roleGuard], data: { roles: [Roles.DOCENTE.id] }, loadComponent: () => import('./docente-subjects/repository/repository.component').then(m => m.RepositoryComponent) },
    { path: 'my-attendance', canActivate: [roleGuard], data: { roles: [Roles.DOCENTE.id] }, loadComponent: () => import('./pages/my-attendance/my-attendance.component').then(m => m.MyAttendanceComponent) },

    //estudiantes
    { path: 'my-subjects', canActivate: [roleGuard], data: { roles: [Roles.ESTUDIANTE.id] }, loadComponent: () => import('./pages/my-subjects/my-subjects.component').then(m => m.MySubjectsComponent) },
    { path: 'my-schedule', canActivate: [roleGuard], data: { roles: [Roles.ESTUDIANTE.id] }, loadComponent: () => import('./pages/my-schedule/my-schedule.component').then(m => m.MyScheduleComponent) },
    { path: 'my-pensul', canActivate: [roleGuard], data: { roles: [Roles.ESTUDIANTE.id] }, loadComponent: () => import('./pages/my-pensul/my-pensul.component').then(m => m.MyPensulComponent) },
    { path: 'materials', canActivate: [roleGuard], data: { roles: [Roles.ESTUDIANTE.id] }, loadComponent: () => import('./pages/materials/materials.component').then(m => m.MaterialsComponent) },
    { path: 'my-payments', canActivate: [roleGuard], data: { roles: [Roles.ESTUDIANTE.id] }, loadComponent: () => import('./pages/student-payments/student-payments.component').then(m => m.StudentPaymentsComponent) },

    //secretaria
    { path: 'payments', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id, Roles.SECRETARIA.id] }, loadComponent: () => import('./pages/payments/payments.component').then(m => m.PaymentsComponent) },

    //admin
    { path: 'dashboard', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'students', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id, Roles.SECRETARIA.id] }, loadComponent: () => import('./pages/students/students.component').then(m => m.StudentsComponent) },
    { path: 'docentes', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/docentes/docentes.component').then(m => m.DocentesComponent) },
    { path: 'payments-manage', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/payment-management/payment-management.component').then(m => m.PaymentManagementComponent) },

    { path: 'califications', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/califications/califications.component').then(m => m.CalificationsComponent) },
    { path: 'programs', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/programs/programs.component').then(m => m.ProgramsComponent) },
    { path: 'courses', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent) },

    { path: 'schedule-docente', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/schedule-docente/schedule-docente.component').then(m => m.ScheduleDocenteComponent) },

    { path: 'subjects', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/subjects/subjects.component').then(m => m.SubjectsComponent) },
    { path: 'users', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent) },

    { path: 'settings', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent), children: [
      { path: 'general', loadComponent: () => import('./pages/registration/registration.component').then(m => m.RegistrationComponent) },
    ]},
    { path: 'institution', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id] }, loadComponent: () => import('./pages/institution/institution.component').then(m => m.InstitutionComponent) },

    //general
    { path: 'profile', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id, Roles.DOCENTE.id, Roles.ESTUDIANTE.id, Roles.SECRETARIA.id] }, loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
    { path: 'password', canActivate: [roleGuard], data: { roles: [Roles.ADMIN.id, Roles.DOCENTE.id, Roles.ESTUDIANTE.id, Roles.SECRETARIA.id] }, loadComponent: () => import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent) },
  ] },

  // Ruta comodín: si escriben cualquier cosa que no existe, va a /home
  { path: '**', redirectTo: 'home' },
];
