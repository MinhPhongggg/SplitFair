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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

import { APP_COLOR } from "@/utils/constant";
import { loginAPI } from "@/utils/api";
import { useCurrentApp } from "@/context/app.context";
import { useToast } from "@/context/toast.context";
import SocialButton from "@/component/button/social.button";

const { width } = Dimensions.get("window");

// Custom Input Component for Login Screen to match the design
const LoginInput = ({
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

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAppState } = useCurrentApp();
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("warning", "Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setLoading(true);
      const res = await loginAPI(email, password);
      setLoading(false);

      if (res?.token) {
        await AsyncStorage.setItem("token", res.token);
        setAppState({ ...res, email });
        showToast(
          "success",
          "Chào mừng trở lại",
          `Chào mừng ${res.userName || email} đã trở lại!`
        );
        router.replace("/(tabs)");
      } else {
        showToast("error", "Đăng nhập thất bại", "Sai email hoặc mật khẩu");
      }
    } catch (error) {
      console.log("Login error:", error);
      setLoading(false);
      showToast("error", "Lỗi", "Không thể đăng nhập, vui lòng thử lại");
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
            Đăng nhập để tiếp tục với SplitFair
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
            <LoginInput
              icon="envelope"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <LoginInput
              icon="lock"
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <Link href="/(auth)/signup">
                <Text style={styles.signupText}>Đăng ký ngay</Text>
              </Link>
            </View>
            <SocialButton title=" đăng nhập với " />
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
    height: 300,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
    marginRight: 10,
  },
  forgotPasswordText: {
    color: APP_COLOR.ORANGE,
    fontWeight: "600",
    fontSize: 14,
  },
  loginButton: {
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
  loginButtonText: {
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
  signupText: {
    color: APP_COLOR.ORANGE,
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default LoginPage;
