import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { APP_COLOR } from "@/utils/constant";
import { resetPasswordAPI } from "@/utils/api";
import { useToast } from "@/context/toast.context";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const ResetPassword = () => {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { showToast } = useToast();

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      showToast("warning", "Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "Lỗi", "Mật khẩu xác nhận không trùng khớp");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordAPI(email as string, otp, newPassword);
      showToast(
        "success",
        "Thành công",
        "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại."
      );
      router.replace("/(auth)/login");
    } catch (error) {
      showToast("error", "Lỗi", "Mã xác thực không đúng hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Thay đổi mật khẩu</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mã code xác thực</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.passWrapper}>
            <TextInput
              style={styles.flexInput}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry={!showPass}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <FontAwesome5
                name={showPass ? "eye" : "eye-slash"}
                size={16}
                color="#999"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <View style={styles.passWrapper}>
            <TextInput
              style={styles.flexInput}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry={!showPass}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "ĐANG XỬ LÝ..." : "RESET PASSWORD"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 25, paddingTop: 60 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 40 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    fontSize: 16,
  },
  passWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  flexInput: { flex: 1, paddingVertical: 8, fontSize: 16 },
  submitButton: {
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ResetPassword;
