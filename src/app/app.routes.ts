import { Routes } from '@angular/router';
import { PresentationComponent } from './pages/presentation/presentation.component';
import { LoginComponent } from './pages/login/login.component';
import  {LayoutComponent} from './components/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { StudentsComponent } from './pages/students/students.component';
import { DocentesComponent } from './pages/docentes/docentes.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { CalificationsComponent } from './pages/califications/califications.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ProgramsComponent } from './pages/programs/programs.component';
import { UsersComponent } from './pages/users/users.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';

export const routes: Routes = [
  // Ruta para el Home
  { path: '', component: PresentationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component:  LayoutComponent, children: [
    { path: 'dashboard', component: HomeComponent },
    { path: 'students', component: StudentsComponent },
    { path: 'docentes', component: DocentesComponent },
    { path: 'payments', component: PaymentsComponent },
    { path: 'califications', component: CalificationsComponent },
    { path: 'attendance', component: AttendanceComponent },
    { path: 'programs', component: ProgramsComponent },
    { path: 'users', component: UsersComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'settings', component: SettingsComponent, children: [
      { path: 'general', component: RegistrationComponent },
    ]},
    { path: 'profile', component: ProfileComponent  },
    { path: 'password', component: ChangePasswordComponent  },


  ] },

  // Redirección por defecto: si el usuario no escribe nada, va a /home
  { path: '', redirectTo: '', pathMatch: 'full' },

  // Ruta comodín: si escriben cualquier cosa que no existe, va a /home
  { path: '**', redirectTo: 'home' },
];
