import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/session/guards';
import { HomePage } from './features/home/home-page';

export const routes: Routes = [
  // Pages des visiteurs : un membre connecté est envoyé sur « Découvrir ».
  {
    path: '',
    pathMatch: 'full',
    component: HomePage,
    canActivate: [guestGuard],
    title: 'ListenIn',
  },
  {
    path: 'inscription',
    canActivate: [guestGuard],
    title: 'Créer votre compte · ListenIn',
    loadComponent: () => import('./features/identity/signup/signup-page'),
  },
  {
    path: 'connexion',
    canActivate: [guestGuard],
    title: 'Se connecter · ListenIn',
    loadComponent: () => import('./features/identity/login/login-page'),
  },
  // Application connectée : la coquille et ses pages, réservées aux membres.
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: 'decouvrir',
        title: 'Découvrir · ListenIn',
        loadComponent: () => import('./features/discover/discover-page'),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
