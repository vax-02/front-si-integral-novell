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
  @Input() chartType: 'line' | 'bar' | 'area' = 'line';
  @Input() colors: string[] = ['#2563eb'];

  private chart!: ApexCharts;
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && (changes['series'] || changes['categories'])) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    const options: ApexCharts.ApexOptions = {
      chart: {
        type: this.chartType,
        height: '100%',
        width: '100%',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      series: this.series,
      colors: this.colors,
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories: this.categories,
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `Bs. ${val.toLocaleString('es-BO')}`,
        },
      },
      grid: {
        borderColor: '#e2e8f0',
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `Bs. ${val.toLocaleString('es-BO')}`,
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
