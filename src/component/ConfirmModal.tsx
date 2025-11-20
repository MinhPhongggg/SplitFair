import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { APP_COLOR } from '@/utils/constant';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
  icon?: keyof typeof Ionicons.glyphMap; // Cho phép custom icon
}

const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  type = 'info',
  icon
}: ConfirmModalProps) => {
  // Xác định icon mặc định dựa trên type nếu không có icon truyền vào
  const defaultIcon = type === 'danger' ? "trash-outline" : "information-circle-outline";
  const iconName = icon || defaultIcon;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon Header */}
          <View style={[styles.iconContainer, type === 'danger' ? styles.iconDanger : styles.iconInfo]}>
            <Ionicons 
              name={iconName} 
              size={36} 
              color={type === 'danger' ? "#FF3B30" : APP_COLOR.ORANGE} 
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, type === 'danger' ? styles.confirmDanger : styles.confirmInfo]} 
              onPress={() => {
                onClose();
                setTimeout(onConfirm, 200); // Delay slightly for animation
              }}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconInfo: {
    backgroundColor: '#FFF5E5', // Light Orange
  },
  iconDanger: {
    backgroundColor: '#FFEEEE', // Light Red
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmInfo: {
    backgroundColor: APP_COLOR.ORANGE,
  },
  confirmDanger: {
    backgroundColor: '#FF3B30',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ConfirmModal;
