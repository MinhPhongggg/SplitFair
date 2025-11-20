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
        if (res?.token) {
          setAppState(res); // lưu state
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
