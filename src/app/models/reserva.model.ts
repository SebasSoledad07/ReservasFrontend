export interface Reserva {
  id: number;
  clientName: string;
  date: string;
  time: string;
  serviceName: string;
  status: 'ACTIVE' | 'CANCELED';
}

export interface CrearReservaDto {
  clientName: string;
  date: string;
  time: string;
  serviceName: string;
}
