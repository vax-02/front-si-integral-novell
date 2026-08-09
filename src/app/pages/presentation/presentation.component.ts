import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { InstitutionService } from '../../service/institution.service';
@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.css',
})
export class PresentationComponent implements AfterViewInit, OnInit {
  institution = {
    address: '',
    cellphone: '',
    email: '',
  };

  constructor(
    private router: Router,
    private institutionService: InstitutionService,
  ) {}

  ngOnInit(): void {
    this.loadInstitution();
  }

  loadInstitution(): void {
    this.institutionService.getPublicInstitution().subscribe({
      next: (res) => {
        this.institution.address = res?.address ?? '';
        this.institution.cellphone = res?.cellphone ?? '';
        this.institution.email = res?.email ?? '';
      },
      error: () => {
        this.institution.address = '';
        this.institution.cellphone = '';
        this.institution.email = '';
      },
    });
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }
}
