import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCurrentApp } from "@/context/app.context";
import { getAccountAPI } from "@/utils/api";

export default function RootPage() {
  const { setAppState } = useCurrentApp();

  useEffect(() => {
    async function checkAuth() {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/(auth)/welcome");
        return;
      }

      try {
        const res = await getAccountAPI();
        setAppState({ ...res, token: res.token || token });
        router.replace("/(tabs)");
      } catch {
        router.replace("/(auth)/welcome");
      }
    }

    checkAuth();
  }, []);

  return null;
}
