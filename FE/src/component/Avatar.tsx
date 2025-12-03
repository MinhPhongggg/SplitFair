// src/component/Avatar.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getURLBaseBackend } from '@/utils/api';

const COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#9E9E9E', '#607D8B'
];

// Hàm helper lấy màu từ danh sách dựa trên tên
const getColor = (name: string) => {
  if (!name) return '#ccc';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};

// Hàm helper lấy 2 chữ cái đầu
const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

interface AvatarProps {
  name: string;
  avatar?: string | null; // Thêm prop avatar
  size?: number;
  style?: any;
}

const Avatar = ({ name, avatar, size = 40, style }: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const backendUrl = getURLBaseBackend();

  // Logic xử lý URL avatar
  const getAvatarUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  const avatarUrl = getAvatarUrl(avatar || '');

  // Nếu có avatar và không bị lỗi load ảnh -> Render Ảnh
  if (avatarUrl && !imageError) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[
          styles.image, 
          { width: size, height: size, borderRadius: size / 2 }, 
          style
        ]}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback: Render Initials
  const displayName = name || '?';
  const initials = getInitials(displayName);
  const color = getColor(displayName);

  return (
    <View style={[styles.avatar, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    marginRight: 15,
    backgroundColor: '#eee', // Màu nền khi đang load
  }
});

export default Avatar;