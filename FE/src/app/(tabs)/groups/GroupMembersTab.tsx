import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useGetGroupMembers, useUserSearch, useAddMember } from '@/api/hooks';
import { APP_COLOR } from '@/utils/constant';
import Ionicons from '@expo/vector-icons/Ionicons';
import { User } from '@/types/user.types';
import { useToast } from '@/context/toast.context';
// Components
import { MemberItem } from '@/component/group/MemberItem';
import { AddMemberModal } from '@/component/group/AddMemberModal';

const GroupMembersTab = ({ route }: any) => {
  const { groupId } = route.params;
  const { data: members, isLoading, refetch } = useGetGroupMembers(groupId);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [query, setQuery] = useState('');
  const { showToast } = useToast();
  
  const { data: users, isLoading: isSearching } = useUserSearch(query);
  const { mutate: addMember, isPending: isAdding } = useAddMember(groupId as string);

  const handleAdd = (user: User) => {
    const isExist = members?.some(m => m.userId === user.id || m.user?.id === user.id);
    if (isExist) {
      showToast('warning', 'Đã tồn tại', 'Thành viên này đã có trong nhóm.');
      return;
    }
    addMember({ userId: user.id }, {
      onSuccess: () => {
        showToast('success', 'Thành công', `Đã thêm ${user.name} vào nhóm.`);
        refetch(); setQuery(''); setShowAddMemberModal(false);
      },
      onError: (err: any) => showToast('error', 'Lỗi', err.response?.data?.message || err.message),
    });
  };

  if (isLoading) return <ActivityIndicator size="large" color={APP_COLOR.ORANGE} style={styles.center} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Danh sách thành viên ({members?.length || 0})</Text>
      </View>
      
      <FlatList
        data={members || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemberItem item={item} />}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>Chưa có thành viên nào.</Text></View>}
        onRefresh={refetch} refreshing={isLoading}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddMemberModal(true)}>
        <Ionicons name="person-add" size={24} color="white" />
      </TouchableOpacity>

      <AddMemberModal
        visible={showAddMemberModal} onClose={() => setShowAddMemberModal(false)}
        query={query} setQuery={setQuery} users={users} isSearching={isSearching}
        onAddMember={handleAdd} isAdding={isAdding} groupId={groupId}
        showToast={(type: any, title: string, msg: string) => showToast(type, title, msg)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 15, paddingBottom: 80 },
  headerContainer: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyText: { color: 'gray', marginTop: 10 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: APP_COLOR.ORANGE, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 },
});

export default GroupMembersTab;