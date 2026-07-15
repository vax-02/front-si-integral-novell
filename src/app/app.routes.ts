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
import { RegistrationComponent } from './pages/registration/registration.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { MySubjectsComponent } from './pages/my-subjects/my-subjects.component';
import { MyPensulComponent } from './pages/my-pensul/my-pensul.component';
import { MyScheduleComponent } from './pages/my-schedule/my-schedule.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';
import { authGuard } from './core/guards/auth.guard';
import { CoursesComponent } from './pages/courses/courses.component';
import { InstitutionComponent } from './pages/institution/institution.component';
import { PaymentManagementComponent } from './pages/payment-management/payment-management.component';
import { TrainingComponent } from './pages/training/training.component';

export const routes: Routes = [
  // Ruta para el Home
  { path: '', component: PresentationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', canActivate: [authGuard], component:  LayoutComponent, children: [
    //estudiantes
    { path: 'my-subjects', component: MySubjectsComponent },
    { path: 'my-schedule', component:  MyScheduleComponent },
    { path: 'my-pensul', component: MyPensulComponent },

    { path: 'dashboard', component: HomeComponent },
    { path: 'students', component: StudentsComponent },
    { path: 'docentes', component: DocentesComponent },
    { path: 'payments', component: PaymentsComponent },
    { path: 'payments-manage', component: PaymentManagementComponent },

    { path: 'califications', component: CalificationsComponent },
    { path: 'attendance', component: AttendanceComponent },
    { path: 'programs', component: ProgramsComponent },
    { path: 'courses', component: CoursesComponent },
    { path: 'training', component: TrainingComponent },


    { path: 'subjects', component: SubjectsComponent },
    { path: 'users', component: UsersComponent },
    
    { path: 'settings', component: SettingsComponent, children: [
      { path: 'general', component: RegistrationComponent },
    ]},
    { path: 'profile', component: ProfileComponent  },
    { path: 'password', component: ChangePasswordComponent  },
    { path: 'institution', component: InstitutionComponent  },
  ] },
  // Redirección por defecto: si el usuario no escribe nada, va a /home
  { path: '', redirectTo: '', pathMatch: 'full' },
  // Ruta comodín: si escriben cualquier cosa que no existe, va a /home
  { path: '**', redirectTo: 'home' },
];
