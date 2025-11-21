// src/app/(tabs)/groups/create-bill.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { APP_COLOR } from '@/utils/constant';
import { useCreateBill, useGetCategories } from '@/api/hooks';
import { useCurrentApp } from '@/context/app.context';
import { useToast } from '@/context/toast.context';
import Ionicons from '@expo/vector-icons/Ionicons';

// --- Component Modal Chọn (Bottom Sheet) ---
const SelectionModal = ({
  visible,
  onClose,
  title,
  options,
  onSelect,
  selectedValue,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  selectedValue: string;
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      item.value === selectedValue && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(item.value);
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === selectedValue && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === selectedValue && (
                      <Ionicons name="checkmark-circle" size={24} color={APP_COLOR.ORANGE} />
                    )}
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const CreateBillScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { appState } = useCurrentApp();
  const { showToast } = useToast();

  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { data: categories } = useGetCategories();
  const { mutate: createBill, isPending } = useCreateBill(groupId as string);

  const categoryOptions = useMemo(() => {
    return categories?.map(c => ({ label: c.name, value: c.id })) || [];
  }, [categories]);

  const handleCreate = () => {
    if (!description || !categoryId) {
      showToast('warning', 'Thiếu thông tin', 'Vui lòng điền mô tả và chọn danh mục');
      return;
    }

    createBill(
      {
        groupId: groupId as string,
        createdBy: appState?.userId ? String(appState.userId) : undefined,
        description,
        categoryId,
        currency: 'VND',
        status: 'DRAFT',
      },
      {
        onSuccess: (newBill) => {
          showToast('success', 'Thành công', 'Đã tạo hóa đơn mới.');
          router.replace(`/(tabs)/groups/bill/${newBill.id}`);
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
        <Text style={styles.headerTitle}>Tạo hóa đơn mới</Text>
        <View style={{ width: 34 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={[styles.label, styles.labelFirst]}>Mô tả hóa đơn (*)</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="receipt-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ví dụ: Ăn tối nhà hàng"
                    placeholderTextColor="#999"
                />
            </View>

            <Text style={styles.label}>Danh mục (*)</Text>
            <TouchableOpacity 
              style={styles.pickerWrapper} 
              onPress={() => setShowCategoryModal(true)}
            >
                <Ionicons name="grid-outline" size={20} color="#888" style={styles.inputIcon} />
                <View style={styles.pickerContainer}>
                    <Text style={[styles.pickerText, !categoryId && { color: '#999' }]}>
                      {categoryOptions.find(c => c.value === categoryId)?.label || 'Chọn danh mục'}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreate}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Tạo Hóa Đơn</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectionModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Chọn danh mục"
        options={categoryOptions}
        onSelect={setCategoryId}
        selectedValue={categoryId}
      />
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
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },

  // Picker Replacement
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  pickerContainer: { flex: 1, justifyContent: 'center' },
  pickerText: { fontSize: 16, color: '#333' },

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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionItemSelected: {
    backgroundColor: '#FFF5E5',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: APP_COLOR.ORANGE,
    fontWeight: 'bold',
  },
});

export default CreateBillScreen;