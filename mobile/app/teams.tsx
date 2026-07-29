import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";

type OrganizationItem = {
  id: string;
  name: string;
  role: string;
};

export default function TeamsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [teams, setTeams] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Hata", "Token bulunamadı. Önce giriş yapmalısın.");
        return;
      }

      const res = await fetch(`${API_URL}/organizations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Çalışma alanları alınamadı.");
      }

      const list = Array.isArray(data) ? data : data?.organizations || [];
      setTeams(
        list.map((item: any) => ({
          id: String(item.id),
          name: item.name || "İsimsiz Workspace",
          role: item.role || "MEMBER",
        }))
      );
    } catch (error: any) {
      Alert.alert("Hata", error?.message || "Çalışma alanları yüklenemedi.");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTeams();
    }, [loadTeams])
  );

  const handleOpenWorkspace = async (teamId: string, teamName: string) => {
    try {
      await AsyncStorage.setItem("activeOrgId", String(teamId));
      await AsyncStorage.setItem("activeOrgName", teamName);
      router.push("/workspace");
    } catch {
      Alert.alert("Hata", "Çalışma alanı açılırken hata oluştu.");
    }
  };

  const renderWorkspaceCard = ({ item }: { item: OrganizationItem }) => {
    const firstLetter = item.name?.charAt(0)?.toUpperCase() || "W";
    const displayName = item.name.replace(/\s+Workspace$/i, "");

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <View
          style={[
            styles.avatarBox,
            { backgroundColor: isDark ? colors.cardLight : "#DBEAFE" },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>{firstLetter}</Text>
        </View>

        <Text style={[styles.workspaceName, { color: colors.text }]} numberOfLines={2}>
          {displayName}
        </Text>

        <View
          style={[
            styles.roleBadge,
            { backgroundColor: isDark ? colors.cardLight : "#EFF6FF" },
          ]}
        >
          <Text style={[styles.roleBadgeText, { color: colors.primary }]}>{item.role}</Text>
        </View>

        <Pressable
          style={[styles.openButton, { backgroundColor: colors.trackBg }]}
          onPress={() => handleOpenWorkspace(item.id, item.name)}
        >
          <Text style={[styles.openButtonText, { color: colors.text }]}>Çalışma Alanına Git</Text>
          <MaterialIcons name="arrow-circle-right" size={18} color={colors.textSecondary} style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Organizasyonlarım</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Dahil olduğun gerçek çalışma alanları.
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>Yükleniyor...</Text>
        </View>
      ) : teams.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialIcons name="groups" size={40} color={colors.placeholder} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            Henüz bir organizasyon bulunamadı.
          </Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkspaceCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 30, paddingBottom: 16 },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  headerSubtitle: { marginTop: 8, fontSize: 13 },
  centerState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  centerText: { marginTop: 10, textAlign: "center" },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 14 },
  card: { borderRadius: 22, padding: 18, elevation: 2 },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: { fontSize: 24, fontWeight: "900" },
  workspaceName: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  roleBadgeText: { fontSize: 11, fontWeight: "800" },
  openButton: {
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  openButtonText: { fontSize: 14, fontWeight: "700" },
});
