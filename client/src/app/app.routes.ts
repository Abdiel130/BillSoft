import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PortalLayout } from './components/layout/portal-layout/portal-layout';
import { Dashboard } from './components/dashboard/dashboard';
import { Clients } from './components/clients/clients';
import { Sales } from './components/reports/sales/sales';
import { Purchases } from './components/reports/purchases/purchases';
import { Invoices } from './components/invoices/invoices';
import { Users } from './components/users/users';
import { Settings } from './components/settings/settings';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { 
        path: '', 
        component: PortalLayout, 
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'clients', component: Clients },
            { path: 'reports/sales', component: Sales },
            { path: 'reports/purchases', component: Purchases },
            { path: 'invoices', component: Invoices },
            { path: 'users', component: Users },
            { path: 'settings', component: Settings }
        ]
    }
];
