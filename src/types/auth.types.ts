export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

//
export interface LoginRequest {
  email: string;
  password: string;
}

//
export interface AuthResponse {
  token: string;
  userName: string;
  role: string;
  userId: string; // 👈 Thêm userId
}