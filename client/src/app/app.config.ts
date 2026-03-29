import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './core/auth.interceptor';
import {
  LucideAngularModule,
  LayoutDashboard, Users, BarChart2, FileText, UserCog, Settings,
  ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown,
  LogOut, Menu, Search, X, Plus,
  Edit, Trash2, Check, MoreVertical, Filter,
  ChevronsLeft, ChevronsRight, ChevronLeft
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(LucideAngularModule.pick({
      LayoutDashboard, Users, BarChart2, FileText, UserCog, Settings,
      ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown,
      LogOut, Menu, Search, X, Plus,
      Edit, Trash2, Check, MoreVertical, Filter,
      ChevronsLeft, ChevronsRight, ChevronLeft
    }))
  ],
};
