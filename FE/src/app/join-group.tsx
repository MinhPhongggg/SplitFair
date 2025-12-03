import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCurrentApp } from '@/context/app.context';
import { useAddMember } from '@/api/hooks';
import { useToast } from '@/context/toast.context';
import { APP_COLOR } from '@/utils/constant';

const JoinGroupScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { appState } = useCurrentApp();
  const { showToast } = useToast();
  
  const { mutate: addMember, isPending } = useAddMember(groupId as string);

  useEffect(() => {
    if (!appState?.userId) {
      showToast('warning', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tham gia nhóm.');
      router.replace('/(auth)/login');
      return;
    }

    if (groupId) {
      handleJoin();
    } else {
      router.replace('/(tabs)/groups');
    }
  }, [groupId, appState]);

  const handleJoin = () => {
    if (!appState?.userId) return;

    addMember(
      { userId: String(appState.userId) },
      {
        onSuccess: () => {
          showToast('success', 'Thành công', 'Bạn đã tham gia nhóm!');
          router.replace({
            pathname: '/(tabs)/groups/[groupId]',
            params: { groupId: groupId }
          });
        },
        onError: (err: any) => {
          // Nếu lỗi là "User already in this group" thì vẫn chuyển trang
          const msg = err.response?.data?.message || err.message;
          if (msg.includes('already')) {
             showToast('info', 'Thông báo', 'Bạn đã là thành viên của nhóm này.');
             router.replace({
                pathname: '/(tabs)/groups/[groupId]',
                params: { groupId: groupId }
             });
          } else {
             showToast('error', 'Lỗi', 'Không thể tham gia nhóm: ' + msg);
             router.replace('/(tabs)/groups');
          }
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={APP_COLOR.ORANGE} />
      <Text style={styles.text}>Đang tham gia nhóm...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default JoinGroupScreen;
