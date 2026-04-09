import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CompanyPublicInfo,
  BookingPublicRequestDTO,
  BookingResponseDTO,
} from '../models/public-booking.model';

@Injectable({
  providedIn: 'root',
})
export class PublicBookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/publico`;

  /**
   * Obtiene información pública de la empresa por slug.
   * GET /publico/{slug}
   */
  getCompanyBySlug(slug: string): Observable<CompanyPublicInfo> {
    return this.http.get<CompanyPublicInfo>(`${this.baseUrl}/${slug}`);
  }

  /**
   * Crea una reserva pública sin autenticación.
   * POST /publico/{slug}/reservas
   */
  crearReserva(
    slug: string,
    dto: BookingPublicRequestDTO,
  ): Observable<BookingResponseDTO> {
    return this.http.post<BookingResponseDTO>(
      `${this.baseUrl}/${slug}/reservas`,
      dto,
    ).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => this.mapHttpError(err))),
    );
  }

  /**
   * English alias — POST /publico/{slug}/reservas
   * Notifica a la empresa por WhatsApp automáticamente desde el backend.
   */
  createPublicBooking(
    slug: string,
    payload: BookingPublicRequestDTO,
  ): Observable<BookingResponseDTO> {
    return this.crearReserva(slug, payload);
  }

  /** Mapea errores HTTP del módulo de reservas públicas */
  private mapHttpError(err: HttpErrorResponse): string {
    if (err.status === 400) {
      return err.error?.message ?? 'Datos inválidos. Revisá el formulario.';
    }
    if (err.status === 404) {
      return 'El link de esta empresa no es válido.';
    }
    if (err.status === 409) {
      return 'Ese horario ya está reservado. Elegí otro turno.';
    }
    return err.error?.message ?? 'No se pudo crear la reserva. Intentá de nuevo.';
  }
}
