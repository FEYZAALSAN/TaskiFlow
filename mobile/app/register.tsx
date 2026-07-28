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
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL, IS_API_CONFIGURED } from "@/constants/api";

export default function RegisterScreen() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!IS_API_CONFIGURED) {
            Alert.alert(
                "Yapılandırma Hatası",
                "Sunucu adresi tanımlı değil. EXPO_PUBLIC_API_URL ayarlanmalı."
            );
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
            return;
        }
        if (!emailRegex.test(email)) {
            Alert.alert("Hata", "Geçerli e-posta girin.");
            return;
        }
        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/\d/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            Alert.alert(
                "Hata",
                "Şifre en az 8 karakter olmalı; büyük harf, küçük harf, rakam ve özel karakter içermelidir."
            );
            return;
        }
        if (name.trim().split(" ").length < 2) {
            Alert.alert("Hata", "Ad Soyad gir.");
            return;
        }
        if (!agreeTerms) {
            Alert.alert("Hata", "Şartları kabul et.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Hata", data.error || "Kayıt başarısız.");
                return;
            }

            Alert.alert("Başarılı", "Hesap oluşturuldu!", [
                { text: "Tamam", onPress: () => router.push("/login") },
            ]);
        } catch (error) {
            Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>T</Text>
                        </View>
                        <Text style={styles.title}>TaskiFlow</Text>
                        <Text style={styles.subtitle}>Hemen başla</Text>
                    </View>

                    <View style={styles.card}>
                        <TextInput style={styles.input} placeholder="Ad Soyad" value={name} onChangeText={setName} />
                        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
                        
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Şifre"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <MaterialIcons
                                    name={showPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#6B7280"
                                />
                            </Pressable>
                        </View>

                        <Pressable onPress={() => setAgreeTerms(!agreeTerms)} style={styles.termsRow}>
                            <Text style={styles.termsCheck}>{agreeTerms ? "☑" : "☐"}</Text>
                            <Text style={styles.termsText}>
                                <Text onPress={() => router.push("/terms")} style={styles.termsLink}>
                                    Kullanım Şartları
                                </Text>
                                {" ve "}
                                <Text onPress={() => router.push("/privacy")} style={styles.termsLink}>
                                    Gizlilik Politikası
                                </Text>
                                {"'nı kabul ediyorum"}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Kayıt Ol</Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContent: { padding: 24, paddingTop: 60 },

    header: { alignItems: "center", marginBottom: 30 },
    logoBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: { color: "#fff", fontSize: 24, fontWeight: "800" },

    title: { fontSize: 26, fontWeight: "800", marginTop: 10 },
    subtitle: { fontSize: 14, color: "#6B7280" },

    card: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        padding: 16,
    },

    input: {
        height: 48,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
    },

    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
    },

    passwordInput: { flex: 1, height: 48 },

    termsRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginTop: 10,
    },
    termsCheck: { fontSize: 16, lineHeight: 22 },
    termsText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },
    termsLink: { color: "#2563EB", fontWeight: "700" },

    button: {
        marginTop: 12,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },
});
