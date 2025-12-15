import { Stack } from "expo-router";
import { RootSiblingParent } from "react-native-root-siblings";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import AppProvider from "@/context/app.context";
import { ToastProvider } from "@/context/toast.context";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "transparent",
    },
  };

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootSiblingParent>
          <AppProvider>
            <ToastProvider>
              <ThemeProvider value={navTheme}>
                <Stack screenOptions={{ headerShown: false }} />
              </ThemeProvider>
            </ToastProvider>
          </AppProvider>
        </RootSiblingParent>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
