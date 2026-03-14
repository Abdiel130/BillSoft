import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  animations: [
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('islandScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92) translateY(30px)' }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', 
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.7, 0, 0.84, 0)', 
          style({ opacity: 0, transform: 'scale(0.92) translateY(30px)' }))
      ])
    ])
  ]
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('');
  width = input<string>('max-w-md'); // Permite ajustar el ancho
  
  onClose = output<void>();

  close() {
    this.onClose.emit();
  }
}