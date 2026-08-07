import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import ApexCharts from 'apexcharts';

export type ChartFormatter = 'currency' | 'number' | 'percent';
export type ChartType = 'line' | 'bar' | 'area' | 'donut';

@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('chart', { static: true })
  chartElement!: ElementRef;

  @Input() series: ApexCharts.ApexOptions['series'] = [];
  @Input() categories: string[] = [];
  @Input() labels: string[] = [];
  @Input() chartType: ChartType = 'line';
  @Input() colors: string[] = ['#323294'];
  @Input() formatter: ChartFormatter = 'currency';
  @Input() horizontal = false;
  @Input() showLegend = false;
  @Input() currency = 'Bs.';
  @Input() light = false;

  private chart!: ApexCharts;
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.initialized &&
      (changes['series'] ||
        changes['categories'] ||
        changes['labels'] ||
        changes['chartType'])
    ) {
      this.renderChart();
    }
  }

  private formatValue(val: number): string {
    switch (this.formatter) {
      case 'currency':
        return `${this.currency} ${val.toLocaleString('es-BO')}`;
      case 'percent':
        return `${val.toLocaleString('es-BO')}%`;
      default:
        return val.toLocaleString('es-BO');
    }
  }

  private renderChart(): void {
    const isPie = this.chartType === 'donut';
    const hasData =
      Array.isArray(this.series) &&
      this.series.length > 0 &&
      (isPie
        ? this.series.every((v) => typeof v === 'number')
        : this.series.every(
            (s) =>
              Array.isArray((s as any)?.data) &&
              (s as any).data.length > 0,
          ));

    if (!hasData) {
      if (this.chart) {
        this.chart.destroy();
        this.chart = undefined as any;
      }
      return;
    }

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noAnimation = this.light || reduceMotion;

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: isPie ? 'donut' : this.chartType,
        height: '100%',
        width: '100%',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: !noAnimation,
          speed: 800,
          animateGradually: {
            enabled: !noAnimation,
          },
          dynamicAnimation: {
            enabled: !noAnimation,
            speed: 350,
          },
        },
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        foreColor: '#64748b',
      },
      series: this.series,
      colors: this.colors,
      ...(isPie ? { labels: this.labels } : {}),
      legend: {
        show: this.showLegend || isPie,
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '11px',
        fontWeight: 500,
        markers: {
          size: 5,
        },
        itemMargin: {
          horizontal: 8,
          vertical: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      fill: isPie
        ? undefined
        : this.light
          ? {
              type: 'solid',
              opacity: this.chartType === 'area' ? 0.12 : 1,
            }
          : {
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.08,
                stops: [0, 90, 100],
              },
            },
      plotOptions: isPie
        ? undefined
        : {
            bar: {
              horizontal: this.horizontal,
              borderRadius: this.horizontal ? 2 : 3,
              columnWidth: '55%',
              barHeight: '60%',
            },
          },
      xaxis: isPie
        ? undefined
        : {
            categories: this.categories,
            axisBorder: {
              show: false,
            },
            axisTicks: {
              show: false,
            },
            labels: {
              style: {
                fontSize: '11px',
                fontWeight: 500,
              },
            },
          },
      yaxis: isPie
        ? undefined
        : {
            labels: {
              style: {
                fontSize: '11px',
                fontWeight: 500,
              },
              formatter: (val: number) => this.formatValue(val),
            },
          },
      grid: isPie
        ? undefined
        : {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
            xaxis: {
              lines: {
                show: false,
              },
            },
          },
      stroke: isPie
        ? { width: 0 }
        : {
            curve: this.chartType === 'area' ? 'smooth' : 'straight',
            width: this.chartType === 'area' ? 2.5 : 0,
            lineCap: 'round',
          },
      tooltip: {
        theme: 'light',
        style: {
          fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
          fontSize: '12px',
        },
        y: {
          formatter: (val: number) => this.formatValue(val),
        },
      },
    };

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new ApexCharts(this.chartElement.nativeElement, options);
    this.chart.render();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
