import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-16 text-center text-slate-400">
      <i class="fas {{ icon }} text-3xl mb-3 opacity-60"></i>
      <p class="text-sm">{{ message }}</p>
    </div>
  `,
  styles: [],
})
export class EmptyStateComponent {
  @Input() icon = 'fa-chart-simple';
  @Input() message = 'Sin datos disponibles';
}
