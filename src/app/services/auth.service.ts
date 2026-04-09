import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { LoginDto, RegisterRequestDTO, AuthResponse, User } from '../models/auth.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<User | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (token && userRaw) {
      try {
        const user: User = JSON.parse(userRaw);
        this._currentUser.set(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  login(dto: LoginDto) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap((response) => {
        const user: User = {
          username: response.username,
          companyId: response.companyId,
          companyName: response.companyName,
          role: response.role,
          slug: response.slug,
        };
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.set(user);
        this.navigateAfterAuth();
      }),
    );
  }

  register(dto: RegisterRequestDTO) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, dto).pipe(
      tap((response) => {
        const user: User = {
          username: response.username,
          companyId: response.companyId,
          companyName: response.companyName,
          role: response.role,
          slug: response.slug,
        };
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.set(user);
        this.navigateAfterAuth();
      }),
      catchError((err: HttpErrorResponse) => throwError(() => this.mapHttpError(err))),
    );
  }

  /** Mapea errores HTTP a mensajes amigables */
  private mapHttpError(err: HttpErrorResponse): string {
    if (err.status === 400) {
      return err.error?.message ?? 'Los datos enviados no son válidos. Revisá el formulario.';
    }
    if (err.status === 404) {
      return 'El recurso solicitado no existe.';
    }
    if (err.status === 409) {
      return err.error?.message ?? 'Ese usuario o empresa ya existe. Prová con otro nombre.';
    }
    return err.error?.message ?? 'No se pudo conectar al servidor. Intentá más tarde.';
  }

  private navigateAfterAuth(): void {
    this.router.navigate(['/reservas']);
  }

  logout(): void {
    this.clearStorage();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
