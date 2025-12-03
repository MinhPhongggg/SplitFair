// src/app/(tabs)/debts.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentApp } from '@/context/app.context';
import { useGetAllDebtsByUser, useSettleDebt, useUserSearch } from '@/api/hooks'; // Giả sử bạn có hook lấy tên user, nếu không sẽ hiển thị ID tạm
import { APP_COLOR } from '@/utils/constant';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Debt } from '@/types/debt.types';
import Avatar from '@/component/Avatar';
import { useToast } from '@/context/toast.context';
import { getAccountAPI } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa Tab
type TabType = 'PAYABLES' | 'RECEIVABLES';

const DebtScreen = () => {
  const { appState, setAppState } = useCurrentApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('PAYABLES');
  
  // Tự động lấy lại thông tin user nếu bị mất state (F5/Reload)
  useEffect(() => {
    const restoreUser = async () => {
      if (!appState?.userId) {
        try {
          const token = await AsyncStorage.getItem("token");
          if (token) {
             const res = await getAccountAPI();
             if (res) {
                setAppState({ ...res, token });
             }
          }
        } catch (e) {
          console.log("Failed to restore user session", e);
        }
      }
    };
    restoreUser();
  }, [appState?.userId]);

  // Lấy dữ liệu
  const userId = appState?.userId ? String(appState.userId) : '';
  const { data: allDebts, isLoading, refetch } = useGetAllDebtsByUser(userId);
  const { mutate: settleDebt, isPending: isSettling } = useSettleDebt();

  // Debug log
  console.log("AppState:", JSON.stringify(appState, null, 2));
  console.log("Current User ID:", userId);
  console.log("All Debts Data:", allDebts);

  // Xử lý dữ liệu: Phân loại Nợ và Lọc Unsettled
  const { payables, receivables } = useMemo(() => {
    if (!allDebts) return { payables: [], receivables: [] };

    const unsettled = allDebts.filter(d => d.status === 'UNSETTLED');
    
    // Mình là fromUserId => Mình nợ (Payables)
    const pay = unsettled.filter(d => d.fromUserId === userId);
    
    // Mình là toUserId => Người khác nợ mình (Receivables)
    const receive = unsettled.filter(d => d.toUserId === userId);

    return { payables: pay, receivables: receive };
  }, [allDebts, userId]);

  const handleSettle = (debt: Debt) => {
    Alert.alert(
        "Xác nhận",
        activeTab === 'PAYABLES' 
            ? "Đánh dấu khoản nợ này là ĐÃ TRẢ?" 
            : "Xác nhận bạn ĐÃ NHẬN được tiền?",
        [
            { text: "Hủy", style: "cancel" },
            { 
                text: "Đồng ý", 
                onPress: () => {
                    settleDebt(debt.id, {
                        onSuccess: () => showToast('success', 'Thành công', 'Đã cập nhật trạng thái nợ.'),
                        onError: () => showToast('error', 'Lỗi', 'Không thể cập nhật.')
                    });
                } 
            }
        ]
    );
  };

  const renderItem = ({ item }: { item: Debt }) => {
    // Vì DebtDTO hiện tại chưa trả về tên User, ta tạm dùng logic hiển thị ID hoặc cần BE update thêm field userName
    // Ở đây mình giả định hiển thị Avatar component sẽ tự handle việc lấy tên từ ID nếu có mapping, 
    // hoặc hiển thị "Người dùng..."
    
    // Logic hiển thị người liên quan
    const isMeOwe = item.fromUserId === userId;
    const targetUserId = isMeOwe ? item.toUserId : item.fromUserId;
    
    // *Lưu ý: Để hiển thị Tên đẹp, bạn cần dùng hook useGetAllUsers hoặc update DTO BE trả về tên.
    // Tạm thời hiển thị text generic
    const displayLabel = isMeOwe ? "Trả cho:" : "Nhận từ:";

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
            <Avatar name="User" size={40} /> 
            <View style={{marginLeft: 12}}>
                <Text style={styles.cardLabel}>{displayLabel}</Text>
                {/* Tạm thời hiển thị ID rút gọn nếu chưa có tên */}
                <Text style={styles.cardName} numberOfLines={1}>Người dùng {targetUserId.substring(0, 5)}...</Text> 
                {item.groupName && (
                  <Text style={styles.groupName} numberOfLines={1}>
                    <Ionicons name="people-outline" size={12} color="#666" /> {item.groupName}
                  </Text>
                )}
            </View>
        </View>
        
        <View style={styles.cardRight}>
            <Text style={[styles.amount, isMeOwe ? styles.textRed : styles.textGreen]}>
                {item.amount.toLocaleString('vi-VN')} đ
            </Text>
            <TouchableOpacity 
                style={[styles.actionBtn, isMeOwe ? styles.btnOutline : styles.btnFill]}
                onPress={() => handleSettle(item)}
            >
                <Text style={[styles.btnText, !isMeOwe && {color: 'white'}]}>
                    {isMeOwe ? "Đã trả" : "Đã nhận"}
                </Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  const currentData = activeTab === 'PAYABLES' ? payables : receivables;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý nợ</Text>
      </View>

      {/* Tabs Switcher */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'PAYABLES' && styles.activeTab]} 
            onPress={() => setActiveTab('PAYABLES')}
        >
            <Text style={[styles.tabText, activeTab === 'PAYABLES' && styles.activeTabText]}>
                Cần trả ({payables.length})
            </Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'RECEIVABLES' && styles.activeTab]} 
            onPress={() => setActiveTab('RECEIVABLES')}
        >
            <Text style={[styles.tabText, activeTab === 'RECEIVABLES' && styles.activeTabText]}>
                Sắp nhận ({receivables.length})
            </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={APP_COLOR.ORANGE} /></View>
      ) : (
        <FlatList
            data={currentData}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-done-circle-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Tuyệt vời! Không có khoản nợ nào.</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  tabsContainer: { flexDirection: 'row', margin: 15, backgroundColor: 'white', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: APP_COLOR.ORANGE },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: 'white' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 15, paddingBottom: 20 },

  card: {
    backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 15, borderRadius: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#333' },
  groupName: { fontSize: 12, color: '#666', marginTop: 2 },
  
  cardRight: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  textRed: { color: '#FF3B30' },
  textGreen: { color: '#34C759' },
  
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, borderWidth: 1 },
  btnOutline: { borderColor: '#ccc', backgroundColor: 'transparent' },
  btnFill: { borderColor: APP_COLOR.ORANGE, backgroundColor: APP_COLOR.ORANGE },
  btnText: { fontSize: 12, fontWeight: '600', color: '#666' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#999' },
});

export default DebtScreen;