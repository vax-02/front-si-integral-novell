import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseToastComponent } from './base-toast.component';

describe('BaseToastComponent', () => {
  let component: BaseToastComponent;
  let fixture: ComponentFixture<BaseToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseToastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
