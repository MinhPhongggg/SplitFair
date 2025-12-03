import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { APP_COLOR } from '@/utils/constant';
import { SplitMethod } from '@/hooks/useExpenseCreation';
const METHODS = [
  { value: 'EQUAL', label: 'Chia đều' }, { value: 'EXACT', label: 'Số tiền' },
  { value: 'PERCENTAGE', label: '%' }, { value: 'SHARES', label: 'Phần' }
];

export const SplitMethodTabs = ({ current, onChange }: { current: SplitMethod; onChange: (m: any) => void }) => (
  <View style={styles.splitMethodContainer}>
    <Text style={styles.sectionLabel}>Cách chia</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
      {METHODS.map(m => (
        <TouchableOpacity key={m.value} style={[styles.tabItem, current === m.value && styles.tabItemSelected]} onPress={() => onChange(m.value)}>
          <Text style={[styles.tabText, current === m.value && styles.tabTextSelected]}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  splitMethodContainer: { paddingVertical: 15, paddingHorizontal: 20, backgroundColor: '#f9f9f9' },
  sectionLabel: { fontSize: 14, color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  tabsScroll: { marginTop: 10 },
  tabItem: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
  tabItemSelected: { backgroundColor: APP_COLOR.ORANGE, borderColor: APP_COLOR.ORANGE },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  tabTextSelected: { color: '#fff', fontWeight: 'bold' },
});