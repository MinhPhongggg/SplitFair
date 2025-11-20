// src/app/(tabs)/groups/member/[userId].tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  useGetGroupBalances,
  useGetGroupPaymentStats,
  useGetExpensesByGroup,
  useGetSharesByUser,
} from '@/api/hooks';
import { APP_COLOR } from '@/utils/constant';
import Avatar from '@/component/Avatar';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const MemberDetailScreen = () => {
  const { userId, userName, groupId } = useLocalSearchParams<{
    userId: string;
    userName: string;
    groupId: string;
  }>();

  // --- Hooks lấy dữ liệu ---
  const { data: balances, isLoading: l1 } = useGetGroupBalances(groupId);
  const { data: stats, isLoading: l2 } = useGetGroupPaymentStats(groupId);
  const { data: groupExpenses, isLoading: l3 } = useGetExpensesByGroup(groupId);
  const { data: allUserShares, isLoading: l4 } = useGetSharesByUser(userId);

  if (l1 || l2 || l3 || l4) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={APP_COLOR.ORANGE} />
      </View>
    );
  }

  // --- Tính toán số liệu ---
  
  // 1. Số dư (Balance)
  const userBalance = balances?.find((b) => b.userId === userId);
  const balanceAmount = userBalance ? parseFloat(userBalance.netAmount) : 0;

  // 2. Đã trả (Total Paid)
  const userStats = stats?.find((s) => s.userName === userName);
  const totalPaid = userStats ? userStats.totalAmount : 0;

  // 3. Đã tạo (Created)
  const totalCreated =
    groupExpenses?.filter((e) => e.createdBy === userId).length || 0;

  // 4. Đã tham gia (Benefits from)
  const groupExpenseIds = groupExpenses?.map(e => e.id) || [];
  const totalBenefits =
    allUserShares?.filter(share => groupExpenseIds.includes(share.expenseId))
      .length || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin thành viên</Text>
        <View style={{ width: 34 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- 1. Profile Card --- */}
        <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
                <Avatar name={userName as string} size={80} /> 
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>Thành viên nhóm</Text>
        </View>

        {/* --- 2. Số dư nổi bật (Big Stat) --- */}
        <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
            <Text style={[styles.balanceValue, balanceAmount < 0 ? styles.debt : styles.credit]}>
            {balanceAmount === 0 ? '0' : (balanceAmount > 0 ? '+' : '')}
            {balanceAmount.toLocaleString('vi-VN')} <Text style={styles.currency}>VND</Text>
            </Text>
            <View style={[styles.statusTag, balanceAmount < 0 ? styles.tagDebt : styles.tagCredit]}>
                <Ionicons 
                    name={balanceAmount < 0 ? "alert-circle" : "checkmark-circle"} 
                    size={14} 
                    color="white" 
                />
                <Text style={styles.statusText}>
                    {balanceAmount === 0 ? 'Sòng phẳng' : (balanceAmount < 0 ? 'Đang nợ' : 'Được nhận')}
                </Text>
            </View>
        </View>

        {/* --- 3. Lưới thống kê chi tiết (Grid Stats) --- */}
        <Text style={styles.sectionTitle}>Hoạt động trong nhóm</Text>
        
        <View style={styles.statsGrid}>
            {/* Card 1: Đã chi trả */}
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="wallet" size={24} color="#2196F3" />
                </View>
                <Text style={styles.statValue}>{totalPaid.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.statLabel}>Tổng tiền đã trả</Text>
            </View>

            {/* Card 2: Số lần tạo */}
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="add-circle" size={24} color={APP_COLOR.ORANGE} />
                </View>
                <Text style={styles.statValue}>{totalCreated}</Text>
                <Text style={styles.statLabel}>Chi tiêu đã tạo</Text>
            </View>

            {/* Card 3: Tham gia */}
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
                    <Ionicons name="people" size={24} color="#9C27B0" />
                </View>
                <Text style={styles.statValue}>{totalBenefits}</Text>
                <Text style={styles.statLabel}>Lần được chia tiền</Text>
            </View>

            {/* Card 4: Đóng góp */}
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="stats-chart" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>--</Text>
                <Text style={styles.statLabel}>Đóng góp</Text>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  scrollContent: { padding: 20 },

  // Profile Card
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
  },
  currency: { fontSize: 18, fontWeight: '600', color: '#999' },
  debt: { color: '#FF3B30' }, 
  credit: { color: '#34C759' }, 

  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  tagDebt: { backgroundColor: '#FF3B30' },
  tagCredit: { backgroundColor: '#34C759' },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  // Stats Grid
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 40 - 15) / 2, // (Screen - Padding - Gap) / 2
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 48, height: 48,
    borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default MemberDetailScreen;