import { Component, OnInit } from '@angular/core';
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
export class InstitutionComponent implements OnInit {
  loading = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private institutionService: InstitutionService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      address: ['', [Validators.required, Validators.maxLength(255)]],
      cellphone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{8,10}$/)],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo(): void {
    this.institutionService.getInstitution().subscribe({
      next: (resp) => {
        this.form.patchValue({
          address: resp.address,
          cellphone: resp.cellphone,
          email: resp.email,
        });
      },
      error: () => {
        this.toast.error('Error al cargar los datos de la institución');
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

    this.institutionService.updateInstitution(data).subscribe({
      next: () => {
        this.toast.success('Información actualizada correctamente');
        this.loading = false;
      },
      error: (err) => {
        const message = err.error?.message || 'Error al actualizar la información';
        this.toast.error(message);
        this.loading = false;
      },
    });
  }
}
