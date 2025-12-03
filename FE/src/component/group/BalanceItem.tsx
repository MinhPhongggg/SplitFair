import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from '@/component/Avatar';
import { Balance } from '@/types/stats.types';

interface Props { balance: Balance; onPress: () => void; avatar?: string; }

export const BalanceItem = ({ balance, onPress, avatar }: Props) => {
  const amount = parseFloat(balance.netAmount);
  if (amount === 0) return null;
  const isDebt = amount < 0;
  return (
    <TouchableOpacity style={styles.balanceItem} onPress={onPress}>
      <Avatar name={balance.userName} avatar={avatar} />
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceName}>{balance.userName}</Text>
        <Text style={styles.balanceStatus}>{isDebt ? 'đang nợ' : 'được nhận lại'}</Text>
      </View>
      <Text style={[styles.balanceAmount, isDebt ? styles.debt : styles.credit]}>
        {isDebt ? '' : '+'}{amount.toLocaleString('vi-VN')}đ
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  balanceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  balanceInfo: { flex: 1, marginLeft: 12 },
  balanceName: { fontSize: 16, fontWeight: '600', color: '#333' },
  balanceStatus: { fontSize: 13, color: 'gray' },
  balanceAmount: { fontSize: 16, fontWeight: 'bold', marginRight: 5 },
  debt: { color: '#FF3B30' }, credit: { color: '#34C759' },
});