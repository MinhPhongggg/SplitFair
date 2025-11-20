// src/api/groups.ts
import axios from '@/utils/axios.customize';
import { Group, GroupMember, CreateGroupPayload } from '@/types/group.types';

export const getGroups = (): Promise<Group[]> => {
  return axios.get('/api/groups');
};

export const getGroupById = (id: string): Promise<Group> => {
  return axios.get(`/api/groups/${id}`);
};

export const createGroup = (payload: CreateGroupPayload): Promise<Group> => {
  return axios.post(`/api/groups?creatorId=${payload.creatorId}`, payload.dto);
};

export const removeMember = (memberId: string): Promise<void> => {
  return axios.delete(`/api/group-members/${memberId}`);
};

export const addMember = (
  groupId: string,
  payload: { userId: string }
): Promise<string> => {
  return axios.post(`/api/groups/${groupId}/members?userId=${payload.userId}`);
};

export const getGroupMembers = (groupId: string): Promise<GroupMember[]> => {
  return axios.get(`/api/groups/${groupId}/members`);
};

export const updateGroup = (groupId: string, dto: { groupName: string; description?: string }): Promise<Group> => {
  return axios.put(`/api/groups/${groupId}`, dto);
};

export const deleteGroup = (groupId: string): Promise<void> => {
  return axios.delete(`/api/groups/${groupId}`);
};