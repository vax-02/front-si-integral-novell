import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleDocenteComponent } from './schedule-docente.component';

describe('ScheduleDocenteComponent', () => {
  let component: ScheduleDocenteComponent;
  let fixture: ComponentFixture<ScheduleDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleDocenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
