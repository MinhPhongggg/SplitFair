// src/app/(tabs)/groups/GroupBillsTab.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { APP_COLOR } from '@/utils/constant';
import { Bill } from '@/types/bill.types';
import { useGetBillsByGroup } from '@/api/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';

const GroupBillsTab = ({ route }: any) => {
  const { groupId } = route.params;
  const { data: bills, isLoading, refetch } = useGetBillsByGroup(groupId);

  // Gom nhóm các hóa đơn thanh toán nợ trùng lặp
  const groupedBills = useMemo(() => {
    if (!bills) return [];
    const processedBills: (Bill & { count: number, ids: string[] })[] = [];
    const paymentMap = new Map<string, number>();

    // Sắp xếp mới nhất trước
    const sortedBills = [...bills].sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());

    sortedBills.forEach(bill => {
       const isPayment = bill.isPayment || bill.description?.startsWith("Thanh toán nợ");
       if (isPayment) {
           const date = new Date(bill.createdTime).toDateString();
           const key = `${bill.description}_${date}`;
           
           if (paymentMap.has(key)) {
               const index = paymentMap.get(key)!;
               processedBills[index].totalAmount += bill.totalAmount;
               processedBills[index].count += 1;
               processedBills[index].ids.push(bill.id);
           } else {
               paymentMap.set(key, processedBills.length);
               processedBills.push({ ...bill, count: 1, ids: [bill.id] });
           }
       } else {
           processedBills.push({ ...bill, count: 1, ids: [bill.id] });
       }
    });
    return processedBills;
  }, [bills]);

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={APP_COLOR.ORANGE}
        style={styles.center}
      />
    );
  }

  const renderItem = ({ item }: { item: Bill & { count?: number } }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/(tabs)/groups/bill/${item.id}`)}
    >
      <View style={styles.itemIcon}>
        <Ionicons name="receipt-outline" size={24} color="#007AFF" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>
          {item.description}
          {item.count && item.count > 1 && <Text style={{color: APP_COLOR.ORANGE, fontSize: 12}}> ({item.count} khoản)</Text>}
        </Text>
        <Text style={styles.itemDate}>{new Date(item.createdTime).toLocaleDateString('vi-VN')}</Text>
      </View>
      <View style={styles.itemAmountContainer}>
        <Text style={styles.itemAmount}>
          {item.totalAmount.toLocaleString('vi-VN')} ₫
        </Text>
        <Ionicons name="chevron-forward" size={20} color="gray" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={groupedBills}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>Chưa có hóa đơn nào.</Text>
          </View>
        }
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={{ padding: 10 }}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/groups/create-bill',
            params: { groupId: groupId },
          })
        }
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 14,
    color: 'gray',

  },
  itemAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF', // Màu xanh dương
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
  },
});

export default GroupBillsTab;