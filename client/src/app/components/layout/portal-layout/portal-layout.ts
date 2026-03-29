import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Menu } from '../../menu/menu';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, LucideAngularModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css'
})
export class PortalLayout {
  menuService = inject(Menu);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  viewTitle = signal<string>('Portal');
  titles = computed(() => [this.viewTitle()]);

  constructor() {
    this.updateTitle();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle() {
    let currentRoute = this.activatedRoute;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const title = currentRoute?.snapshot?.title || 'Portal';
    this.viewTitle.set(title);
  }
}
