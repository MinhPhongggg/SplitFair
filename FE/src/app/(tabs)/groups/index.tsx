import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { APP_COLOR } from "@/utils/constant";
import { Group } from "@/types/group.types";
import { useGetGroups } from "@/api/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useCurrentApp } from "@/context/app.context";
import { useToast } from "@/context/toast.context";
import Header from "@/component/Header";
import { JoinGroupModal } from "@/component/group/JoinGroupModal";

const GroupListScreen = () => {
  const { data: groups, isLoading, refetch } = useGetGroups();
  const { appState } = useCurrentApp();
  const { showToast } = useToast();

  // Join Group State
  const [showJoinModal, setShowJoinModal] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={APP_COLOR.ORANGE} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => router.push(`/(tabs)/groups/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.itemIcon}>
        <Ionicons name="people" size={28} color={APP_COLOR.ORANGE} />
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.groupName} numberOfLines={1}>
          {item.groupName}
        </Text>
        <Text style={styles.groupDesc} numberOfLines={1}>
          {item.description || `${item.members.length} thành viên`}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {item.description && (
          <View style={styles.badge}>
            <Ionicons
              name="person"
              size={10}
              color="#666"
              style={{ marginRight: 2 }}
            />
            <Text style={styles.badgeText}>{item.members.length}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      <Header
        title="Nhóm của bạn"
        rightIcon={
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => setShowJoinModal(true)}
            >
              <Ionicons
                name="scan-outline"
                size={22}
                color={APP_COLOR.ORANGE}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push("/create-group")}
            >
              <Ionicons name="add" size={24} color={APP_COLOR.ORANGE} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={groups || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="people-outline" size={40} color="#999" />
            </View>
            <Text style={styles.emptyText}>Bạn chưa tham gia nhóm nào.</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push("/create-group")}
            >
              <Text style={styles.createBtnText}>Tạo nhóm mới</Text>
            </TouchableOpacity>
          </View>
        }
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
      />

      {/* JOIN GROUP MODAL */}
      <JoinGroupModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={refetch}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F2F2F7",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    letterSpacing: 0.5,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // List Styles
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  groupItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFF5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
    justifyContent: "center",
  },
  groupName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  groupDesc: {
    fontSize: 13,
    color: "#888",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  createBtn: {
    backgroundColor: APP_COLOR.ORANGE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default GroupListScreen;
