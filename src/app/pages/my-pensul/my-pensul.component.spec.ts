import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPensulComponent } from './my-pensul.component';

describe('MyPensulComponent', () => {
  let component: MyPensulComponent;
  let fixture: ComponentFixture<MyPensulComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPensulComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPensulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
