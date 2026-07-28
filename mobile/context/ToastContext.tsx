import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const TOAST_DURATION_MS = 5000;

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_STYLES: Record<
  ToastType,
  { bg: string; border: string; icon: keyof typeof MaterialIcons.glyphMap; iconColor: string }
> = {
  success: { bg: "#ECFDF5", border: "#10B981", icon: "check-circle", iconColor: "#059669" },
  error: { bg: "#FEF2F2", border: "#EF4444", icon: "error-outline", iconColor: "#DC2626" },
  info: { bg: "#EFF6FF", border: "#2563EB", icon: "info-outline", iconColor: "#2563EB" },
};

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.host, { paddingTop: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      <View style={styles.column}>
        {toasts.map((item) => {
          const palette = TYPE_STYLES[item.type];
          return (
            <View
              key={item.id}
              style={[
                styles.toast,
                { backgroundColor: palette.bg, borderColor: palette.border },
              ]}
            >
              <MaterialIcons name={palette.icon} size={22} color={palette.iconColor} />
              <Text style={styles.toastText}>{item.message}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const trimmed = message.trim();
      if (!trimmed) return;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message: trimmed, type }]);

      const timer = setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 9999,
    elevation: 9999,
    alignItems: "stretch",
    paddingHorizontal: 16,
  },
  column: {
    width: "100%",
    flexDirection: "column",
    gap: 8,
  },
  toast: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 20,
  },
});
