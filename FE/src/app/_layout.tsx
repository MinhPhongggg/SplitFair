import { Stack } from "expo-router";
import { RootSiblingParent } from "react-native-root-siblings";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import AppProvider from "@/context/app.context";
import { ToastProvider } from "@/context/toast.context";

// 1. Import thêm QueryClient và Provider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 2. Tạo một instance của client
const queryClient = new QueryClient();

const RootLayout = () => {
  const navTheme = {
    ...DefaultTheme,
    color: {
      ...DefaultTheme.colors,
      background: "transparent",
    },
  };

  return (
    // 3. Bọc <AppProvider> bằng <QueryClientProvider>
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <RootSiblingParent>
          <AppProvider>
            <ToastProvider>
              <ThemeProvider value={navTheme}>
                <Stack
                  screenOptions={{
                    headerStyle: { backgroundColor: "#f4511e" },
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(auth)/login"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)/welcome"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)/signup"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </ThemeProvider>
            </ToastProvider>
          </AppProvider>
        </RootSiblingParent>
      </GestureHandlerRootView>
    </QueryClientProvider> // 3. Đóng Provider
  );
};
export default RootLayout;