import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';

import { ChartComponent } from './chart.component';

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback;
  observed = 0;
  targets: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    this.observed++;
    this.targets.push(target);
  }

  unobserve(): void {}

  disconnect(): void {}

  trigger(intersecting: boolean): void {
    this.callback(
      this.targets.map((target) => ({
        target,
        isIntersecting: intersecting,
        intersectionRatio: intersecting ? 1 : 0,
        boundingClientRect: new DOMRect(),
        intersectionRect: intersecting ? new DOMRect() : new DOMRect(),
        rootBounds: new DOMRect(),
        time: performance.now(),
        isVisible: intersecting,
      })),
      this as unknown as IntersectionObserver,
    );
  }
}

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let fakeObserver: FakeIntersectionObserver;
  let originalIO: typeof IntersectionObserver | undefined;

  const makeChartData = () => ({
    series: [{ name: 'Ingresos', data: [100, 200, 300] }],
    categories: ['Ene', 'Feb', 'Mar'],
  });

  beforeAll(() => {
    originalIO = (globalThis as any).IntersectionObserver;
  });

  beforeEach(async () => {
    fakeObserver = new FakeIntersectionObserver(() => {});
    (globalThis as any).IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        fakeObserver = new FakeIntersectionObserver(callback);
        return fakeObserver;
      }
      observe(target: Element): void {
        fakeObserver.observe(target);
      }
      unobserve(): void {}
      disconnect(): void {}
    };

    await TestBed.configureTestingModule({
      imports: [ChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    (globalThis as any).IntersectionObserver = originalIO;
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should observe the chart element on init', () => {
    expect(fakeObserver.observed).toBe(1);
  });

  it('should render a chart when it becomes visible', () => {
    component.series = makeChartData().series;
    component.categories = makeChartData().categories;
    component.chartType = 'bar';

    fakeObserver.trigger(true);

    expect((component as any).chart).toBeTruthy();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('should NOT render while the chart is out of viewport', () => {
    component.series = makeChartData().series;
    component.categories = makeChartData().categories;
    component.chartType = 'bar';

    fakeObserver.trigger(false);

    expect((component as any).chart).toBeFalsy();
    expect(fixture.nativeElement.querySelector('svg')).toBeFalsy();
  });

  it('should update existing chart on series change without recreating it', () => {
    component.series = makeChartData().series;
    component.categories = makeChartData().categories;
    component.chartType = 'bar';
    fakeObserver.trigger(true);

    const chart = (component as any).chart;
    expect(chart).toBeTruthy();
    spyOn(chart, 'updateSeries').and.callThrough();
    spyOn(chart, 'destroy').and.callThrough();

    component.ngOnChanges({
      series: new SimpleChange([], component.series, false),
    });

    expect(chart.updateSeries).toHaveBeenCalledWith(component.series, false);
    expect(chart.destroy).not.toHaveBeenCalled();
  });

  it('should recreate the chart when chartType changes', () => {
    component.series = makeChartData().series;
    component.categories = makeChartData().categories;
    component.chartType = 'bar';
    fakeObserver.trigger(true);

    const oldChart = (component as any).chart;
    expect(oldChart).toBeTruthy();

    component.chartType = 'donut';
    component.ngOnChanges({
      chartType: new SimpleChange('bar', 'donut', false),
    });

    const newChart = (component as any).chart;
    expect(newChart).toBeTruthy();
    expect(newChart).not.toBe(oldChart);
  });

  it('should not react to changes before first render', () => {
    const spy = jasmine.createSpy('ngOnChanges');
    component.ngOnChanges({
      series: new SimpleChange([], makeChartData().series, false),
    });
    expect((component as any).chart).toBeFalsy();
  });
});
