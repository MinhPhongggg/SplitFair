import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { APP_COLOR } from '@/utils/constant';
import { useJoinGroup } from '@/api/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCurrentApp } from '@/context/app.context';
import { useToast } from '@/context/toast.context';
import * as Clipboard from 'expo-clipboard';

interface JoinGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinGroupModal = ({ visible, onClose, onSuccess }: JoinGroupModalProps) => {
  const { appState } = useCurrentApp();
  const { showToast } = useToast();
  
  const [inviteCode, setInviteCode] = useState('');
  const { mutate: joinGroup, isPending: isJoining } = useJoinGroup();

  const handleJoinGroup = () => {
    if (!inviteCode.trim()) {
        showToast('error', 'Lỗi', 'Vui lòng nhập mã nhóm hoặc link mời.');
        return;
    }

    // Extract Group ID from Link or Code
    let groupId = inviteCode.trim();
    // Check if it's a link: splitfair://join-group?groupId=...
    if (groupId.includes('groupId=')) {
        groupId = groupId.split('groupId=')[1];
    }

    if (!appState?.userId) {
        showToast('error', 'Lỗi', 'Bạn chưa đăng nhập.');
        return;
    }

    joinGroup(
        { groupId, userId: appState.userId as string },
        {
            onSuccess: () => {
                showToast('success', 'Thành công', 'Đã tham gia nhóm thành công!');
                setInviteCode('');
                onClose();
                if (onSuccess) onSuccess();
            },
            onError: (err: any) => {
                showToast('error', 'Thất bại', err.response?.data?.message || 'Không thể tham gia nhóm. Vui lòng kiểm tra lại mã.');
            }
        }
    );
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setInviteCode(text);
  };

  const handleScanQR = () => {
      onClose(); // Close modal first
      router.push('/(tabs)/groups/scan-qr');
  };

  return (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Tham gia nhóm</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#999" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.modalSubtitle}>Nhập mã nhóm hoặc dán link mời để tham gia.</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Mã nhóm hoặc Link..."
                        value={inviteCode}
                        onChangeText={setInviteCode}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.pasteBtn} onPress={handlePaste}>
                        <Text style={styles.pasteText}>Dán</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.joinBtn, !inviteCode && styles.disabledBtn]}
                    onPress={handleJoinGroup}
                    disabled={!inviteCode || isJoining}
                >
                    {isJoining ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.joinBtnText}>Tham gia ngay</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>HOẶC</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.scanBtn} onPress={handleScanQR}>
                    <Ionicons name="qr-code-outline" size={20} color={APP_COLOR.ORANGE} />
                    <Text style={styles.scanBtnText}>Quét mã QR</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  pasteBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  pasteText: {
    color: APP_COLOR.ORANGE,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: '#FFCC80', // Light orange
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  joinBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 12,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLOR.ORANGE,
    backgroundColor: '#FFF5F0',
  },
  scanBtnText: {
    color: APP_COLOR.ORANGE,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});
