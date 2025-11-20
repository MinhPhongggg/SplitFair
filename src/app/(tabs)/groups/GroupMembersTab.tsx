// src/app/(tabs)/groups/GroupMembersTab.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GroupMember } from '@/types/group.types';
import {
  useGetGroupMembers,
  useUserSearch,
  useAddMember,
} from '@/api/hooks';
import { User } from '@/types/user.types';
import { APP_COLOR } from '@/utils/constant';
import { useToast } from '@/context/toast.context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from '@/component/Avatar';

const GroupMembersTab = ({ route }: any) => {
  const { groupId } = route.params;

  // --- Hooks ---
  const { data: members, isLoading, refetch } = useGetGroupMembers(groupId);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [query, setQuery] = useState('');
  const { showToast } = useToast();
  
  // Search Hooks
  const { data: users, isLoading: isSearching } = useUserSearch(query);
  const { mutate: addMember, isPending: isAdding } = useAddMember(groupId as string);

  // --- Handlers ---
  const handleAdd = (user: User) => {
    addMember(
      { userId: user.id },
      {
        onSuccess: () => {
          showToast('success', 'Thành công', `Đã thêm ${user.name} vào nhóm.`);
          refetch();
          setQuery('');
          setShowAddMemberModal(false);
        },
        onError: (err: any) => {
          showToast('error', 'Lỗi', err.response?.data?.message || err.message);
        },
      }
    );
  };

  // --- Render Member Item (Card Style Đồng bộ) ---
  const renderMemberItem = ({ item }: { item: GroupMember }) => {
    // Xử lý dữ liệu linh hoạt (DTO hoặc Entity)
    const name = item.userName || item.user?.userName || 'Thành viên';
    const role = item.roleName || item.role?.name || 'MEMBER';
    const isLeader = role === 'LEADER';

    return (
      <View style={styles.memberCard}>
        <Avatar name={name} />
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{name}</Text>
          {/* Badge Role */}
          <View style={[styles.roleBadge, isLeader ? styles.roleLeader : styles.roleMember]}>
            <Text style={[styles.roleText, isLeader ? styles.roleTextLeader : styles.roleTextMember]}>
              {isLeader ? 'Trưởng nhóm' : 'Thành viên'}
            </Text>
          </View>
        </View>
        
        {/* Nút tùy chọn (Để sau này mở rộng) */}
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    );
  };

  // --- Render Search Result ---
  const renderSearchResultItem = ({ item }: { item: User }) => (
    <View style={styles.resultItem}>
      <Avatar name={item.name} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleAdd(item)}
        disabled={isAdding}
        style={styles.addButtonSmall}
      >
        {isAdding ? (
            <ActivityIndicator color="white" size="small" />
        ) : (
            <Text style={styles.addButtonSmallText}>Thêm</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={APP_COLOR.ORANGE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Title (Giống tab Thống kê) */}
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Danh sách thành viên ({members?.length || 0})</Text>
      </View>

      <FlatList
        data={members || []}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Chưa có thành viên nào.</Text>
          </View>
        }
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.listContent}
      />

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddMemberModal(true)}
      >
        <Ionicons name="person-add" size={24} color="white" />
      </TouchableOpacity>

      {/* ---- MODAL BOTTOM SHEET ---- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddMemberModal}
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm thành viên mới</Text>
                <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                    <Ionicons name="close-circle" size={28} color="#eee" /> 
                    {/* Đổi màu icon đóng cho nhẹ nhàng hơn */}
                </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Nhập email hoặc tên..."
                  placeholderTextColor="#999"
                  autoFocus={false}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Search Results */}
            <View style={styles.resultsContainer}>
                {isSearching ? (
                    <ActivityIndicator color={APP_COLOR.ORANGE} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                    data={users || []}
                    renderItem={renderSearchResultItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        query.length >= 2 ? (
                        <Text style={styles.hintText}>Không tìm thấy người dùng này.</Text>
                        ) : (
                        <View style={styles.searchPlaceholder}>
                             <Ionicons name="people-outline" size={48} color="#eee" />
                             <Text style={styles.hintText}>Nhập tối thiểu 2 ký tự để tìm kiếm</Text>
                        </View>
                        )
                    }
                    keyboardShouldPersistTaps="handled"
                    />
                )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' }, // Màu nền xám nhẹ đồng bộ
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 15, paddingBottom: 80 },
  emptyText: { color: 'gray', marginTop: 10 },

  // Header Title
  headerContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#666', // Màu xám đậm giống header các tab khác
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  // Member Card Styles
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    // Shadow nhẹ nhàng giống thẻ Expense
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: { flex: 1, marginLeft: 0 }, 
  memberName: { fontSize: 16, fontWeight: '600', color: '#333' },
  moreBtn: { padding: 5 },

  // Role Badge
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  roleLeader: { backgroundColor: '#FFF5E5' }, 
  roleMember: { backgroundColor: '#F9F9F9' }, 
  roleText: { fontSize: 11, fontWeight: '600' },
  roleTextLeader: { color: APP_COLOR.ORANGE },
  roleTextMember: { color: '#888' },

  // FAB
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: APP_COLOR.ORANGE,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4},
    elevation: 6,
  },

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Màu nền tối hơn chút
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3,
    alignSelf: 'center', marginBottom: 15,
  },
  modalHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  // Search Bar
  searchContainer: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#F5F5F5', borderRadius: 10,
      paddingHorizontal: 10, height: 50, marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', height: '100%' },
  
  // Results
  resultsContainer: { flex: 1 },
  searchPlaceholder: { alignItems: 'center', marginTop: 60, gap: 15 },
  hintText: { textAlign: 'center', color: 'gray' },

  resultItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  resultInfo: { flex: 1, marginLeft: 0 },
  resultName: { fontSize: 16, fontWeight: '600' },
  resultEmail: { fontSize: 13, color: 'gray' },
  
  addButtonSmall: {
    backgroundColor: '#E0EFFF',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 15,
  },
  addButtonSmallText: { color: '#007AFF', fontWeight: '600', fontSize: 12 },
});

export default GroupMembersTab;