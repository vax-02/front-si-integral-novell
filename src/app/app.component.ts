import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseToastComponent } from "./shared/base-toast/base-toast.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BaseToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front-si-integral-novell';
}
