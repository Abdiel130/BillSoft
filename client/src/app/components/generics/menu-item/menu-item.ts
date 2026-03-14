import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LucideAngularModule } from 'lucide-angular';
import { MenuItem as IMenuItem, MenuState, Menu } from '../../menu/menu';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.css',
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0', opacity: 0, overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      transition('collapsed <=> expanded', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
    trigger('rotateIcon', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(90deg)' })),
      transition('collapsed <=> expanded', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class MenuItem {
  @Input() item!: IMenuItem;
  @Input() level: number = 0;
  @Input() menuState: MenuState = 'full';
  
  menuParams = inject(Menu);

  get hasChildren(): boolean {
    return !!(this.item.children && this.item.children.length > 0);
  }

  toggleExpand(event: Event) {
    if (this.hasChildren) {
      event.preventDefault();
      event.stopPropagation();
      this.item.expanded = !this.item.expanded;
      
      if (this.menuState === 'compact') {
        this.menuParams.setState('full');
      }
    }
  }
}
