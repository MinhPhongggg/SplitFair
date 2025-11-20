import React, { useState, useLayoutEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShareInput from '@/component/input/share.input';
import { useCurrentApp } from '@/context/app.context';
import demo from '@/assets/avatar/avatar.jpg';
import { APP_COLOR } from '@/utils/constant';
import { useUpdateUser } from '@/api/hooks'; // Bỏ useUploadAvatar
import { getURLBaseBackend } from '@/utils/api';
import { useToast } from '@/context/toast.context';
import ConfirmModal from '@/component/ConfirmModal';

const AccountPage = () => {
  const { appState, setAppState } = useCurrentApp();
  const navigation = useNavigation();
  const backendUrl = getURLBaseBackend();
  const { showToast } = useToast();

  // 1. State
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(appState?.userName || '');
  const [email, setEmail] = useState(appState?.email || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 2. Hooks (Chỉ giữ lại update info, bỏ upload avatar)
  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser();

  // 3. Header: Nút Edit / Hủy
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsEditing((prev) => !prev)}>
          <Text style={styles.headerButton}>
            {isEditing ? 'Hủy' : 'Sửa'}
          </Text>
        </TouchableOpacity>
      ),
      headerStyle: { backgroundColor: APP_COLOR.ORANGE },
      headerTintColor: 'white',
      headerTitle: 'Tài khoản',
      headerShown: true,
    });
  }, [navigation, isEditing]);

  // 4. Hàm "Lưu Thay Đổi" (Thông tin cơ bản)
  const handleUpdate = () => {
    if (!appState?.userId) return;
    updateUser(
      { id: String(appState.userId), name: userName, email: email },
      { 
        onSuccess: () => {
            setIsEditing(false);
            showToast('success', 'Thành công', 'Cập nhật thông tin thành công!');
        },
        onError: (error) => {
            showToast('error', 'Thất bại', 'Có lỗi xảy ra khi cập nhật.');
            console.log(error);
        }
      }
    );
  };

  // 5. Hàm "Đăng Xuất" (Đã sửa lỗi hoạt động)
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const performLogout = async () => {
    try {
      // B1: Xóa token lưu trong máy
      await AsyncStorage.removeItem('access_token');
      
      // B2: Reset state của app về null
      setAppState(null);
      
      showToast('success', 'Đăng xuất', 'Hẹn gặp lại bạn sớm!');
      // B3: Điều hướng về trang Login (hoặc trang gốc)
      router.replace('/(auth)/login'); 
    } catch (error) {
      console.log("Logout error: ", error);
      showToast('error', 'Lỗi', 'Không thể đăng xuất lúc này.');
    }
  };

  // 6. Xác định ảnh đại diện (Chỉ hiển thị)
  const avatarSource = appState?.avatar
    ? { uri: `${backendUrl}${appState.avatar}` }
    : demo;

  return (
    <ScrollView style={styles.container}>
      {/* Avatar (Chỉ hiển thị, không click được) */}
      <View style={styles.center}>
        <View style={styles.avatarContainer}>
             <Image style={styles.avatar} source={avatarSource} />
        </View>
        
        {/* Chỉ hiển thị tên to nếu KHÔNG ở chế độ Sửa */}
        {!isEditing && (
          <Text style={styles.nameText}>
            {appState?.userName || 'Người dùng'}
          </Text>
        )}
      </View>

      {/* Form nhập liệu */}
      <View style={{ gap: 20 }}>
        <ShareInput
          title="Tên người dùng"
          value={isEditing ? userName : (appState?.userName || '')}
          onChangeText={setUserName}
          editable={isEditing} // Chỉ cho nhập khi đang Edit
        />
        
        <ShareInput
          title="Email"
          value={isEditing ? email : (appState?.email || '')}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={isEditing} // Chỉ cho nhập khi đang Edit
        />

        {/* Nút LƯU chỉ hiện khi đang Edit */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleUpdate}
            disabled={isUpdatingUser}
          >
            {isUpdatingUser ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Lưu Thay Đổi</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Nút Đăng xuất (Luôn hiện) */}
      {!isEditing && (
        <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
        >
            <Text style={styles.buttonText}>Đăng Xuất</Text>
        </TouchableOpacity>
      )}

      <ConfirmModal
        visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={performLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?"
        confirmText="Đăng xuất"
        type="danger"
        icon="log-out-outline"
      />
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  center: { alignItems: 'center', gap: 10, marginBottom: 30 },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ccc',
    borderWidth: 2,
    borderColor: 'white',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    color: 'white',
    marginRight: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: APP_COLOR.ORANGE,
  },
  logoutButton: {
    backgroundColor: '#FF3B30', // Màu đỏ cho logout
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountPage;