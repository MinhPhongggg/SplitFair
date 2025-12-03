import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { APP_COLOR } from '@/utils/constant';
import { GroupMember } from '@/types/group.types';

type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC';

interface Props {
  visible: boolean;
  onClose: () => void;
  sortOption: SortOption;
  setSortOption: (opt: SortOption) => void;
  filterPayer: string | null;
  setFilterPayer: (id: string | null) => void;
  members: GroupMember[] | undefined;
  onReset: () => void;
}

export const StatsFilterModal = ({ visible, onClose, sortOption, setSortOption, filterPayer, setFilterPayer, members, onReset }: Props) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bộ Lọc & Sắp Xếp</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Sắp xếp theo</Text>
          <View style={styles.filterOptions}>
            {/* Các nút sắp xếp */}
            <TouchableOpacity style={[styles.filterChip, sortOption === 'DATE_DESC' && styles.chipActive]} onPress={() => setSortOption('DATE_DESC')}>
                <Text style={[styles.chipText, sortOption === 'DATE_DESC' && styles.chipTextActive]}>Mới nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, sortOption === 'AMOUNT_DESC' && styles.chipActive]} onPress={() => setSortOption('AMOUNT_DESC')}>
                <Text style={[styles.chipText, sortOption === 'AMOUNT_DESC' && styles.chipTextActive]}>Tiền cao nhất</Text>
            </TouchableOpacity>
            {/* Thêm các option khác nếu cần */}
          </View>

          <Text style={styles.filterLabel}>Người trả tiền</Text>
          <ScrollView style={{ maxHeight: 150 }}>
            <TouchableOpacity style={styles.rowFilter} onPress={() => setFilterPayer(null)}>
                <Ionicons name={filterPayer === null ? "radio-button-on" : "radio-button-off"} size={20} color={APP_COLOR.ORANGE} />
                <Text style={styles.rowText}>Tất cả</Text>
            </TouchableOpacity>
            {members?.map(m => {
                // Lấy ID an toàn (userId hoặc user.id)
                const mId = m.userId || m.user?.id || '';
                return (
                    <TouchableOpacity key={m.id} style={styles.rowFilter} onPress={() => setFilterPayer(mId)}>
                        <Ionicons name={filterPayer === mId ? "radio-button-on" : "radio-button-off"} size={20} color={APP_COLOR.ORANGE} />
                        <Text style={styles.rowText}>{m.userName || m.user?.userName}</Text>
                    </TouchableOpacity>
                );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
             <TouchableOpacity style={styles.resetButton} onPress={onReset}><Text style={styles.resetButtonText}>Đặt lại</Text></TouchableOpacity>
             <TouchableOpacity style={styles.applyButton} onPress={onClose}><Text style={styles.applyButtonText}>Áp dụng</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 10, marginBottom: 10 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f0f0f0' },
  chipActive: { backgroundColor: APP_COLOR.ORANGE },
  chipText: { fontSize: 14, color: '#333' },
  chipTextActive: { color: 'white', fontWeight: 'bold' },
  rowFilter: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  rowText: { marginLeft: 10, fontSize: 16 },
  modalFooter: { flexDirection: 'row', marginTop: 30, marginBottom: 10, gap: 15 },
  applyButton: { flex: 1, backgroundColor: APP_COLOR.ORANGE, padding: 15, borderRadius: 12, alignItems: 'center' },
  applyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  resetButton: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, borderRadius: 12, alignItems: 'center' },
  resetButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});