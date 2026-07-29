import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

const STORAGE_KEY = "connected_accounts_v2";

type ProviderId = "google" | "apple" | "microsoft" | "github";

type Provider = {
  id: ProviderId;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  usesEmail: boolean;
};

type LinkedState = {
  linked: boolean;
  identifier?: string;
  linkedAt?: string;
};

const PROVIDERS: Provider[] = [
  { id: "google", name: "Google", icon: "mail", color: "#EA4335", usesEmail: true },
  { id: "apple", name: "Apple", icon: "phone-iphone", color: "#111827", usesEmail: true },
  { id: "microsoft", name: "Microsoft", icon: "desktop-windows", color: "#2563EB", usesEmail: true },
  { id: "github", name: "GitHub", icon: "code", color: "#24292F", usesEmail: false },
];

const emptyState = (): Record<ProviderId, LinkedState> => ({
  google: { linked: false },
  apple: { linked: false },
  microsoft: { linked: false },
  github: { linked: false },
});

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidGithubUsername(value: string) {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(value);
}

export default function ConnectedAccountsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<Record<ProviderId, LinkedState>>(emptyState());
  const [linkModalProvider, setLinkModalProvider] = useState<Provider | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as Partial<Record<ProviderId, LinkedState>>;
        setAccounts((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    });
  }, []);

  const persist = async (next: Record<ProviderId, LinkedState>) => {
    setAccounts(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openLinkModal = (provider: Provider) => {
    setLinkModalProvider(provider);
    setLinkInput("");
  };

  const confirmLink = async () => {
    if (!linkModalProvider) return;
    const trimmed = linkInput.trim();
    const valid = linkModalProvider.usesEmail
      ? isValidEmail(trimmed)
      : isValidGithubUsername(trimmed);

    if (!valid) {
      Alert.alert(t("common.error"), t("connected.invalidInput"));
      return;
    }

    setSaving(true);
    try {
      const next = {
        ...accounts,
        [linkModalProvider.id]: {
          linked: true,
          identifier: trimmed,
          linkedAt: new Date().toISOString(),
        },
      };
      await persist(next);
      setLinkModalProvider(null);
      Alert.alert(
        t("common.success"),
        t("connected.linkedOk").replace("{provider}", linkModalProvider.name)
      );
    } finally {
      setSaving(false);
    }
  };

  const unlinkProvider = (provider: Provider) => {
    Alert.alert(provider.name, t("connected.unlink"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("connected.unlink"),
        style: "destructive",
        onPress: async () => {
          const next = {
            ...accounts,
            [provider.id]: { linked: false },
          };
          await persist(next);
          Alert.alert(
            t("common.success"),
            t("connected.unlinkedOk").replace("{provider}", provider.name)
          );
        },
      },
    ]);
  };

  const onPressProvider = (provider: Provider) => {
    const state = accounts[provider.id];
    if (state?.linked) {
      unlinkProvider(provider);
    } else {
      openLinkModal(provider);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.headerBg }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.cardLight }]}>
          <MaterialIcons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{t("connected.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("connected.subtitle")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {PROVIDERS.map((provider) => {
          const state = accounts[provider.id];
          const isLinked = Boolean(state?.linked);
          const iconColor = provider.id === "github" && isDark ? "#E2E8F0" : provider.color;

          return (
            <View
              key={provider.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: isDark ? colors.cardLight : "#F3F4F6" }]}>
                <MaterialIcons name={provider.icon} size={22} color={iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
                <Text style={{ color: isLinked ? "#10B981" : colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                  {isLinked ? t("connected.linked") : t("connected.notLinked")}
                </Text>
                {isLinked && state.identifier ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                    {state.identifier}
                  </Text>
                ) : null}
              </View>
              <Pressable
                style={[
                  styles.actionBtn,
                  { backgroundColor: isLinked ? colors.dangerBg : colors.primary },
                ]}
                onPress={() => onPressProvider(provider)}
              >
                <Text style={[styles.actionText, { color: isLinked ? "#DC2626" : "#fff" }]}>
                  {isLinked ? t("connected.unlink") : t("connected.link")}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <Text style={[styles.note, { color: colors.textSecondary }]}>{t("connected.note")}</Text>
      </ScrollView>

      <Modal visible={Boolean(linkModalProvider)} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {linkModalProvider?.name} — {t("connected.link")}
            </Text>
            <Text style={[styles.modalHint, { color: colors.textSecondary }]}>
              {t("connected.linkPrompt")}
            </Text>
            <TextInput
              value={linkInput}
              onChangeText={setLinkInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={linkModalProvider?.usesEmail ? "email-address" : "default"}
              placeholder={
                linkModalProvider?.usesEmail
                  ? t("connected.linkPlaceholderGoogle")
                  : t("connected.linkPlaceholderGithub")
              }
              placeholderTextColor={colors.placeholder}
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                },
              ]}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.trackBg }]}
                onPress={() => setLinkModalProvider(null)}
                disabled={saving}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>{t("common.cancel")}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={confirmLink}
                disabled={saving}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>{t("connected.link")}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  providerName: { fontSize: 15, fontWeight: "800" },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: { fontSize: 12, fontWeight: "700" },
  note: { marginTop: 8, fontSize: 12, lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", marginBottom: 8 },
  modalHint: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalBtnText: { fontWeight: "800", fontSize: 14 },
});
