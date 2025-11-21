// src/app/(tabs)/groups/create-group.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { APP_COLOR } from '@/utils/constant';
import { useCreateGroup } from '@/api/hooks';
import { useCurrentApp } from '@/context/app.context';
import { useToast } from '@/context/toast.context';
import Ionicons from '@expo/vector-icons/Ionicons';

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const { appState } = useCurrentApp();
  const { showToast } = useToast();
  const { mutate: createGroup, isPending } = useCreateGroup();

  const handleCreate = () => {
    console.log("User ID hiện tại:", appState?.userId);
    if (!groupName) {
      showToast('warning', 'Thiếu thông tin', 'Vui lòng nhập tên nhóm');
      return;
    }
    if (!appState?.userId) {
      showToast('error', 'Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }

    createGroup(
      {
        creatorId: String(appState.userId),
        dto: {
          groupName: groupName,
          description: description,
        },
      },
      {
        onSuccess: () => {
          showToast('success', 'Thành công', 'Tạo nhóm mới thành công!');
          router.back(); // Quay lại màn hình danh sách nhóm
        },
        onError: (err) => {
          showToast('error', 'Lỗi', err.message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhóm mới</Text>
        <View style={{ width: 34 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={[styles.label, styles.labelFirst]}>Tên nhóm</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="Ví dụ: Tiệc liên hoan"
                    placeholderTextColor="#999"
                />
            </View>

            <Text style={styles.label}>Mô tả (không bắt buộc)</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="document-text-outline" size={20} color="#888" style={[styles.inputIcon, { marginTop: 12 }]} />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Mô tả ngắn về nhóm..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                />
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreate}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Tạo nhóm</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  scrollContent: { padding: 20 },

  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 15,
    textTransform: 'uppercase',
  },
  labelFirst: { marginTop: 0 },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  textArea: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  // Button
  button: {
    backgroundColor: APP_COLOR.ORANGE,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: APP_COLOR.ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default CreateGroupScreen;