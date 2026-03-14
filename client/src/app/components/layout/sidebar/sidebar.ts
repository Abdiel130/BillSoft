import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Menu } from '../../menu/menu';
import { AuthService } from '../../../core/services/auth.service';
import { MenuItem } from '../../generics/menu-item/menu-item';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, MenuItem, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  menuService = inject(Menu);
  authService = inject(AuthService);
  router = inject(Router);

  searchTerm = '';

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearchChange() {
    this.menuService.search(this.searchTerm);
  }
}
