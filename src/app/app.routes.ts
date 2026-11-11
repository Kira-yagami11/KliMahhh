import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  { path: 'details/:locationId', loadComponent: () => import('./details/details.page').then((m) => m.DetailsPage) },
  { path: 'about', loadComponent: () => import('./about/about.page').then((m) => m.AboutPage) },
  { path: '**', redirectTo: 'home' },
];
