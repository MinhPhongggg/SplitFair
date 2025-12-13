import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { APP_COLOR } from "@/utils/constant";
import { Group } from "@/types/group.types";
import { useGetGroups, useJoinGroup } from "@/api/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useCurrentApp } from "@/context/app.context";
import { useToast } from "@/context/toast.context";
import * as Clipboard from "expo-clipboard";

const GroupListScreen = () => {
  const { data: groups, isLoading, refetch } = useGetGroups();
  const { appState } = useCurrentApp();
  const { showToast } = useToast();

  // Join Group State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const { mutate: joinGroup, isPending: isJoining } = useJoinGroup();

  const handleJoinGroup = () => {
    if (!inviteCode.trim()) {
      showToast("error", "Lỗi", "Vui lòng nhập mã nhóm hoặc link mời.");
      return;
    }

    // Extract Group ID from Link or Code
    let groupId = inviteCode.trim();
    // Check if it's a link: splitfair://join-group?groupId=...
    if (groupId.includes("groupId=")) {
      groupId = groupId.split("groupId=")[1];
    }

    if (!appState?.userId) {
      showToast("error", "Lỗi", "Bạn chưa đăng nhập.");
      return;
    }

    joinGroup(
      { groupId, userId: appState.userId as string },
      {
        onSuccess: () => {
          showToast("success", "Thành công", "Đã tham gia nhóm thành công!");
          setShowJoinModal(false);
          setInviteCode("");
          refetch();
        },
        onError: (err: any) => {
          showToast(
            "error",
            "Thất bại",
            err.response?.data?.message ||
              "Không thể tham gia nhóm. Vui lòng kiểm tra lại mã."
          );
        },
      }
    );
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setInviteCode(text);
  };

  const handleScanQR = () => {
    setShowJoinModal(false); // Close modal first
    router.push("/(tabs)/groups/scan-qr");
  };

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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhóm của bạn</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowJoinModal(true)}
          >
            <Ionicons name="scan-outline" size={22} color={APP_COLOR.ORANGE} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push("/(tabs)/groups/create-group")}
          >
            <Ionicons name="add" size={24} color={APP_COLOR.ORANGE} />
          </TouchableOpacity>
        </View>
      </View>

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
              onPress={() => router.push("/(tabs)/groups/create-group")}
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={showJoinModal}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tham gia nhóm</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Nhập mã nhóm hoặc dán link mời để tham gia.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mã nhóm hoặc Link..."
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.pasteBtn} onPress={handlePaste}>
                <Text style={styles.pasteText}>Dán</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.joinBtn, !inviteCode && styles.disabledBtn]}
              onPress={handleJoinGroup}
              disabled={!inviteCode || isJoining}
            >
              {isJoining ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.joinBtnText}>Tham gia ngay</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>HOẶC</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.scanBtn} onPress={handleScanQR}>
              <Ionicons
                name="qr-code-outline"
                size={20}
                color={APP_COLOR.ORANGE}
              />
              <Text style={styles.scanBtnText}>Quét mã QR</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 20 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: { flex: 1, fontSize: 16, color: "#333" },
  pasteBtn: { padding: 5 },
  pasteText: { color: APP_COLOR.ORANGE, fontWeight: "600" },

  joinBtn: {
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  disabledBtn: { backgroundColor: "#FFD8A8" },
  joinBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  orText: {
    marginHorizontal: 10,
    color: "#999",
    fontSize: 12,
    fontWeight: "600",
  },

  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: APP_COLOR.ORANGE,
    borderRadius: 12,
    height: 50,
    backgroundColor: "#FFF5E5",
  },
  scanBtnText: {
    color: APP_COLOR.ORANGE,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default GroupListScreen;
