import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>

      <Tabs.Screen name="genel-bakis" options={{ title: t('tabs.overview'), tabBarIcon: ({ color }) => <IconSymbol size={24} name="folder.fill" color={color} /> }} />
      {/* AI sekmesi geçici kapalı — açmak için aşağıdaki satırı geri getir, href:null olanı sil */}
      {/* <Tabs.Screen name="ai" options={{ title: t('tabs.ai'), tabBarIcon: ({ color }) => <IconSymbol size={24} name="sparkles" color={color} /> }} /> */}
      <Tabs.Screen name="ai" options={{ href: null }} />
      <Tabs.Screen name="add" options={{ title: '', tabBarIcon: () => (
        <View style={styles.centerBtn}>
          <View style={styles.centerBtnInner}>
            <IconSymbol size={28} name="plus" color="#fff" />
          </View>
        </View>
      ), tabBarLabel: () => null }} />
      <Tabs.Screen name="reports" options={{ title: t('tabs.reports'), tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} /> }} />

      {/* Gizli sayfalar */}
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen name="pulse" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerBtn: { alignItems: 'center', justifyContent: 'center', top: -12 },
  centerBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', elevation: 8 },
});
