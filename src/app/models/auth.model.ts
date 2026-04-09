// DTOs de entrada — coinciden exactamente con los Records del backend Spring Boot

export interface LoginDto {
  username: string;
  password: string;
}

/** Body para POST /auth/registro — incluye número WhatsApp de la empresa */
export interface RegisterRequestDTO {
  companyName: string;
  slug?: string;          // identificador del link público (opcional, el backend lo genera si no se envía)
  username: string;
  password: string;
  email: string;
  /** Número WhatsApp en formato E.164, ej: +5491112345678 */
  companyWhatsappNumber: string;
}

/** @deprecated Usar RegisterRequestDTO */
export type RegisterDto = RegisterRequestDTO;

// AuthResponseDTO que devuelve el backend (estructura plana, sin objeto user anidado)
export interface AuthResponse {
  token: string;
  companyId: number;
  companyName?: string; // nombre de la empresa
  username: string;
  role: 'ADMIN' | 'EMPLOYEE';
  slug?: string;
}

// Representación local del usuario autenticado
export interface User {
  username: string;
  companyId: number;
  companyName?: string; // nombre de la empresa
  role: 'ADMIN' | 'EMPLOYEE';
  slug?: string;
}
