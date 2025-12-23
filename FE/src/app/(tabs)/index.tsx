import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentApp } from '@/context/app.context';
import { APP_COLOR } from '@/utils/constant';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useGetGroups } from '@/api/hooks';
import Avatar from '@/component/Avatar';
import { SelectionModal } from '@/component/expense/SelectionModal';
import { JoinGroupModal } from '@/component/group/JoinGroupModal';

const { width } = Dimensions.get('window');

const FeatureCard = ({ icon, title, description, color, onPress }: any) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDesc}>{description}</Text>
  </TouchableOpacity>
);

const HomeTab = () => {
  const { appState } = useCurrentApp();
  const { data: groups, isLoading, refetch } = useGetGroups();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showNoGroupModal, setShowNoGroupModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleCreateBillPress = () => {
    if (!groups || groups.length === 0) {
        setShowNoGroupModal(true);
        return;
    }
    setShowGroupModal(true);
  };

  const handleGroupSelect = (groupId: string) => {
    setShowGroupModal(false);
    router.push({
        pathname: '/(tabs)/groups/create-expense',
        params: { groupId }
    });
  };

  // Lấy 3 nhóm gần nhất (giả sử API trả về theo thứ tự hoặc sort lại)
  const recentGroups = groups ? groups.slice(0, 3) : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{appState?.userName || 'Bạn mới'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/account')}>
             <Avatar name={appState?.userName || 'User'} avatar={appState?.avatar} size={45} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={[APP_COLOR.ORANGE, '#FFB74D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Quản lý chi tiêu nhóm</Text>
            <Text style={styles.heroSubtitle}>
              Chia tiền công bằng, minh bạch và nhanh chóng chỉ với vài bước đơn giản.
            </Text>
            <TouchableOpacity 
                style={styles.heroButton}
                onPress={() => router.push('/(tabs)/groups')}
            >
              <Text style={styles.heroButtonText}>Bắt đầu ngay</Text>
              <Ionicons name="arrow-forward" size={16} color={APP_COLOR.ORANGE} />
            </TouchableOpacity>
          </View>
          <Ionicons name="wallet-outline" size={100} color="rgba(255,255,255,0.2)" style={styles.heroIcon} />
        </LinearGradient>

        {/* Features Grid */}
        <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
        <View style={styles.gridContainer}>
          <FeatureCard
            icon="receipt"
            title="Tạo Bill"
            description="Thêm chi tiêu mới vào nhóm."
            color="#FF5722"
            onPress={handleCreateBillPress}
          />
          <FeatureCard
            icon="people"
            title="Tạo Nhóm"
            description="Tạo nhóm cho chuyến đi, nhà trọ hoặc ăn uống."
            color="#4CAF50"
            onPress={() => router.push('/create-group')}
          />
          <FeatureCard
            icon="pie-chart"
            title="Thống Kê"
            description="Xem biểu đồ chi tiêu theo tuần, tháng."
            color="#9C27B0"
            onPress={() => router.push('/statistics')}
          />
        </View>

        {/* Recent Groups */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhóm gần đây</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/groups')}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
        </View>
        
        {recentGroups.length > 0 ? (
            <View style={styles.groupList}>
                {recentGroups.map((group) => (
                    <TouchableOpacity 
                        key={group.id} 
                        style={styles.groupItem}
                        onPress={() => router.push({
                            pathname: '/(tabs)/groups/[groupId]',
                            params: { groupId: group.id }
                        })}
                    >
                        <View style={[styles.groupIcon, { backgroundColor: '#E0EFFF' }]}>
                            <Ionicons name="people" size={24} color="#007AFF" />
                        </View>
                        <View style={styles.groupInfo}>
                            <Text style={styles.groupName}>{group.groupName}</Text>
                            <Text style={styles.groupDesc} numberOfLines={1}>
                                {group.description || 'Không có mô tả'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </View>
        ) : (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Bạn chưa tham gia nhóm nào.</Text>
                <TouchableOpacity onPress={() => router.push('/create-group')}>
                    <Text style={styles.createLink}>Tạo nhóm mới ngay</Text>
                </TouchableOpacity>
            </View>
        )}

      </ScrollView>

      <SelectionModal
        visible={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Chọn nhóm"
        options={groups?.map(g => ({ label: g.groupName, value: g.id })) || []}
        onSelect={handleGroupSelect}
        selectedValue=""
      />

      <Modal
        transparent
        visible={showNoGroupModal}
        animationType="fade"
        onRequestClose={() => setShowNoGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
               <Ionicons name="people-circle-outline" size={60} color={APP_COLOR.ORANGE} />
            </View>
            <Text style={styles.modalTitle}>Chưa có nhóm</Text>
            <Text style={styles.modalMessage}>
              Bạn cần tham gia hoặc tạo một nhóm để bắt đầu thêm chi tiêu.
            </Text>
            
            <View style={styles.modalActions}>
               <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => { setShowNoGroupModal(false); router.push('/create-group'); }}
               >
                  <Text style={styles.modalButtonTextPrimary}>Tạo nhóm mới</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => { setShowNoGroupModal(false); setShowJoinModal(true); }}
               >
                  <Text style={styles.modalButtonTextSecondary}>Tham gia nhóm</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                  style={styles.modalButtonTextOnly}
                  onPress={() => setShowNoGroupModal(false)}
               >
                  <Text style={styles.modalButtonTextCancel}>Để sau</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <JoinGroupModal 
        visible={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  
  // Hero
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    position: 'relative',
    overflow: 'hidden',
    height: 160,
    justifyContent: 'center',
  },
  heroContent: {
    zIndex: 1,
    width: '80%',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    lineHeight: 18,
  },
  heroButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroButtonText: {
    color: APP_COLOR.ORANGE,
    fontWeight: 'bold',
    fontSize: 13,
  },
  heroIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },

  // Grid
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  featureCard: {
    width: (width - 55) / 2, // 2 columns with padding
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },

  // Recent Groups
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
  },
  seeAll: {
      color: APP_COLOR.ORANGE,
      fontSize: 13,
      fontWeight: '600',
  },
  groupList: {
      gap: 10,
  },
  groupItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#F0F0F0',
  },
  groupIcon: {
      width: 45,
      height: 45,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
  },
  groupInfo: {
      flex: 1,
  },
  groupName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 2,
  },
  groupDesc: {
      fontSize: 13,
      color: '#888',
  },
  emptyState: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 12,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: '#ccc',
  },
  emptyText: {
      color: '#888',
      marginBottom: 5,
  },
  createLink: {
      color: APP_COLOR.ORANGE,
      fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 25,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: APP_COLOR.ORANGE,
    shadowColor: APP_COLOR.ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtonSecondary: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtonTextSecondary: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextOnly: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    color: '#888',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default HomeTab;
