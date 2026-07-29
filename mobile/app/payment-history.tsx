import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  provider?: string | null;
  description?: string | null;
  iyzicoPaymentId?: string | null;
  conversationId?: string | null;
  createdAt: string;
};

const statusLabel: Record<string, string> = {
  PAID: "Ödendi",
  PENDING: "Beklemede",
  FAILED: "Başarısız",
  REFUNDED: "İade",
};

const providerLabel: Record<string, string> = {
  iyzico: "iyzico",
  manual: "Manuel",
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatAmount = (amount: number, currency?: string) => {
  if (amount === 0) return "Ücretsiz";
  return `₺${amount} ${currency || "TRY"}`;
};

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const totalPaid = useMemo(() => {
    return payments
      .filter((item) => item.status === "PAID")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [payments]);

  const paidCount = payments.filter((item) => item.status === "PAID").length;
  const pendingCount = payments.filter((item) => item.status === "PENDING").length;
  const failedCount = payments.filter((item) => item.status === "FAILED").length;

  const fetchPayments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Oturum Hatası", "Lütfen tekrar giriş yapın.");
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/payments/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        Alert.alert("Hata", data?.message || "Ödeme geçmişi alınamadı.");
        return;
      }

      if (Array.isArray(data)) {
        setPayments(data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.log("Ödeme geçmişi alınamadı:", err);
      Alert.alert("Bağlantı Hatası", "Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPayments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          style={[styles.backBtn, { backgroundColor: colors.cardLight }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios-new" size={18} color={colors.text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Ödeme Geçmişi</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Gerçek ödeme kayıtların
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>Toplam Ödenen</Text>
              <Text style={styles.summaryAmount}>₺{totalPaid}</Text>
            </View>

            <View style={styles.summaryStats}>
              <Text style={styles.summaryStat}>Ödendi: {paidCount}</Text>
              <Text style={styles.summaryStat}>Bekleyen: {pendingCount}</Text>
              <Text style={styles.summaryStat}>Başarısız: {failedCount}</Text>
            </View>
          </View>

          {payments.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <MaterialIcons name="receipt-long" size={34} color={colors.placeholder} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz ödeme yok</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ödeme yaptığında gerçek kayıtların burada görünecek.
              </Text>
            </View>
          ) : (
            payments.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.paymentCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.paymentTop}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: isDark ? colors.cardLight : "#EFF6FF" },
                    ]}
                  >
                    <MaterialIcons name="receipt-long" size={20} color={colors.primary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.paymentTitle, { color: colors.text }]}>
                      {item.description || "Plan Ödemesi"}
                    </Text>
                    <Text style={[styles.paymentDate, { color: colors.placeholder }]}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "PAID" && styles.statusPaid,
                      item.status === "PENDING" && styles.statusPending,
                      item.status === "FAILED" && styles.statusFailed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === "PAID" && styles.statusPaidText,
                        item.status === "PENDING" && styles.statusPendingText,
                        item.status === "FAILED" && styles.statusFailedText,
                      ]}
                    >
                      {statusLabel[item.status] || item.status}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.paymentBottom}>
                  <View>
                    <Text style={[styles.provider, { color: colors.textSecondary }]}>
                      Sağlayıcı:{" "}
                      {providerLabel[item.provider || ""] ||
                        item.provider ||
                        "Bilinmiyor"}
                    </Text>

                    {item.iyzicoPaymentId ? (
                      <Text style={[styles.paymentId, { color: colors.placeholder }]}>
                        iyzico ID: {item.iyzicoPaymentId}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={[styles.amount, { color: colors.primary }]}>
                    {formatAmount(item.amount, item.currency)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 21, fontWeight: "900" },
  subtitle: { marginTop: 3, fontSize: 13 },
  content: { padding: 16, paddingBottom: 30 },

  summaryCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#2563EB",
    marginBottom: 14,
  },
  summaryLabel: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  summaryAmount: {
    marginTop: 4,
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },
  summaryStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  summaryStat: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  emptyCard: {
    marginTop: 24,
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  paymentCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  paymentTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentTitle: { fontSize: 14, fontWeight: "900" },
  paymentDate: { marginTop: 4, fontSize: 12 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  statusText: { fontSize: 11, fontWeight: "900", color: "#6B7280" },
  statusPaid: { backgroundColor: "#DCFCE7" },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusFailed: { backgroundColor: "#FEE2E2" },
  statusPaidText: { color: "#16A34A" },
  statusPendingText: { color: "#D97706" },
  statusFailedText: { color: "#DC2626" },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  paymentBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  provider: { fontSize: 12, fontWeight: "700" },
  paymentId: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
  },
  amount: { fontSize: 15, fontWeight: "900" },
});
