import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocenteSubjectsComponent } from './docente-subjects.component';

describe('DocenteSubjectsComponent', () => {
  let component: DocenteSubjectsComponent;
  let fixture: ComponentFixture<DocenteSubjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocenteSubjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocenteSubjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
