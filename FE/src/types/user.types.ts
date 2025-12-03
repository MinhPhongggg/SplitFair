// src/types/user.types.ts
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface User {
  id: string; // UUID -> string
  name: string;
  email: string;
  status: UserStatus;
  roleId: string; // UUID -> string
  avatar?: string; // Match backend DTO 'avatar'
}