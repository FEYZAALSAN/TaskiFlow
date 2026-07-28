import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL, IS_API_CONFIGURED } from "@/constants/api";
import { useToast } from "@/context/ToastContext";
import { Eye, EyeOff } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function LoginScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!IS_API_CONFIGURED) {
      Alert.alert(
        "Yapılandırma Hatası",
        "Sunucu adresi tanımlı değil. EXPO_PUBLIC_API_URL ayarlanmalı."
      );
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setLoading(true);

    try {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim(),
      password: password.trim(),
    }),
  });

  const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Hata",
          data?.error || data?.message || "Giriş başarısız."
        );
        return;
      }

      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken;

      const user = data?.user || data?.data?.user || null;

      if (!token) {
        Alert.alert("Hata", "Giriş başarılı ama backend token döndürmedi.");
        return;
      }

      await AsyncStorage.setItem("token", String(token));

      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));

        const orgId =
          user?.organizationId ||
          user?.organization?.id ||
          user?.orgId ||
          user?.organizations?.[0]?.organizationId ||
          user?.organizations?.[0]?.organization?.id ||
          null;

        if (orgId) {
          await AsyncStorage.setItem("activeOrgId", String(orgId));
        }
}

      Alert.alert("Başarılı", "Giriş yapıldı.");
      router.replace("/genel-bakis");
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert("Hata", "Lütfen e-posta adresinizi girin.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Hata",
          data?.error || data?.message || "Şifre sıfırlama isteği gönderilemedi."
        );
        return;
      }

      showToast(
        data?.message || "Şifre sıfırlama bağlantısı gönderildi.",
        "success"
      );
      setForgotModalVisible(false);
      setForgotEmail("");
    } catch (error) {
      Alert.alert(
        "Bağlantı Hatası",
        "Sunucuya bağlanılamadı. Daha sonra tekrar deneyin."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>T</Text>
              </View>

              <Text style={styles.title}>Giriş Yap</Text>
              <Text style={styles.subtitle}>
                TaskiFlow hesabına giriş yaparak projelerini ve görevlerini
                yönetmeye devam et.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresinizi girin"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre</Text>

                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Şifrenizi girin"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />

                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </Pressable>
                </View>

                <Pressable
                  style={styles.forgotPasswordButton}
                  onPress={() => {
                    setForgotEmail(email);
                    setForgotModalVisible(true);
                  }}
                >
                  <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Giriş Yap</Text>
                )}
              </Pressable>

              <Pressable
                style={styles.registerLink}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.registerText}>
                  Hesabın yok mu?{" "}
                  <Text style={styles.registerHighlight}>Kayıt Ol</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Şifre Sıfırlama</Text>
            <Text style={styles.modalSubtitle}>
              Hesabına bağlı e-posta adresini gir. Şifre yenileme bağlantısı
              gönderelim.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="E-posta adresinizi girin"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={forgotEmail}
              onChangeText={setForgotEmail}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setForgotModalVisible(false)}
                disabled={forgotLoading}
              >
                <Text style={styles.modalCancelText}>Vazgeç</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalSubmitButton,
                  forgotLoading && styles.disabledButton,
                ]}
                onPress={handleForgotPassword}
                disabled={forgotLoading}
              >
                {forgotLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Gönder</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  container: { width: "100%" },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    fontSize: 15,
    color: "#111827",
  },

  passwordWrapper: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 12,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },

  eyeButton: {
    padding: 4,
  },

  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 10,
  },

  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  loginButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  registerLink: {
    marginTop: 18,
    alignItems: "center",
  },

  registerText: {
    fontSize: 14,
    color: "#6B7280",
  },

  registerHighlight: {
    color: "#2563EB",
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 16,
  },

  modalInput: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },

  modalCancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  modalCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },

  modalSubmitButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  modalSubmitText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
