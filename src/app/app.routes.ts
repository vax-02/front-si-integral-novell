import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas (sin login): presentación y login independientes
  { path: '', loadComponent: () => import('./pages/presentation/presentation.component').then(m => m.PresentationComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },

  // Área autenticada
  { path: 'home', canActivate: [authGuard], component: LayoutComponent, children: [
    //docentes
    { path: 'professor/subjets', loadComponent: () => import('./docente-subjects/docente-subjects.component').then(m => m.DocenteSubjectsComponent) },
    { path: 'professor/grades', loadComponent: () => import('./docente-subjects/grades/grades.component').then(m => m.GradesComponent) },
    { path: 'professor/repository', loadComponent: () => import('./docente-subjects/repository/repository.component').then(m => m.RepositoryComponent) },

    //estudiantes
    { path: 'my-subjects', loadComponent: () => import('./pages/my-subjects/my-subjects.component').then(m => m.MySubjectsComponent) },
    { path: 'my-schedule', loadComponent: () => import('./pages/my-schedule/my-schedule.component').then(m => m.MyScheduleComponent) },
    { path: 'my-pensul', loadComponent: () => import('./pages/my-pensul/my-pensul.component').then(m => m.MyPensulComponent) },
    { path: 'materials', loadComponent: () => import('./pages/materials/materials.component').then(m => m.MaterialsComponent) },

    //admin
    { path: 'dashboard', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'students', loadComponent: () => import('./pages/students/students.component').then(m => m.StudentsComponent) },
    { path: 'docentes', loadComponent: () => import('./pages/docentes/docentes.component').then(m => m.DocentesComponent) },
    { path: 'payments', loadComponent: () => import('./pages/payments/payments.component').then(m => m.PaymentsComponent) },
    { path: 'payments-manage', loadComponent: () => import('./pages/payment-management/payment-management.component').then(m => m.PaymentManagementComponent) },

    { path: 'califications', loadComponent: () => import('./pages/califications/califications.component').then(m => m.CalificationsComponent) },
    { path: 'programs', loadComponent: () => import('./pages/programs/programs.component').then(m => m.ProgramsComponent) },
    { path: 'courses', loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent) },

    { path: 'schedule-docente', loadComponent: () => import('./pages/schedule-docente/schedule-docente.component').then(m => m.ScheduleDocenteComponent) },

    { path: 'subjects', loadComponent: () => import('./pages/subjects/subjects.component').then(m => m.SubjectsComponent) },
    { path: 'users', loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent) },

    { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent), children: [
      { path: 'general', loadComponent: () => import('./pages/registration/registration.component').then(m => m.RegistrationComponent) },
    ]},
    { path: 'institution', loadComponent: () => import('./pages/institution/institution.component').then(m => m.InstitutionComponent) },

    //general
    { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
    { path: 'password', loadComponent: () => import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent) },
  ] },

  // Ruta comodín: si escriben cualquier cosa que no existe, va a /home
  { path: '**', redirectTo: 'home' },
];
