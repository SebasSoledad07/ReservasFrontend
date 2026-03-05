import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Reserva, CrearReservaDto } from '../models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reservas`;

  // Subject PRIVADO, solo lectura pública
  private readonly reservasSubject = new BehaviorSubject<Reserva[]>([]);

  // Observable público INMUTABLE
  readonly reservas$ = this.reservasSubject.asObservable();

  // ⚠️ Ya NO cargamos en constructor: el componente lo hace en ngOnInit
  // con el token del usuario activo. Así se evita mezclar datos de sesiones distintas.

  /** Limpia el caché local (se llama al hacer logout) */
  limpiarCache(): void {
    this.reservasSubject.next([]);
  }

  /** Recarga las reservas desde el backend con el token actual */
  refrescar(): void {
    this.http.get<Reserva[]>(this.apiUrl).subscribe({
      next: (reservas) => this.reservasSubject.next(reservas),
      error: () => this.reservasSubject.next([]),
    });
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {
          const reservas = [...this.reservasSubject.value];
          const index = reservas.findIndex((r) => r.id === id);
          if (index !== -1) {
            reservas[index] = { ...reservas[index], status: 'CANCELED' } as Reserva;
            this.reservasSubject.next(reservas);
          }
        },
        error: () => this.refrescar(),
      }),
    );
  }

  crear(dto: CrearReservaDto): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, dto).pipe(
      tap((nueva) => {
        this.reservasSubject.next([nueva, ...this.reservasSubject.value]);
      }),
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const reservas = this.reservasSubject.value.filter((r) => r.id !== id);
        this.reservasSubject.next(reservas);
      }),
    );
  }
}

