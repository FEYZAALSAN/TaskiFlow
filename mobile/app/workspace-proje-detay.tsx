import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function WorkspaceProjeDetay() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { projectId, projectTitle } = useLocalSearchParams();

  const cards = [
    {
      key: "members",
      title: "Tüm Üyeler",
      desc: "Bu projedeki tüm üyeleri görüntüle",
      icon: "group" as const,
      iconColor: "#0284C7",
      iconBg: isDark ? colors.cardLight : "#E0F2FE",
      onPress: () => router.push({ pathname: "/members", params: { projectId } }),
    },
    {
      key: "board",
      title: "Proje Panosu",
      desc: "Görevleri ve kolonları görüntüle",
      icon: "dashboard" as const,
      iconColor: "#16A34A",
      iconBg: isDark ? colors.cardLight : "#DCFCE7",
      onPress: () => router.push({ pathname: "/proje-panosu", params: { projectId } }),
    },
    {
      key: "docs",
      title: "Belgeler",
      desc: "Projeye ait belgeleri görüntüle",
      icon: "description" as const,
      iconColor: "#D97706",
      iconBg: isDark ? colors.cardLight : "#FEF3C7",
      onPress: () => router.push({ pathname: "/documents", params: { projectId } }),
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Çalışma Alanına Dön</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>{projectTitle || "Proje"}</Text>

        <View style={styles.section}>
          {cards.map((item) => (
            <Pressable
              key={item.key}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                  <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.placeholder} />
            </Pressable>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16 },
  back: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  backText: { fontSize: 14 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  section: { marginTop: 4 },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconWrap: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardDesc: { fontSize: 12, marginTop: 3 },
});
