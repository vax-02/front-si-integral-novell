import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() icon: string ='';

  @Input() label: string = '';

  @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';

  @Input() disabled: boolean = false;

  @Input() fullWidth: boolean = false;

  @Output() click = new EventEmitter<void>();

  get classes(): string {
    const base =
      'px-2 py-2 rounded-md font-semibold transition duration-200 focus:outline-none';

    const variants = {
      primary:
        'bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-800 shadow-sm',
      secondary:
        'bg-slate-200 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
      tertiary:
        'bg-transparent border text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    };

    const disabledStyle = 'opacity-50 cursor-not-allowed';
    const width = this.fullWidth ? 'w-full' : '';

    return `${base} ${variants[this.variant]} ${width} ${
      this.disabled ? disabledStyle : ''
    }`;
  }
}