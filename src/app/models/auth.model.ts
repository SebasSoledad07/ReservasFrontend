// DTOs de entrada — coinciden exactamente con los Records del backend Spring Boot

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  companyName: string;
  username: string;
  password: string;
  email: string;
  slug?: string;  // identificador del link público (opcional, el backend lo genera si no se envía)
}

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
