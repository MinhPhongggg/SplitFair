// --- Auth Types (từ AuthController) ---
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthResponse {
  token: string;
}

// --- User Types (từ UserController & UserDTO) ---
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// --- Group Types (từ GroupController & GroupDTO) ---
export interface Group {
  id: number;
  name: string;
  currency: 'VND' | 'USD' | string;
  createdAt: string; // ISO date string
}

export interface CreateGroupRequest {
  name: string;
  currency: string;
}

export interface UpdateGroupRequest {
  name?: string;
  currency?: string;
}

// --- Group Member Types (từ GroupMemberController & GroupMemberDTO) ---
export interface GroupMember {
  id: number; // Đây là ID của GroupMember (bản ghi quan hệ)
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'OWNER' | 'MEMBER' | string; // BE dùng RoleType enum
}

// GroupDetail là kiểu dữ liệu tổng hợp
export interface GroupDetail extends Group {
  members: GroupMember[];
}

export interface AddMemberRequest {
  userId: number;
}