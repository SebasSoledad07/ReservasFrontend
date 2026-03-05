/** Información pública de una empresa devuelta por GET /publico/{slug} */
export interface CompanyPublicInfo {
  id: number;
  name: string;
  slug: string;
}

/** Body para POST /publico/{slug}/reservas */
export interface PublicBookingDto {
  clientName: string;
  date: string;
  time: string;
  serviceName: string;
}

/** Respuesta del backend al crear la reserva pública */
export interface PublicBookingResponse {
  id: number;
  clientName: string;
  date: string;
  time: string;
  serviceName: string;
  status: string;
}
