import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CareerService } from '../../service/career.service';
import { ParallelService } from '../../service/parallel.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-califications',
  imports: [FormsModule, CommonModule],
  templateUrl: './califications.component.html',
  styleUrl: './califications.component.css',
})
export class CalificationsComponent implements OnInit {
  careers: any[] = [];
  courses: any[] = [];
  parallels: any[] = [];

  careerId: number | null = null;
  courseId: number | null = null;
  parallelId: number | null = null;
  year: number | null = null;
  years: number[] = [];

  selectedCareer: any = null;
  selectedCourse: any = null;
  selectedParallel: any = null;

  loadingCareers = false;
  loadingCourses = false;
  loadingParallels = false;
  loadingGrades = false;

  subjects: any[] = [];
  students: any[] = [];
  summary: any = null;
  careerInfo: any = null;
  courseInfo: any = null;
  parallelInfo: any = null;

  searchStudent = '';

  constructor(
    private careerService: CareerService,
    private parallelService: ParallelService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadCareers();
    this.loadYears();
  }

  loadYears() {
    this.careerService.getGradeYears().subscribe({
      next: (resp) => {
        this.years = Array.isArray(resp?.years)
          ? resp.years.map((y: any) => Number(y))
          : [];
        if (this.years.length > 0) {
          this.year = this.years[0];
        }
      },
      error: () => {
        this.toast.error('Error al cargar las gestiones');
      },
    });
  }

  onYearChange() {
    if (this.parallelId) {
      this.loadGeneralGrades();
    }
  }

  get filteredStudents(): any[] {
    if (!this.searchStudent.trim()) return this.students;
    const term = this.searchStudent.toLowerCase();
    return this.students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        String(s.ci).toLowerCase().includes(term)
    );
  }

  loadCareers() {
    this.loadingCareers = true;
    this.careerService.getCareersForSelect().subscribe({
      next: (resp) => {
        this.loadingCareers = false;
        this.careers = Array.isArray(resp?.careers) ? resp.careers : [];
      },
      error: () => {
        this.loadingCareers = false;
        this.toast.error('Error al cargar las carreras');
      },
    });
  }

  onCareerChange() {
    this.courses = [];
    this.parallels = [];
    this.subjects = [];
    this.students = [];
    this.summary = null;
    this.courseId = null;
    this.parallelId = null;
    this.selectedCourse = null;
    this.selectedParallel = null;
    this.careerInfo = null;
    this.courseInfo = null;
    this.parallelInfo = null;
    this.selectedCareer =
      this.careers.find((c) => c.id === this.careerId) || null;

    if (!this.careerId) return;

    this.loadingCourses = true;
    this.careerService.getCoursesByCareer(this.careerId).subscribe({
      next: (resp) => {
        this.loadingCourses = false;
        const courses = resp?.courses?.data ?? resp?.courses;
        this.courses = Array.isArray(courses) ? courses : [];
      },
      error: () => {
        this.loadingCourses = false;
        this.toast.error('Error al cargar los cursos');
      },
    });
  }

  onCourseChange() {
    this.parallels = [];
    this.subjects = [];
    this.students = [];
    this.summary = null;
    this.parallelId = null;
    this.selectedParallel = null;
    this.courseInfo = null;
    this.parallelInfo = null;
    this.selectedCourse =
      this.courses.find((c) => c.id === this.courseId) || null;

    if (!this.courseId) return;

    this.loadingParallels = true;
    this.parallelService.getParallelsByCourse(this.courseId).subscribe({
      next: (resp) => {
        this.loadingParallels = false;
        this.parallels = Array.isArray(resp?.parallels) ? resp.parallels : [];
      },
      error: () => {
        this.loadingParallels = false;
        this.toast.error('Error al cargar los paralelos');
      },
    });
  }

  onParallelChange() {
    this.subjects = [];
    this.students = [];
    this.summary = null;
    this.parallelInfo = null;
    this.selectedParallel =
      this.parallels.find((p) => p.id === this.parallelId) || null;

    if (!this.parallelId) return;

    this.loadGeneralGrades();
  }

  loadGeneralGrades() {
    this.loadingGrades = true;
    this.searchStudent = '';
    this.careerService.getGeneralGrades(this.parallelId!, this.year ?? undefined).subscribe({
      next: (resp) => {
        this.subjects = Array.isArray(resp?.subjects) ? resp.subjects : [];
        this.students = Array.isArray(resp?.students) ? resp.students : [];
        this.summary = resp.summary || null;
        this.careerInfo = resp.career || null;
        this.courseInfo = resp.course || null;
        this.parallelInfo = resp.parallel || null;

        const available = Array.isArray(resp?.available_years)
          ? resp.available_years.map((y: any) => Number(y))
          : [];
        this.years = available;

        if (available.length > 0 && !available.includes(this.year)) {
          const previousYear = this.year;
          this.year = available[0];
          if (previousYear !== this.year) {
            this.loadGeneralGrades();
            return;
          }
        }

        this.loadingGrades = false;
      },
      error: () => {
        this.loadingGrades = false;
        this.toast.error('Error al cargar las calificaciones');
      },
    });
  }

  getGrade(student: any, subjectId: number): number | null {
    const grade = student.grades[subjectId];
    return grade !== undefined && grade !== null ? grade : null;
  }

  isApproved(grade: number | null): boolean {
    return grade !== null && grade >= 51;
  }

  trackSubject(_index: number, subject: any): number {
    return subject.id;
  }

  trackStudent(_index: number, student: any): number {
    return student.id;
  }
}
