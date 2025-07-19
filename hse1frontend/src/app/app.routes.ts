import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Epi } from './pages/epi/epi';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'epi', component: Epi },
  { path: 'users', component: Dashboard }, // Temporary - will be replaced with actual components
  { path: 'epi-requests', component: Dashboard }, // Temporary - will be replaced with actual components
  { path: 'stock', component: Dashboard }, // Temporary - will be replaced with actual components
  { path: 'notifications', component: Dashboard }, // Temporary - will be replaced with actual components
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
