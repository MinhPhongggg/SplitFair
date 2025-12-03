import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { useCurrentApp } from "@/context/app.context";
import { getAccountAPI } from "@/utils/api";

// Giữ splash screen cho đến khi check token xong
SplashScreen.preventAutoHideAsync();

const RootPage = () => {
  const { setAppState } = useCurrentApp();

  useEffect(() => {
    async function prepare() {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/(auth)/welcome");
          return;
        }

        const res = await getAccountAPI(); // BE trả về thẳng { token, userName, role }
        
        // Nếu có token (từ login/register) hoặc có email (từ getAccount)
        if (res?.token || res?.email) {
          // Nếu res không có token (trường hợp getAccount), ta lấy token từ AsyncStorage
          const finalState = {
            ...res,
            token: res.token || token,
          };
          setAppState(finalState); // lưu state
          router.replace("/(tabs)"); // chuyển vào tab chính
        } else {
          router.replace("/(auth)/welcome");
        }
      } catch (error) {
        console.warn(error);
        router.replace("/(auth)/welcome");
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return null;
};

export default RootPage;
