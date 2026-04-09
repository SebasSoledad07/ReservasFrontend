/** Información pública de una empresa devuelta por GET /publico/{slug} */
export interface CompanyPublicInfo {
  id: number;
  name: string;
  slug: string;
}

/** Body para POST /publico/{slug}/reservas */
export interface BookingPublicRequestDTO {
  clientName: string;
  date: string;        // formato ISO: YYYY-MM-DD
  time: string;        // formato HH:mm
  serviceName: string;
}

/** @deprecated Usar BookingPublicRequestDTO */
export type PublicBookingDto = BookingPublicRequestDTO;

/** Respuesta del backend al crear la reserva pública */
export interface BookingResponseDTO {
  id: number;
  clientName: string;
  date: string;
  time: string;
  serviceName: string;
  status: string;
}

/** @deprecated Usar BookingResponseDTO */
export type PublicBookingResponse = BookingResponseDTO;
