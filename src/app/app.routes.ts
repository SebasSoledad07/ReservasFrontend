import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    // Ruta PÚBLICA — cualquiera puede reservar sin autenticación
    path: 'publico/:slug',
    loadComponent: () =>
      import('./pages/public-booking/public-booking.component').then(
        (m) => m.PublicBookingComponent,
      ),
  },
  {
    path: 'reservas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reservas-list/reservas-list.component').then(
        (m) => m.ReservasListComponent,
      ),
  },
  {
    path: 'reservas/nueva',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reserva-form/reserva-form.component').then(
        (m) => m.ReservaFormComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];

