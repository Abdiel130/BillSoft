import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.css'
})
export class ButtonComponent {
    label = input.required<string>();
    type = input<'button' | 'submit'>('button');
    variant = input<'primary' | 'secondary' | 'outline'>('primary');
    disabled = input<boolean>(false);
    loading = input<boolean>(false);
    fullWidth = input<boolean>(false);

    onClick = output<void>();

    handleClick(event: Event) {
        if (!this.disabled() && !this.loading()) {
            this.onClick.emit();
        }
    }
}
