import { Routes } from '@angular/router';
import { HomePage } from './features/home/home-page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'ListenIn' },
  {
    path: 'inscription',
    title: 'Créer votre compte · ListenIn',
    loadComponent: () => import('./features/identity/signup/signup-page'),
  },
  { path: '**', redirectTo: '' },
];
