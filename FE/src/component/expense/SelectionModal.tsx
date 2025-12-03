import React from 'react';
import { Modal, TouchableWithoutFeedback, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { APP_COLOR } from '@/utils/constant';

interface Props {
  visible: boolean; onClose: () => void; title: string;
  options: { label: string; value: string }[]; onSelect: (val: string) => void; selectedValue: string;
}

export const SelectionModal = ({ visible, onClose, title, options, onSelect, selectedValue }: Props) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
            </View>
            <FlatList
              data={options} keyExtractor={i => i.value} style={{ maxHeight: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.optionItem, item.value === selectedValue && styles.optionItemSelected]} onPress={() => { onSelect(item.value); onClose(); }}>
                  <Text style={[styles.optionText, item.value === selectedValue && styles.optionTextSelected]}>{item.label}</Text>
                  {item.value === selectedValue && <Ionicons name="checkmark-circle" size={24} color={APP_COLOR.ORANGE} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 5 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  optionItemSelected: { backgroundColor: '#FFF5E5' },
  optionText: { fontSize: 16, color: '#333' },
  optionTextSelected: { color: APP_COLOR.ORANGE, fontWeight: 'bold' },
});