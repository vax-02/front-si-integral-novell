import { Component } from '@angular/core';

@Component({
  selector: 'app-change-password',
  imports: [],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  password = {
    current: '',
    new: '',
    confirm: '',
  };

  changePassword() {
    if (this.password.new !== this.password.confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }

    console.log(this.password);
  }
}
