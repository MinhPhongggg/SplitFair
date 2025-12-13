import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export type ToastType = "success" | "warning" | "error" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  onClose: (id: string) => void;
}

const TOAST_CONFIG = {
  success: {
    backgroundColor: "#E7F9E7",
    borderColor: "#A5D6A7",
    icon: "checkmark-circle",
    color: "#2E7D32",
  },
  warning: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFE082",
    icon: "warning",
    color: "#F57F17",
  },
  error: {
    backgroundColor: "#FFEBEE",
    borderColor: "#EF9A9A",
    icon: "close-circle",
    color: "#C62828",
  },
  info: {
    backgroundColor: "#E3F2FD",
    borderColor: "#90CAF9",
    icon: "information-circle",
    color: "#1565C0",
  },
};

const ToastMessage = ({ id, type, title, message, onClose }: ToastProps) => {
  const config = TOAST_CONFIG[type];

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon as any} size={28} color={config.color} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: config.color }]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={() => onClose(id)} style={styles.closeButton}>
        <Ionicons name="close" size={20} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    alignSelf: "center",
  },
  iconContainer: {
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: "#555",
  },
  closeButton: {
    padding: 5,
  },
});

export default ToastMessage;
