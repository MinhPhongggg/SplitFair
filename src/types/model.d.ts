export {};

declare global {
  interface IUserAuth {
    token: string; // token JWT trả về từ BE
    userName: string; // tên user
    role: string; // role của user, ví dụ "USER" hoặc "ADMIN"
    email?: string; // 👈 Thêm
    userId?: string; // 👈 Thêm
    avatar?: string; // 👈 Thêm
  }
}
