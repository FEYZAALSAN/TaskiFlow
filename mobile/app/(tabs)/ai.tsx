/**
 * AI sayfası geçici olarak kapatıldı.
 * Yedek: mobile/disabled/ai.tsx.bak
 * Açmak için:
 * 1) Yedeği bu dosyanın üzerine kopyala
 * 2) (tabs)/_layout.tsx içinde AI Tabs.Screen satırını geri aç (href:null olanı kaldır)
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export default function AIScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>AI geçici olarak kapalı</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Daha sonra tekrar açılacak.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  sub: { fontSize: 14, textAlign: "center" },
});
