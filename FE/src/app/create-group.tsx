import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { APP_COLOR } from "@/utils/constant";
import { useCreateGroup } from "@/api/hooks";
import { useCurrentApp } from "@/context/app.context";
import { useToast } from "@/context/toast.context";
import Ionicons from "@expo/vector-icons/Ionicons";

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const { appState } = useCurrentApp();
  const { showToast } = useToast();
  const { mutate: createGroup, isPending } = useCreateGroup();

  const handleCreate = () => {
    console.log("User ID hiện tại:", appState?.userId);
    if (!groupName) {
      showToast("warning", "Thiếu thông tin", "Vui lòng nhập tên nhóm");
      return;
    }
    if (!appState?.userId) {
      showToast("error", "Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }

    createGroup(
      {
        creatorId: String(appState.userId),
        dto: {
          groupName: groupName,
          description: description,
        },
      },
      {
        onSuccess: (newGroup) => {
          showToast("success", "Thành công", "Tạo nhóm mới thành công");
          // Navigate to the new group details
          if (newGroup?.id) {
            router.replace({
              pathname: "/(tabs)/groups/[groupId]",
              params: { groupId: newGroup.id },
            });
          } else {
            router.replace("/(tabs)/groups");
          }
        },
        onError: (error) => {
          console.error("Create Group Error:", error);
          showToast(
            "error",
            "Thất bại",
            "Không thể tạo nhóm. Vui lòng thử lại."
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhóm mới</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={40} color={APP_COLOR.ORANGE} />
            </View>

            <Text style={styles.label}>Tên nhóm</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Chuyến đi Đà Lạt, Tiền nhà trọ..."
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
            />

            <Text style={styles.label}>Mô tả (tùy chọn)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả ngắn về nhóm..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.noteContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#666"
            />
            <Text style={styles.noteText}>
              Sau khi tạo nhóm, bạn có thể mời thêm thành viên bằng mã nhóm hoặc
              link chia sẻ.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createBtn, isPending && styles.disabledBtn]}
            onPress={handleCreate}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.createBtnText}>Tạo Nhóm</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 20,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0E0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
  },
  noteContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#1976D2",
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  createBtn: {
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledBtn: {
    backgroundColor: "#FFD8A8",
  },
  createBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateGroupScreen;
