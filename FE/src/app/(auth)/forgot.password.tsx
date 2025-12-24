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
import { router } from "expo-router";
import { APP_COLOR } from "@/utils/constant";
import { forgotPasswordAPI } from "@/utils/api";
import { useToast } from "@/context/toast.context";
import { Ionicons } from "@expo/vector-icons";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleConfirmEmail = async () => {
    if (!email) {
      showToast("warning", "Thông báo", "Vui lòng nhập email");
      return;
    }
    try {
      setLoading(true);
      await forgotPasswordAPI(email);
      showToast(
        "success",
        "Thành công",
        "Mã xác thực đã được gửi tới email của bạn"
      );
      // Chuyển sang trang nhập OTP và mật khẩu mới, truyền theo email
      router.replace({
        pathname: "(auth)/request.password",
        params: { email },
      });
    } catch (error) {
      showToast("error", "Lỗi", "Email không tồn tại hoặc có lỗi xảy ra");
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

        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subTitle}>
          Vui lòng điền vào email tài khoản đăng nhập của bạn để thực hiện yêu
          cầu thay đổi mật khẩu.
        </Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email của bạn"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleConfirmEmail}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 25, paddingTop: 60 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#000" },
  subTitle: { fontSize: 15, color: "#666", marginBottom: 30, lineHeight: 22 },
  inputWrapper: { marginBottom: 30 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ForgotPassword;
