import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface RadioButtonOption {
  label: string;
  value: string | number | boolean;
}

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radio-button.component.html'
})
export class RadioButtonComponent {
  control = input.required<FormControl>();
  options = input.required<RadioButtonOption[]>();
  
  // Generamos un identificador único y estable para agrupar los inputs correctamente
  uniqueName = `radio-group-${Math.random().toString(36).substring(2, 9)}`;
}