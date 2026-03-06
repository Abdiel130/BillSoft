import { Component, input, computed, signal, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './input.component.html',
    styleUrl: './input.component.css'
})
export class InputComponent {
    control = input.required<FormControl>();
    label = input.required<string>();
    type = input<string>('text');
    placeholder = input<string>('');
    icon = input<string>(''); // For SVG paths or simple icons

    isFocused = signal(false);

    hasError = computed(() => {
        const c = this.control();
        return c && c.invalid && (c.dirty || c.touched);
    });

    errorMessage = computed(() => {
        const c = this.control();
        if (!c || !c.errors) return '';
        if (c.errors['required']) return 'Este campo es requerido';
        if (c.errors['email']) return 'Correo electrónico inválido';
        if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
        return 'Campo inválido';
    });

    onFocus() {
        this.isFocused.set(true);
    }

    onBlur() {
        this.isFocused.set(false);
    }
}
