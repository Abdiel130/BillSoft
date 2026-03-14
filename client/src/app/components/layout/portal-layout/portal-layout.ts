import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Menu } from '../../menu/menu';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, LucideAngularModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css'
})
export class PortalLayout {
  menuService = inject(Menu);
}
