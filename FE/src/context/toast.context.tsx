import React, { createContext, useContext, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import ToastMessage, { ToastType } from "@/component/ToastMessage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    type: ToastType,
    title: string,
    message: string,
    duration?: number
  ) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const insets = useSafeAreaInsets();

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message: string, duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View
        style={[styles.toastContainer, { top: insets.top + 10 }]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} {...toast} onClose={hideToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
