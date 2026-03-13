import { Injectable, signal } from '@angular/core';

export type MenuState = 'hide' | 'compact' | 'full';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Menu {
  private _state = signal<MenuState>('full');
  
  private _menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', route: '/dashboard' },
    { id: 'clients', label: 'Clientes', icon: 'Users', route: '/clients' },
    { 
      id: 'reports', 
      label: 'Reportes', 
      icon: 'BarChart2', 
      children: [
        { id: 'sales', label: 'Ventas', route: '/reports/sales' },
        { id: 'purchases', label: 'Compras', route: '/reports/purchases' },
      ]
    },
    { id: 'invoices', label: 'Facturas', icon: 'FileText', route: '/invoices' },
    { id: 'users', label: 'Usuarios', icon: 'UserCog', route: '/users' },
    { id: 'settings', label: 'Configuración', icon: 'Settings', route: '/settings' },
  ];

  private _filteredItems = signal<MenuItem[]>(this._menuItems);

  get state() { return this._state; }
  get items() { return this._filteredItems; }

  setState(newState: MenuState) {
    this._state.set(newState);
  }

  toggleState() {
    const currentState = this._state();
    if (currentState === 'full') this._state.set('compact');
    else if (currentState === 'compact') this._state.set('hide');
    else this._state.set('full');
  }

  search(term: string) {
    if (!term.trim()) {
      // Return original items and collapse
      this._filteredItems.set(this._menuItems.map(m => ({...m, expanded: false})));
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    
    const filterItems = (items: MenuItem[]): MenuItem[] => {
      const result: MenuItem[] = [];
      for (const item of items) {
        let matches = item.label.toLowerCase().includes(lowerTerm);
        let childrenMatches: MenuItem[] = [];
        
        if (item.children) {
          childrenMatches = filterItems(item.children);
          if (childrenMatches.length > 0) {
            matches = true;
          }
        }
        
        if (matches) {
          result.push({
            ...item,
            expanded: true, // auto expand when searching
            children: childrenMatches.length > 0 ? childrenMatches : item.children
          });
        }
      }
      return result;
    };
    
    this._filteredItems.set(filterItems(this._menuItems));
  }
}
