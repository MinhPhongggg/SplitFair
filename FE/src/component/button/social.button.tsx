import { Image, StyleSheet, View } from "react-native";
import ShareButton from "./share.button";
import TextBetweenLine from "./text.between.line";
import ggLogo from "@/assets/auth/google.png";
import { loginWithGoogle } from "@/utils/googleAuth";
import { useToast } from "@/context/toast.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCurrentApp } from "@/context/app.context";

const styles = StyleSheet.create({
  container: {
    gap: 25,
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
});

interface IProps {
  title: string;
}

const SocialButton = ({ title }: IProps) => {
  const { showToast } = useToast();
  const { setAppState } = useCurrentApp();

  const handleGoogleLogin = async () => {
    try {
      const res = await loginWithGoogle(); // BE trả { token, user }

      await AsyncStorage.setItem("token", res.token);

      setAppState({
        token: res.token,
        ...res.user,
      });

      showToast("success", "Google", "Đăng nhập thành công");
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
      showToast("error", "Lỗi", "Google login thất bại");
    }
  };

  return (
    <View style={styles.container}>
      <TextBetweenLine textColor="black" title={title} />

      <View style={styles.buttonRow}>
        <ShareButton
          title="Google"
          onPress={handleGoogleLogin}
          textStyle={{ textTransform: "uppercase" }}
          buttonStyle={{
            backgroundColor: "#fff",
            paddingHorizontal: 20,
            justifyContent: "center",
            borderRadius: 30,
          }}
          icon={<Image source={ggLogo} />}
        />
      </View>
    </View>
  );
};

export default SocialButton;
