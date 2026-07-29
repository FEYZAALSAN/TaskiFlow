import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";

const AVATAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const PRIORITY_MAP: Record<string, { label: string; color: string; bg: string; bgDark: string }> = {
  HIGH: { label: "Yüksek", color: "#EF4444", bg: "#FEE2E2", bgDark: "#3F1D1D" },
  MEDIUM: { label: "Orta", color: "#F59E0B", bg: "#FEF3C7", bgDark: "#3F2E12" },
  LOW: { label: "Düşük", color: "#10B981", bg: "#D1FAE5", bgDark: "#14332A" },
};

export default function CalisanDetayScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { memberId, memberName, memberEmail, memberRole } = useLocalSearchParams<{
    memberId: string;
    memberName: string;
    memberEmail: string;
    memberRole: string;
  }>();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const avatarColor = AVATAR_COLORS[Math.abs((memberName || "").charCodeAt(0) % AVATAR_COLORS.length)];
  const isOwner = memberRole === "OWNER";

  useEffect(() => {
    fetchMemberTasks();
  }, []);

  const fetchMemberTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/tasks?assigneeId=${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (e) {
      console.log("Görev yükleme hatası:", e);
    } finally {
      setLoading(false);
    }
  };

  const doneTasks = tasks.filter((t) => t.isCompleted);
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const cardStyle = {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
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
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Çalışan Detayı</Text>

        <Pressable
          style={[styles.pulseBtn, { backgroundColor: isDark ? colors.cardLight : "#EEF2FF" }]}
          onPress={() => router.push("/pulse")}
        >
          <MaterialIcons name="show-chart" size={16} color={colors.primary} />
          <Text style={[styles.pulseBtnText, { color: colors.primary }]}>Pulse</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, cardStyle]}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{memberName?.charAt(0).toUpperCase() || "?"}</Text>
          </View>
          <Text style={[styles.memberName, { color: colors.text }]}>{memberName}</Text>
          <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>{memberEmail}</Text>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isOwner
                  ? isDark
                    ? colors.cardLight
                    : "#EEF2FF"
                  : colors.trackBg,
              },
            ]}
          >
            <MaterialIcons
              name={isOwner ? "star" : "person"}
              size={13}
              color={isOwner ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.roleText,
                { color: isOwner ? colors.primary : colors.textSecondary },
              ]}
            >
              {isOwner ? "Ekip Lideri" : "Çalışan"}
            </Text>
          </View>
        </View>

        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Görev İlerlemesi</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>{tasks.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Toplam</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: "#10B981" }]}>{doneTasks.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tamamlanan</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: "#F59E0B" }]}>{activeTasks.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Devam Eden</Text>
            </View>
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Genel İlerleme</Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>%{progress}</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.trackBg }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%` as `${number}%`,
                  backgroundColor: progress >= 75 ? "#10B981" : progress >= 40 ? "#F59E0B" : colors.primary,
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.card, cardStyle]}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons name="radio-button-unchecked" size={18} color="#F59E0B" />
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Aktif Görevler</Text>
            <Text style={[styles.cardCount, { color: colors.placeholder }]}>{activeTasks.length}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : activeTasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aktif görev yok 🎉</Text>
          ) : (
            activeTasks.map((task) => {
              const pri = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;
              return (
                <View key={task.id} style={styles.taskRow}>
                  <View style={[styles.taskDot, { backgroundColor: colors.primary }]} />
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                    {task.project?.title && (
                      <Text style={[styles.taskProject, { color: colors.textSecondary }]}>
                        {task.project.title}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.priBadge,
                      { backgroundColor: isDark ? pri.bgDark : pri.bg },
                    ]}
                  >
                    <Text style={[styles.priText, { color: pri.color }]}>{pri.label}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.card, cardStyle]}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons name="check-circle" size={18} color="#10B981" />
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>
              Tamamlanan Görevler
            </Text>
            <Text style={[styles.cardCount, { color: colors.placeholder }]}>{doneTasks.length}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : doneTasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Henüz tamamlanan görev yok
            </Text>
          ) : (
            doneTasks.map((task) => (
              <View key={task.id} style={[styles.taskRow, { opacity: 0.75 }]}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      { color: colors.text, textDecorationLine: "line-through" },
                    ]}
                  >
                    {task.title}
                  </Text>
                  {task.project?.title && (
                    <Text style={[styles.taskProject, { color: colors.textSecondary }]}>
                      {task.project.title}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 8 : 0,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700" },
  pulseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pulseBtnText: { fontSize: 13, fontWeight: "700" },
  scroll: { padding: 20, paddingBottom: 40 },
  profileCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: "900", color: "#fff" },
  memberName: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  memberEmail: { fontSize: 13, marginBottom: 14 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  roleText: { fontSize: 13, fontWeight: "700" },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardCount: { fontSize: 13, fontWeight: "600" },
  statsRow: { flexDirection: "row", marginBottom: 20 },
  statBox: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: "600" },
  progressPercent: { fontSize: 12, fontWeight: "700" },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  taskDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: "600" },
  taskProject: { fontSize: 11, marginTop: 2 },
  priBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  priText: { fontSize: 11, fontWeight: "700" },
  emptyText: { fontSize: 13, textAlign: "center", paddingVertical: 8 },
});
