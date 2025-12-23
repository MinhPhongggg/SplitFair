import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";

import { registerAPI } from "@/utils/api";
import { APP_COLOR } from "@/utils/constant";
import { useToast } from "@/context/toast.context";
import SocialButton from "@/component/button/social.button";

const { width } = Dimensions.get("window");

// Custom Input Component matching Login design
const SignupInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}: any) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputIcon}>
        <FontAwesome5 name={icon} size={18} color={APP_COLOR.ORANGE} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
      />
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <FontAwesome5
            name={isPasswordVisible ? "eye" : "eye-slash"}
            size={15}
            color="#999"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const handleSignup = async () => {
    if (!email || !userName || !password) {
      showToast("warning", "Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const res = await registerAPI(userName, email, password);
      setLoading(false);

      if (res?.token) {
        showToast(
          "success",
          "Thành công",
          "Đăng ký thành công, vui lòng đăng nhập!"
        );
        router.replace("/(auth)/login");
      } else {
        showToast("error", "Đăng ký thất bại", "Email có thể đã được sử dụng");
      }
    } catch (error) {
      console.log("Signup error:", error);
      setLoading(false);
      showToast("error", "Lỗi", "Không thể kết nối tới server");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={APP_COLOR.ORANGE} />

      {/* Header Section with Curve */}
      <LinearGradient
        colors={[APP_COLOR.ORANGE, "#FF8C42"]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="money-bill-wave" size={50} color="#fff" />
            <Text style={styles.appName}>SplitFair</Text>
          </View>
          <Text style={styles.welcomeLabel}>
            Đăng ký để bắt đầu với Splitfair
          </Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <SignupInput
              icon="envelope"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <SignupInput
              icon="user"
              placeholder="Tên người dùng"
              value={userName}
              onChangeText={setUserName}
            />

            <SignupInput
              icon="lock"
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={{ height: 20 }} />

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <Link href="/(auth)/login">
                <Text style={styles.loginText}>Đăng nhập ngay</Text>
              </Link>
            </View>
            <SocialButton title="Đăng ký với" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerGradient: {
    height: 280, // Slightly shorter than login to fit more fields if needed
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
    letterSpacing: 1,
  },
  welcomeLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  inputIcon: {
    marginRight: 15,
    width: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 5,
  },
  signupButton: {
    backgroundColor: APP_COLOR.ORANGE,
    borderRadius: 30,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: APP_COLOR.ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 15,
  },
  loginText: {
    color: APP_COLOR.ORANGE,
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default SignupPage;
