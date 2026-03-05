import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CompanyPublicInfo,
  PublicBookingDto,
  PublicBookingResponse,
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
    dto: PublicBookingDto,
  ): Observable<PublicBookingResponse> {
    return this.http.post<PublicBookingResponse>(
      `${this.baseUrl}/${slug}/reservas`,
      dto,
    );
  }
}
