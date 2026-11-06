import { Component } from '@angular/core';
import { ChangePasswordComponent } from '../change-password/change-password.component';

@Component({
  selector: 'app-settings',
  imports: [ChangePasswordComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

}
