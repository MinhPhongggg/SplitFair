// src/app/(tabs)/_layout.tsx
import { APP_COLOR } from "@/utils/constant";
import { Tabs } from "expo-router";
import { View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Octicons } from "@expo/vector-icons";
import { useGetNotifications } from "@/api/hooks";
import { Notification } from "@/types/notification.types";

const TabLayout = () => {
  const { data: notifications } = useGetNotifications();
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: Notification) => !n.isRead).length
    : 0;

  const getIcons = (routeName: string, focused: boolean, size: number) => {
    if (routeName === "index") {
      return (
        <Ionicons
          name={focused ? "home" : "home-outline"}
          size={size}
          color={focused ? APP_COLOR.ORANGE : APP_COLOR.GREY}
        />
      );
    }
    if (routeName === "groups") {
      return (
        <Ionicons
          name={focused ? "people" : "people-outline"}
          size={size}
          color={focused ? APP_COLOR.ORANGE : APP_COLOR.GREY}
        />
      );
    }

    // 👇 THÊM ICON CHO TAB CÔNG NỢ
    if (routeName === "debts") {
      return (
        <Ionicons
          name={focused ? "wallet" : "wallet-outline"}
          size={size}
          color={focused ? APP_COLOR.ORANGE : APP_COLOR.GREY}
        />
      );
    }

    if (routeName === "notification") {
      return (
        <View>
          {focused ? (
            <Octicons name="bell-fill" size={size} color={APP_COLOR.ORANGE} />
          ) : (
            <Octicons name="bell" size={size} color={APP_COLOR.GREY} />
          )}
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                backgroundColor: "red",
                borderRadius: 5,
                width: 10,
                height: 10,
                borderWidth: 1,
                borderColor: "white",
              }}
            />
          )}
        </View>
      );
    }
    if (routeName === "account") {
      return focused ? (
        <MaterialCommunityIcons
          name="account"
          size={size}
          color={APP_COLOR.ORANGE}
        />
      ) : (
        <MaterialCommunityIcons
          name="account-outline"
          size={size}
          color={APP_COLOR.GREY}
        />
      );
    }
    return <></>;
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          return getIcons(route.name, focused, size);
        },
        headerShown: false,
        tabBarLabelStyle: { paddingBottom: 3 },
        tabBarActiveTintColor: APP_COLOR.ORANGE,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Trang chủ",
        }}
      />
      <Tabs.Screen
        name="groups"
        options={
          {
            tabBarLabel: "Nhóm",
            unmountOnBlur: true,
          } as any
        }
      />

      <Tabs.Screen
        name="debts"
        options={{
          tabBarLabel: "Dư nợ",
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          tabBarLabel: "Thông báo",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarLabel: "Tài khoản",
        }}
      />
    </Tabs>
  );
};
export default TabLayout;
