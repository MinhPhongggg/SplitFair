import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { APP_COLOR } from '@/utils/constant';
import { useGetGroupById } from '@/api/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context'; 

// Import các file Tab con
import GroupBillsTab from './GroupBillsTab';
import GroupMembersTab from './GroupMembersTab';
import GroupStatsTab from './GroupStatsTab';

const Tab = createMaterialTopTabNavigator();

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const {
    data: group,
    isLoading,
    isError,
  } = useGetGroupById(groupId as string);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={APP_COLOR.ORANGE} />
      </View>
    );
  }

  if (isError || !group) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy thông tin nhóm.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupName = group?.groupName || 'Chi tiết nhóm';
  const memberCount = group?.members?.length || 0;
  const description = group?.description || 'Không có mô tả';
  // Lấy createdTime từ API, nếu không có thì hiển thị N/A
  const createdDate = group?.createdTime ? new Date(group.createdTime).toLocaleDateString('vi-VN') : 'N/A';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={APP_COLOR.ORANGE} />
      
      {/* --- 1. HEADER CAO CẤP --- */}
      <View style={styles.headerWrapper}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.headerContent}>
                {/* Nút Back & Settings */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.groupName} numberOfLines={1}>{groupName}</Text>
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => router.push({ pathname: '/(tabs)/groups/settings/[groupId]', params: { groupId } })}
                    >
                        <Ionicons name="settings-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Card Thông tin Nhóm */}
                <View style={styles.groupCard}>
                    <View style={styles.iconBox}>
                        <Ionicons name="people" size={32} color="white" />
                    </View>
                    <View style={styles.groupMeta}>
                        
                        <Text style={styles.groupDesc} numberOfLines={1}>{description}</Text>
                        <View style={styles.badgesRow}>
                            <View style={styles.badge}>
                                <Ionicons name="person" size={12} color="white" />
                                <Text style={styles.badgeText}>{memberCount} Thành viên</Text>
                            </View>
                            <View style={[styles.badge, { marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                                <Ionicons name="time" size={12} color="white" />
                                <Text style={styles.badgeText}>{createdDate}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
      </View>

      {/* --- 2. TAB CONTENT --- */}
      <View style={styles.tabContainer}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: APP_COLOR.ORANGE,
            tabBarInactiveTintColor: '#999',
            tabBarIndicatorStyle: { backgroundColor: APP_COLOR.ORANGE, height: 3, borderRadius: 3 },
            tabBarStyle: { 
                elevation: 0, 
                shadowOpacity: 0, 
                borderBottomWidth: 1, 
                borderBottomColor: '#f0f0f0',
                backgroundColor: 'white'
            },
            tabBarLabelStyle: { 
                fontSize: 13, 
                fontWeight: '700', 
                textTransform: 'capitalize' 
            },
          }}
        >
          <Tab.Screen
            name="Bills"
            component={GroupBillsTab}
            options={{ tabBarLabel: 'Hóa đơn' }}
            initialParams={{ groupId }}
          />
          <Tab.Screen
            name="Stats"
            component={GroupStatsTab}
            options={{ tabBarLabel: 'Thống kê' }}
            initialParams={{ groupId }}
          />
          <Tab.Screen
            name="Members"
            component={GroupMembersTab}
            options={{ tabBarLabel: 'Thành viên' }}
            initialParams={{ groupId }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'gray', fontSize: 16, marginBottom: 10 },
  backButton: { padding: 10 },
  backButtonText: { color: APP_COLOR.ORANGE, fontWeight: 'bold' },

  // Header Styles
  headerWrapper: {
    backgroundColor: APP_COLOR.ORANGE,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
  },
  safeArea: { flex: 0 }, // Chỉ lấy padding top của safe area
  headerContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },

  // Group Card Styles
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 60, height: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)'
  },
  groupMeta: { flex: 1 },
  groupName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2
  },
  groupDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginBottom: 8,
  },
  badgesRow: { flexDirection: 'row' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // Tab
  tabContainer: {
    flex: 1,
    marginTop: 10, // Khoảng cách nhỏ giữa header cong và tab
    backgroundColor: 'white', // Nền trắng cho tab
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  }
});

export default GroupDetailScreen;