import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { APP_COLOR } from '@/utils/constant';

interface Props { netBalance: number; totalPaid: number; actualCost: number; }

export const PersonalStatsCard = ({ netBalance, totalPaid, actualCost }: Props) => {
  const isDebt = netBalance < 0;
  return (
    <View style={styles.personalCard}>
      <View style={styles.cardHeaderRow}>
         <Text style={styles.cardTitle}>Cá nhân tôi</Text>
         {/* ⚠️ Chú ý: Trong code cũ bạn dùng 'person-circle-outline', nếu không hiện hãy đổi về 'person' */}
         <Ionicons name="person-circle-outline" size={24} color={APP_COLOR.ORANGE} />
      </View>
      <View style={styles.rowStat}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Số dư nợ</Text>
          <Text style={[styles.statValue, isDebt ? styles.debt : styles.credit]}>
            {netBalance === 0 ? '0đ' : `${isDebt ? '' : '+'}${netBalance.toLocaleString('vi-VN')}đ`}
          </Text>
          <Text style={styles.statSub}>{isDebt ? 'Bạn đang nợ' : 'Bạn được nhận'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Chi tiêu thực</Text>
          <Text style={[styles.statValue, { color: '#333' }]}>
            {actualCost.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.statSub}>Phần của bạn</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Đã trả</Text>
          <Text style={[styles.statValue, { color: '#007AFF' }]}>
            {totalPaid.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.statSub}>Tiền bạn đã ứng</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  personalCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  rowStat: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: 'gray', marginBottom: 5 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  statSub: { fontSize: 10, color: '#999', marginTop: 2 },
  divider: { width: 1, backgroundColor: '#eee', height: '100%' },
  debt: { color: '#FF3B30' }, credit: { color: '#34C759' },
});