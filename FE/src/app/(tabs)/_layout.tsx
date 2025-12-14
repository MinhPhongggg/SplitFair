// src/app/(tabs)/_layout.tsx
import { APP_COLOR } from "@/utils/constant";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";

const TabLayout = () => {
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
      return focused ? (
        <Octicons name="bell-fill" size={size} color={APP_COLOR.ORANGE} />
      ) : (
        <Octicons name="bell" size={size} color={APP_COLOR.GREY} />
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
        options={{
          tabBarLabel: "Nhóm",
        }}
      />

      <Tabs.Screen
        name="debts"
        options={{
          tabBarLabel: "Công nợ",
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
