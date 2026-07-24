import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocenteService } from '../service/docente.service';

@Component({
  selector: 'app-docente-subjects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './docente-subjects.component.html',
  styleUrl: './docente-subjects.component.css',
})
export class DocenteSubjectsComponent implements OnInit {
  subjects: any[] = [];
  loading = false;
  error = '';

  constructor(
    private docenteService: DocenteService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadMySubjects();
  }

  loadMySubjects() {
    this.loading = true;
    this.error = '';
    this.docenteService.getMySubjects().subscribe({
      next: (resp) => {
        this.loading = false;
        this.subjects = resp.subjects || [];
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al cargar las materias asignadas.';
        this.subjects = [];
      },
    });
  }

  /** Navegar a calificaciones de la materia */
  goToCalifications(subject: any) {
    this.router.navigate(['/home/professor/grades'], {
      queryParams: { subject_id: subject.id },
    });
  }

  /** Navegar al repositorio con la materia preseleccionada */
  goToRepository(subject: any) {
    this.router.navigate(['/home/professor/repository'], {
      queryParams: { subject_id: subject.id },
    });
  }
}
