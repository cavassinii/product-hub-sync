
export interface LoginRequest {
  Organization: string;
  User: string;
  Password: string;
}

export interface AuthResponse {
  token: string;
  expires_in: number;
}

export interface User {
  organization: string;
  user: string;
}
