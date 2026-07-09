import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseInputComponent } from '../../shared/base-input/base-input.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { InstitutionService } from '../../service/institution.service';
import { ToastService } from '../../shared/services/toast.service';
@Component({
  selector: 'app-institution',
  imports: [
    CommonModule,
    BaseInputComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './institution.component.html',
  styleUrl: './institution.component.css',
})
export class InstitutionComponent {
  loading = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private intitutionService: InstitutionService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      address: ['', Validators.required],
      cellphone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{8,10}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
    });
    this.loadInfo();
  }
  loadInfo() {
    this.intitutionService.getInstitution().subscribe({
      next: (resp) => {
        this.form.patchValue({
          address: resp.address,
          cellphone: resp.cellphone,
          email: resp.email,
        });
      },
      error: () => {
        this.toast.error('Error al cargar los datos');
      },
    });
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data = this.form.value;
    this.intitutionService.updateInstitution(1, data).subscribe({
      next: () => {
        this.toast.success('Información actualizada');
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al actualizar');
        this.loading = false;
      },
    });
  }
}
