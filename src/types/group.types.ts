// src/types/group.types.ts
export interface GroupMember {
  id: string; // UUID
  groupId: string;
  userId: string;
  roleId: string;
  userName: string;
  roleName: string;
  // Hỗ trợ cấu trúc trả về từ Entity (khi Backend chưa map sang DTO)
  user?: {
    id: string;
    userName: string;
    email: string;
    avatar?: string;
  };
  role?: {
    id: string;
    name: string;
  };
}

export interface Group {
  id: string; // UUID
  groupName: string;
  description?: string;
  createdBy: string; // UUID
  createdTime?: string; // ISO Date string
  members: GroupMember[];
}

// Dùng để tạo nhóm mới, khớp với GroupController
export interface CreateGroupPayload {
  dto: Omit<Group, 'id' | 'members' | 'createdBy'>; // DTO chỉ chứa groupName, description
  creatorId: string;
}