// src/app/(tabs)/groups/GroupStatsTab.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView, // 👈 1. Import KeyboardAvoidingView
  Platform, // 👈 2. Import Platform
} from 'react-native';
import { router } from 'expo-router';
import { APP_COLOR } from '@/utils/constant';
import {
  useGetGroupPaymentStats,
  useGetGroupBalances,
  useGetExpensesByGroup,
  useGetGroupMembers,
} from '@/api/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';
import SkiaPieChart from '@/component/SkiaPieChart';
import { Balance } from '@/types/stats.types';
import { useCurrentApp } from '@/context/app.context';
import Avatar from '@/component/Avatar';

const PIE_COLORS = ['#007AFF', '#FFCC00', '#34C759', '#FF3B30', '#8E8E93'];

type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC';

const GroupStatsTab = ({ route }: any) => {
  const { groupId } = route.params;
  const { appState } = useCurrentApp();
  const [activeTab, setActiveTab] = useState<'BALANCES' | 'TRANSACTIONS'>('BALANCES');

  // --- STATE TÌM KIẾM & LỌC ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterPayer, setFilterPayer] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('DATE_DESC');

  // --- API ---
  const { data: stats, isLoading: l1 } = useGetGroupPaymentStats(groupId);
  const { data: balances, isLoading: l2 } = useGetGroupBalances(groupId);
  const { data: expenses, isLoading: l3 } = useGetExpensesByGroup(groupId);
  const { data: members, isLoading: l4 } = useGetGroupMembers(groupId);

  // --- LOGIC LỌC ---
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    let result = [...expenses];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (filterPayer) {
      result = result.filter((e) => e.paidBy === filterPayer);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'DATE_DESC':
          return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
        case 'DATE_ASC':
          return new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
        case 'AMOUNT_DESC':
          return b.amount - a.amount;
        case 'AMOUNT_ASC':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
    return result;
  }, [expenses, searchQuery, filterPayer, sortOption]);

  // --- HÀM RESET LỌC (MỚI) ---
  const handleResetFilter = () => {
    setFilterPayer(null);
    setSortOption('DATE_DESC');
    // Không reset searchQuery để người dùng vẫn giữ từ khóa tìm kiếm nếu muốn
    setShowFilterModal(false);
  };

  const getMemberName = (m: any) => m.userName || m.user?.userName || 'Thành viên';
  const getMemberId = (m: any) => m.userId || m.user?.id;

  const getPayerName = (paidById: string) => {
    const member = members?.find((m) => getMemberId(m) === paidById);
    return member ? getMemberName(member) : 'Ai đó';
  };

  if (l1 || l2 || l3 || l4) {
    return <ActivityIndicator size="large" color={APP_COLOR.ORANGE} style={styles.center} />;
  }

  // ... (Logic tính toán thống kê giữ nguyên) ...
  const totalSpent = stats?.reduce((sum, stat) => sum + stat.totalAmount, 0) || 0;
  const pieData = stats
    ? stats.map((stat, index) => ({
        key: stat.userName,
        value: stat.totalAmount,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }))
    : [];
    
  const myBalanceObj = balances?.find(b => b.userId === appState?.userId);
  const myPaymentObj = stats?.find(s => s.userName === appState?.userName);
  const myNetBalance = myBalanceObj ? parseFloat(myBalanceObj.netAmount) : 0;
  const myTotalPaid = myPaymentObj ? myPaymentObj.totalAmount : 0;
  const myActualCost = myTotalPaid - myNetBalance;

  // ... (renderPersonalStats & renderBalanceList giữ nguyên) ...
  const renderPersonalStats = () => {
     const isDebt = myNetBalance < 0;
     return (
       <View style={styles.personalCard}>
         <Text style={styles.cardTitle}>Cá nhân tôi</Text>
         <View style={styles.rowStat}>
           <View style={styles.statItem}>
             <Text style={styles.statLabel}>Số dư nợ</Text>
             <Text style={[styles.statValue, isDebt ? styles.debt : styles.credit]}>
               {myNetBalance === 0 ? '0đ' : `${isDebt ? '' : '+'}${myNetBalance.toLocaleString('vi-VN')}đ`}
             </Text>
             <Text style={styles.statSub}>{isDebt ? 'Bạn đang nợ' : 'Bạn được nhận'}</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.statItem}>
             <Text style={styles.statLabel}>Chi tiêu thực</Text>
             <Text style={[styles.statValue, { color: '#333' }]}>
               {myActualCost.toLocaleString('vi-VN')}đ
             </Text>
             <Text style={styles.statSub}>Tổng phần của bạn</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.statItem}>
             <Text style={styles.statLabel}>Đã trả</Text>
             <Text style={[styles.statValue, { color: '#007AFF' }]}>
               {myTotalPaid.toLocaleString('vi-VN')}đ
             </Text>
             <Text style={styles.statSub}>Tiền bạn đã ứng</Text>
           </View>
         </View>
       </View>
     );
  };

  const renderBalanceList = () => (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>Chi tiết công nợ nhóm</Text>
      {balances && balances.filter(b => parseFloat(b.netAmount) !== 0).length > 0 ? (
        balances.map((balance) => {
          const amount = parseFloat(balance.netAmount);
          if (amount === 0) return null;
          const isDebt = amount < 0;
          return (
            <TouchableOpacity
              key={balance.userId}
              style={styles.balanceItem}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/groups/member/[userId]',
                  params: { userId: balance.userId, userName: balance.userName, groupId },
                })
              }
            >
              <Avatar name={balance.userName} />
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceName}>{balance.userName}</Text>
                <Text style={styles.balanceStatus}>{isDebt ? 'đang nợ' : 'được nhận lại'}</Text>
              </View>
              <Text style={[styles.balanceAmount, isDebt ? styles.debt : styles.credit]}>
                {isDebt ? '' : '+'}{amount.toLocaleString('vi-VN')}đ
              </Text>
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={styles.emptyText}>Mọi người đã thanh toán sòng phẳng.</Text>
      )}
    </View>
  );

  // --- TAB GIAO DỊCH ---
  const renderTransactions = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.chartTitle}>Tổng chi tiêu: <Text style={{color: APP_COLOR.ORANGE}}>{totalSpent.toLocaleString('vi-VN')}đ</Text></Text>
        <View style={styles.chartContainer}>
          <SkiaPieChart data={pieData} size={140} totalValue={totalSpent} />
          <View style={styles.legendContainer}>
            {stats?.map((stat, index) => (
              <View style={styles.legendItem} key={stat.userName}>
                <View style={[styles.legendColor, { backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }]} />
                <Text style={styles.legendName}>{stat.userName}</Text>
                <Text style={styles.legendPercent}>{((stat.totalAmount / totalSpent) * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Lịch sử chi tiêu</Text>
        
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="gray" style={{marginRight: 5}}/>
            <TextInput 
              placeholder="Tìm kiếm..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="gray" />
                </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, (!!filterPayer || sortOption !== 'DATE_DESC') && styles.filterActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options" size={24} color={(filterPayer || sortOption !== 'DATE_DESC') ? APP_COLOR.ORANGE : "#555"} />
          </TouchableOpacity>
        </View>
      </View>

      {filteredExpenses.map((item) => {
        const payerName = getPayerName(item.paidBy);
        const date = new Date(item.createdTime);
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.expenseItem}
            onPress={() => router.push({
                pathname: '/(tabs)/groups/expense/[expenseId]',
                params: { expenseId: item.id }
            })}
          >
            <View style={styles.dateBox}>
              <Text style={styles.dateMonth}>T{(date.getMonth() + 1).toString().padStart(2, '0')}</Text>
              <Text style={styles.dateDay}>{date.getDate()}</Text>
            </View>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseName}>{item.description}</Text>
              <Text style={styles.expensePayer}>{payerName} đã trả</Text>
            </View>
            <View>
                <Text style={styles.expenseAmount}>{item.amount.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.expenseSub}>chi tiêu</Text>
            </View>
          </TouchableOpacity>
        );
      })}
      {filteredExpenses.length === 0 && (
        <Text style={styles.emptyText}>
          {searchQuery || filterPayer ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có chi tiêu nào.'}
        </Text>
      )}
    </View>
  );

  // --- MODAL BỘ LỌC (CÓ NÚT RESET) ---
  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilterModal}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bộ Lọc & Sắp Xếp</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Sắp xếp theo</Text>
          <View style={styles.filterOptions}>
            {/* ... (Các nút sắp xếp giữ nguyên) ... */}
            <TouchableOpacity style={[styles.filterChip, sortOption === 'DATE_DESC' && styles.chipActive]} onPress={() => setSortOption('DATE_DESC')}>
                <Text style={[styles.chipText, sortOption === 'DATE_DESC' && styles.chipTextActive]}>Mới nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, sortOption === 'DATE_ASC' && styles.chipActive]} onPress={() => setSortOption('DATE_ASC')}>
                <Text style={[styles.chipText, sortOption === 'DATE_ASC' && styles.chipTextActive]}>Cũ nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, sortOption === 'AMOUNT_DESC' && styles.chipActive]} onPress={() => setSortOption('AMOUNT_DESC')}>
                <Text style={[styles.chipText, sortOption === 'AMOUNT_DESC' && styles.chipTextActive]}>Tiền cao nhất</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Người trả tiền</Text>
          <ScrollView style={{maxHeight: 150}}>
            <TouchableOpacity style={styles.rowFilter} onPress={() => setFilterPayer(null)}>
                <Ionicons name={filterPayer === null ? "radio-button-on" : "radio-button-off"} size={20} color={APP_COLOR.ORANGE} />
                <Text style={styles.rowText}>Tất cả</Text>
            </TouchableOpacity>
            {members?.map(m => {
                const memberId = getMemberId(m);
                return (
                    <TouchableOpacity key={memberId || m.id} style={styles.rowFilter} onPress={() => memberId && setFilterPayer(memberId)}>
                        <Ionicons name={(filterPayer === memberId && memberId) ? "radio-button-on" : "radio-button-off"} size={20} color={APP_COLOR.ORANGE} />
                        <Text style={styles.rowText}>{getMemberName(m)}</Text>
                    </TouchableOpacity>
                );
            })}
          </ScrollView>

          {/* BUTTONS: Reset & Apply */}
          <View style={styles.modalFooter}>
             <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleResetFilter}
             >
                <Text style={styles.resetButtonText}>Đặt lại</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
             >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    // 👇 3. DÙNG KeyboardAvoidingView ĐỂ ĐẨY GIAO DIỆN LÊN
    <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Điều chỉnh offset nếu cần
    >
      <View style={styles.container}>
        <View style={styles.tabHeader}>
            {/* ... (Tabs Header giữ nguyên) ... */}
            <TouchableOpacity style={[styles.tabButton, activeTab === 'BALANCES' && styles.tabActive]} onPress={() => setActiveTab('BALANCES')}>
                <Text style={[styles.tabText, activeTab === 'BALANCES' && styles.tabTextActive]}>Nợ dư</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabButton, activeTab === 'TRANSACTIONS' && styles.tabActive]} onPress={() => setActiveTab('TRANSACTIONS')}>
                <Text style={[styles.tabText, activeTab === 'TRANSACTIONS' && styles.tabTextActive]}>Giao dịch</Text>
            </TouchableOpacity>
        </View>

        <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled" // Cho phép bấm nút khi bàn phím mở
        >
          {activeTab === 'BALANCES' ? (
              <>
                  {renderPersonalStats()}
                  {renderBalanceList()}
              </>
          ) : (
              renderTransactions()
          )}
          
          
        </ScrollView>

        {renderFilterModal()}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 15, paddingBottom: 80 },
  
  // ... (Các styles cũ giữ nguyên) ...
  tabHeader: { flexDirection: 'row', backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20, marginHorizontal: 5 },
  tabActive: { backgroundColor: '#E0EFFF' },
  tabText: { fontSize: 15, fontWeight: '600', color: 'gray' },
  tabTextActive: { color: '#007AFF' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  personalCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  rowStat: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: 'gray', marginBottom: 5 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  statSub: { fontSize: 10, color: '#999', marginTop: 2 },
  divider: { width: 1, backgroundColor: '#eee', height: '100%' },
  debt: { color: '#FF3B30' },
  credit: { color: '#34C759' },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  chartContainer: { flexDirection: 'row', alignItems: 'center' },
  legendContainer: { flex: 1, marginLeft: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' },
  legendColor: { width: 12, height: 12, borderRadius: 3, marginRight: 8 },
  legendName: { fontSize: 13, color: '#333', flex: 1 },
  legendPercent: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  totalLabel: { fontSize: 16, color: 'gray', textAlign: 'center' },
  totalAmount: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginTop: 5 },
  listHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 10, height: 40,
    borderWidth: 1, borderColor: '#ddd'
  },
  searchInput: { flex: 1, height: '100%' },
  filterButton: {
    marginLeft: 10, width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd'
  },
  filterActive: { borderColor: APP_COLOR.ORANGE, backgroundColor: '#FFF5E5' },
  expenseItem: {
    backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', elevation: 1,
  },
  dateBox: {
    backgroundColor: '#f0f0f0', padding: 8, borderRadius: 8, alignItems: 'center', marginRight: 12, width: 50,
  },
  dateMonth: { fontSize: 10, color: 'gray', fontWeight: 'bold' },
  dateDay: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  expenseInfo: { flex: 1 },
  expenseName: { fontSize: 16, fontWeight: '600' },
  expensePayer: { fontSize: 12, color: 'gray' },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
  expenseSub: { fontSize: 10, color: 'gray', textAlign: 'right' },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 20 },
  balanceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  balanceInfo: { flex: 1, marginLeft: 12 },
  balanceName: { fontSize: 16, fontWeight: '600' },
  balanceStatus: { fontSize: 13, color: 'gray' },
  balanceAmount: { fontSize: 16, fontWeight: 'bold' },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: APP_COLOR.ORANGE, width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  fabText: { fontSize: 30, color: 'white', marginTop: -2 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 10, marginBottom: 10 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#f0f0f0',
  },
  chipActive: { backgroundColor: APP_COLOR.ORANGE },
  chipText: { fontSize: 14, color: '#333' },
  chipTextActive: { color: 'white', fontWeight: 'bold' },
  rowFilter: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  rowText: { marginLeft: 10, fontSize: 16 },

  // Footer của Modal (Mới)
  modalFooter: { flexDirection: 'row', marginTop: 20, marginBottom: 20, gap: 10 },
  applyButton: {
    flex: 1, backgroundColor: APP_COLOR.ORANGE, padding: 15, borderRadius: 10, alignItems: 'center',
  },
  applyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  resetButton: {
    flex: 1, backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, alignItems: 'center',
  },
  resetButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});

export default GroupStatsTab;