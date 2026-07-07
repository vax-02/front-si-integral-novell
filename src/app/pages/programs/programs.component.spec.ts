import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProgramsComponent } from './programs.component';
import { CareerService } from '../../service/career.service';
import { ToastService } from '../../shared/services/toast.service';

describe('ProgramsComponent', () => {
  let component: ProgramsComponent;
  let fixture: ComponentFixture<ProgramsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramsComponent],
      providers: [
        { provide: CareerService, useValue: { getCareers: () => of({ careers: [], total: 0, totalSubjects: 0, careersActivas: 0 }) } },
        { provide: ToastService, useValue: { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show prerequisites for level 1 subjects', () => {
    component.careerSelected = {
      subjects_by_level: [
        { level: '1', subjects: [{ id: 1, name: 'Matemática I', sigla: 'MAT101', level: 1 }] },
        { level: '2', subjects: [{ id: 2, name: 'Matemática II', sigla: 'MAT201', level: 2 }] },
      ],
    };

    component.subjectForm.patchValue({ level: '1' });

    expect(component.availableSubjectsForPrerequisite).toEqual([]);
  });

  it('should allow prerequisites only from lower or same level for level 2+', () => {
    component.careerSelected = {
      subjects_by_level: [
        { level: '1', subjects: [{ id: 1, name: 'Matemática I', sigla: 'MAT101', level: 1 }] },
        { level: '2', subjects: [{ id: 2, name: 'Matemática II', sigla: 'MAT201', level: 2 }] },
        { level: '3', subjects: [{ id: 3, name: 'Matemática III', sigla: 'MAT301', level: 3 }] },
      ],
    };

    component.subjectForm.patchValue({ level: '2' });

    expect(component.availableSubjectsForPrerequisite.map((subject: any) => subject.id)).toEqual([1, 2]);
  });
});
