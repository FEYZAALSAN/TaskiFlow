import React, { useEffect, useState,useCallback} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Switch,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter,useFocusEffect } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";
import { useTheme, ThemeMode, ThemeColors } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { validatePasswordPolicy } from "@/utils/passwordPolicy";

const STORAGE_KEYS = {
  theme: "profile_theme",
  language: "profile_language",
  notifications: "profile_notifications",
};

const SUPPORT_EMAIL = "support@ndmsoftware.com";

const PLAN_LABELS: Record<string, string> = {
  FREE: "Ücretsiz Başlangıç",
  PRO: "Profesyonel",
  BUSINESS: "Şirketler",
};

const Sheet = ({
  visible,
  onClose,
  title,
  children,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  colors: typeof ThemeColors.light;
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <View style={styles.sheetOverlay}>
      <View style={[styles.sheetContent, { backgroundColor: colors.modalBg }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
        {children}
      </View>
    </View>
  </Modal>
);

const SecurityAccordionItem = ({
  sectionKey,
  icon,
  title,
  subtitle,
  children,
  danger = false,
  isOpen,
  onToggle,
  colors,
}: {
  sectionKey: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  danger?: boolean;
  isOpen: boolean;
  onToggle: (key: string) => void;
  colors: typeof ThemeColors.light;
}) => {
  return (
    <View
      style={[
        styles.securityAccordionCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        danger && {
          borderColor: colors.dangerBorder,
          backgroundColor: colors.dangerCardBg,
        },
      ]}
    >
      <Pressable
        style={styles.securityAccordionHeader}
        onPress={() => onToggle(sectionKey)}
      >
        <View
          style={[
            styles.securityAccordionIconWrap,
            danger && styles.securityAccordionIconWrapDanger,
          ]}
        >
          <MaterialIcons
            name={icon}
            size={20}
            color={danger ? "#DC2626" : "#2563EB"}
          />
        </View>

        <View style={styles.securityAccordionTextWrap}>
          <Text
            style={[
              styles.securityAccordionTitle,
              { color: colors.text },
              danger && styles.securityAccordionTitleDanger,
            ]}
          >
            {title}
          </Text>
          <Text style={[styles.securityAccordionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>

        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={colors.textSecondary}
        />
      </Pressable>

      {isOpen ? (
        <View style={[styles.securityAccordionBody, { borderTopColor: colors.border }]}>{children}</View>
      ) : null}
    </View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, setTheme, isDark, colors } = useTheme();
  const { languageLabel, setLanguage, t, languageOptions } = useLanguage();

  const [currentPlan, setCurrentPlan] = useState("FREE");

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [userUsername, setUserUsername] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [userProfileRole, setUserProfileRole] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [userRole, setUserRole] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const [profileModal, setProfileModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [themeModal, setThemeModal] = useState(false);
  const [langModal, setLangModal] = useState(false);

  const [securityModal, setSecurityModal] = useState(false);
  const [openSecuritySection, setOpenSecuritySection] = useState<string | null>(
    "password"
  );

  const [emailVerified, setEmailVerified] = useState(true);
  const [authenticatorEnabled, setAuthenticatorEnabled] = useState(false);
  const [sms2FAEnabled, setSms2FAEnabled] = useState(true);

  const [tempName, setTempName] = useState(userName);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempUsername, setTempUsername] = useState(userUsername);
  const [tempPhone, setTempPhone] = useState(userPhone);
  const [tempBio, setTempBio] = useState(userBio);
  const [tempDepartment, setTempDepartment] = useState(userDepartment);
  const [tempProfileRole, setTempProfileRole] = useState(userProfileRole);
  
  const [tempLocation, setTempLocation] = useState(userLocation);

  const [currentPass, setCurrentPass] = useState("");
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Windows · Chrome",
      location: "İstanbul, TR · Şu an aktif",
      current: true,
    },
    {
      id: 2,
      device: "iPhone · Safari",
      location: "İstanbul, TR · 2 saat önce",
      current: false,
    },
    {
      id: 3,
      device: "MacBook · Firefox",
      location: "Ankara, TR · 3 gün önce",
      current: false,
    },
  ]);

  const fetchPlan = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/payments/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);
      

      console.log("PAYMENT OVERVIEW:", data);

      if (!res.ok) return;

      const rawPlan = data?.subscription?.plan || "FREE";
      console.log("RAW PLAN VALUE:", rawPlan);

      const planStr = String(rawPlan).toUpperCase();

      if (planStr === "PRO") {
        setCurrentPlan("PRO");
      } else if (planStr === "BUSINESS") {
        setCurrentPlan("BUSINESS");
      } else {
        setCurrentPlan("FREE");
      }
    } catch (err) {
      console.log("Plan alınamadı:", err);
    }
  };

// 🔥 EN KRİTİK
  useFocusEffect(
    useCallback(() => {
      fetchPlan();
   }, [])
  );
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          console.log("Token bulunamadı");
          return;
        }

        console.log("API_URL:", API_URL);
        console.log("GET URL:", `${API_URL}/users/me`);

        const res = await fetch(`${API_URL}/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json().catch(() => null);

        console.log("GET STATUS:", res.status);
        console.log("PROFILE DATA:", data);

        if (!res.ok) {
          Alert.alert(
            "Hata",
            data?.error || data?.message || "Profil alınamadı."
          );
          return;
        }

        setUserName(data?.name || "");
        setUserEmail(data?.email || "");
        setUserUsername(data?.username || "");
        setUserPhone(data?.phone || "");
        setUserBio(data?.bio || "");
        setUserDepartment(data?.department || "");
        setUserProfileRole(data?.profileRole || "");
        setUserLocation(data?.location || "");
        setNotifEnabled(data?.notificationEnabled ?? true);
        const firstOrganization = data?.myOrganizations?.[0];

        setUserRole(firstOrganization?.role || "MEMBER");
        setOrganizationName(firstOrganization?.name || "Organizasyon Yok");
        setProjectCount(data?.stats?.projectCount || 0);
        setTaskCount(data?.stats?.taskCount || 0);
        setCompletedTaskCount(data?.stats?.completedTaskCount || 0);

        setTempName(data?.name || "");
        setTempEmail(data?.email || "");
        setTempUsername(data?.username || "");
        setTempPhone(data?.phone || "");
        setTempBio(data?.bio || "");
        setTempDepartment(data?.department || "");
        setTempProfileRole(data?.profileRole || "");
        setTempLocation(data?.location || "");
      } catch (err) {
        console.log("Profil alınamadı:", err);
        Alert.alert("Hata", "Sunucuya bağlanılamadı.");
      }
    };

    fetchUser();
  }, []);

  const showComingSoon = (title: string) => {
    Alert.alert(title, "Bu alan şimdilik hazırlanıyor.");
  };

  const toggleSecuritySection = (key: string) => {
    setOpenSecuritySection((prev) => (prev === key ? null : key));
  };

  const handleThemeChange = async (selectedTheme: ThemeMode) => {
    try {
      await setTheme(selectedTheme);
      setThemeModal(false);
    } catch (error) {
      console.log("Tema kaydedilemedi:", error);
      Alert.alert("Hata", "Tema kaydedilemedi.");
    }
  };

  const handleLanguageChange = async (selectedLanguage: string) => {
    try {
      await setLanguage(selectedLanguage);
      setLangModal(false);
      Alert.alert(t("common.success"), t("profile.languageChanged"));
    } catch (error) {
      console.log("Dil kaydedilemedi:", error);
      Alert.alert(t("common.error"), "Dil kaydedilemedi.");
    }
  };

  const handleNotificationChange = async (value: boolean) => {
  try {
    setNotifEnabled(value);

    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        username: userUsername,
        phone: userPhone,
        bio: userBio,
        department: userDepartment,
        profileRole: userProfileRole,
        location: userLocation,
        notificationEnabled: value,
      }),
    });

    const data = await res.json().catch(() => null);
    console.log("NOTIF UPDATE:", data);

    if (!res.ok) {
      setNotifEnabled(!value);
      Alert.alert("Hata", data?.message || "Güncellenemedi");
    }
  } catch (err) {
    setNotifEnabled(!value);
    console.log("Notif error:", err);
    Alert.alert("Hata", "Bildirim ayarı kaydedilemedi.");
  }
};

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "İzin Gerekli",
        "Fotoğraf seçmek için galeri izni vermeniz gerekiyor."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    const cleanName = tempName.trim();
    const cleanEmail = tempEmail.trim().toLowerCase();
    const cleanUsername = tempUsername.trim();
    const cleanPhone = tempPhone.trim();
    const cleanBio = tempBio.trim();
    const cleanDepartment = tempDepartment.trim();
    const cleanProfileRole = tempProfileRole.trim();
    console.log("GÖNDERİLEN ROLE:", cleanProfileRole);
    const cleanLocation = tempLocation.trim();

    if (!cleanName) {
      Alert.alert("Hata", "Ad Soyad boş olamaz.");
      return;
    }

    if (cleanName.length < 2) {
      Alert.alert("Hata", "Ad Soyad en az 2 karakter olmalı.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      Alert.alert("Hata", "Geçerli bir e-posta girin.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Hata",
          "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın."
        );
        return;
      }

      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          username: cleanUsername,
          phone: cleanPhone,
          bio: cleanBio,
          department: cleanDepartment,
          profileRole: cleanProfileRole,
          location: cleanLocation,
        }),
      });

      const data = await res.json().catch(() => null);
      console.log("UPDATE RESPONSE:", data);

      if (!res.ok) {
        Alert.alert(
          "Hata",
          data?.error || data?.message || "Güncelleme başarısız."
        );
        return;
      }

      const user = data?.user || data;

      setUserName(user?.name || cleanName);
      setUserEmail(user?.email || cleanEmail);
      setUserUsername(user?.username || cleanUsername);
      setUserPhone(user?.phone || cleanPhone);
      setUserBio(user?.bio || cleanBio);
      setUserDepartment(user?.department || cleanDepartment);
      setUserProfileRole(user?.profileRole || cleanProfileRole);
      setUserLocation(user?.location || cleanLocation);

      setTempName(user?.name || cleanName);
      setTempEmail(user?.email || cleanEmail);
      setTempUsername(user?.username || cleanUsername);
      setTempPhone(user?.phone || cleanPhone);
      setTempBio(user?.bio || cleanBio);
      setTempDepartment(user?.department || cleanDepartment);
      setTempProfileRole(user?.profileRole || cleanProfileRole);
      setTempLocation(user?.location || cleanLocation);

      setProfileModal(false);
      Alert.alert("Başarılı ✅", data?.message || "Profil güncellendi.");
    } catch (err) {
      console.log("Update hatası:", err);
      Alert.alert("Hata", "Sunucu hatası");
    }
  };

  const saveSecurityPassword = async () => {
    setPasswordError("");

    if (!currentPass.trim()) {
      const msg = t("password.needCurrent");
      setPasswordError(msg);
      Alert.alert(t("common.error"), msg);
      return;
    }

    if (!validatePasswordPolicy(newPass)) {
      const msg = t("password.policyFail");
      setPasswordError(msg);
      Alert.alert(t("common.error"), msg);
      return;
    }

    if (newPass !== confirmPass) {
      const msg = t("password.mismatch");
      setPasswordError(msg);
      Alert.alert(t("common.error"), msg);
      return;
    }

    try {
      setPasswordSaving(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        const msg = t("password.sessionMissing");
        setPasswordError(msg);
        Alert.alert(t("common.error"), msg);
        return;
      }

      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPass.trim(),
          newPassword: newPass.trim(),
          confirmPassword: confirmPass.trim(),
        }),
      });

      const data = await res.json().catch(() => null);
      console.log("CHANGE PASSWORD RESPONSE:", res.status, data);

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          (res.status === 404
            ? "Şifre değiştirme servisi bulunamadı."
            : t("password.updateFailed"));
        setPasswordError(msg);
        Alert.alert(t("common.error"), msg);
        return;
      }

      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setPasswordError("");

      Alert.alert(t("common.success"), data?.message || t("password.updated"));
    } catch (error) {
      console.log("Şifre değiştirme hatası:", error);
      const msg = t("password.serverError");
      setPasswordError(msg);
      Alert.alert(t("common.error"), msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          router.replace("/welcome");
        },
      },
    ]);
  };

  const handleEndSession = (id: number) => {
    setSessions((prev) => prev.filter((item) => item.id !== id));
    Alert.alert("Oturum Sonlandırıldı", "Seçilen cihazın oturumu kapatıldı.");
  };

  const handleEndAllSessions = () => {
    Alert.alert(
      "Tüm Oturumları Sonlandır",
      "Bu cihaz dışındaki tüm oturumlar kapatılacak. Devam edilsin mi?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sonlandır",
          style: "destructive",
          onPress: () => {
            setSessions((prev) => prev.filter((item) => item.current));
            Alert.alert("Başarılı", "Diğer tüm oturumlar kapatıldı.");
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (!deleteAccountPassword.trim()) {
      Alert.alert("Hata", "Hesabı silmek için şifrenizi girin.");
      return;
    }

    Alert.alert(
      "Hesabı Sil",
      "Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecek.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingAccount(true);
              const token = await AsyncStorage.getItem("token");

              if (!token) {
                Alert.alert("Hata", "Oturum bulunamadı.");
                return;
              }

              const res = await fetch(`${API_URL}/users/account`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password: deleteAccountPassword.trim() }),
              });

              const data = await res.json().catch(() => null);

              if (!res.ok) {
                Alert.alert("Hata", data?.error || data?.message || "Hesap silinemedi.");
                return;
              }

              await AsyncStorage.multiRemove(["token", "user", "activeOrgId"]);
              setSecurityModal(false);
              setDeleteAccountPassword("");
              Alert.alert("Tamamlandı", data?.message || "Hesabınız silindi.", [
                {
                  text: "Tamam",
                  onPress: () => router.replace("/welcome"),
                },
              ]);
            } catch (error) {
              console.log("Hesap silme hatası:", error);
              Alert.alert("Hata", "Sunucuya bağlanılamadı.");
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Aboneliği İptal Et",
      "Ücretli aboneliğinizi iptal etmek istediğinize emin misiniz? İptal sonrası ücretsiz plana geçersiniz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "İptal Et",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");

              if (!token) {
                Alert.alert(
                  "Hata",
                  "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın."
                );
                return;
              }

              const res = await fetch(`${API_URL}/payments/cancel-subscription`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              const data = await res.json().catch(() => null);

              if (!res.ok) {
                Alert.alert(
                  "Hata",
                  data?.message || data?.error || "Abonelik iptal edilemedi."
                );
                return;
              }

              setCurrentPlan("FREE");
              Alert.alert(
                "Başarılı ✅",
                data?.message || "Abonelik iptal edildi. Ücretsiz plana geçildi."
              );
            } catch (error) {
              console.log("Abonelik iptal hatası:", error);
              Alert.alert("Hata", "Sunucuya bağlanılamadı.");
            }
          },
        },
      ]
    );
  };

  const openSupportEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("TaskiFlow Destek")}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert(t("profile.helpTitle"), SUPPORT_EMAIL);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(t("profile.helpTitle"), SUPPORT_EMAIL);
    }
  };

  const MENU_SECTIONS = [
    {
      title: t("profile.section.org"),
      items: [
        {
          icon: "business-center",
          label: t("profile.workspace"),
          color: "#2563EB",
          value: t("profile.details"),
          onPress: () => router.push("/workspace"),
        },
        {
          icon: "groups",
          label: t("profile.teams"),
          color: "#0EA5E9",
          onPress: () => router.push("/teams"),
        },
        {
          icon: "people",
          label: t("profile.members"),
          color: "#14B8A6",
          onPress: () => router.push("/members"),
        },
      ],
    },
    {
      title: t("profile.section.account"),
      items: [
        {
          icon: "person",
          label: t("profile.profileInfo"),
          color: "#2563EB",
          onPress: () => {
            setTempName(userName);
            setTempEmail(userEmail);
            setTempUsername(userUsername);
            setTempPhone(userPhone);
            setTempBio(userBio);
            setTempDepartment(userDepartment);
            setTempProfileRole(userProfileRole);
            setTempLocation(userLocation);
            setProfileModal(true);
          },
        },
        {
          icon: "security",
          label: t("profile.security"),
          color: "#DC2626",
          onPress: () => {
            setCurrentPass("");
            setNewPass("");
            setConfirmPass("");
            setPasswordError("");
            setShowCurrentPass(false);
            setShowNewPass(false);
            setShowConfirmPass(false);
            setSecurityModal(true);
          },
        },
        {
          icon: "link",
          label: t("profile.connected"),
          color: "#8B5CF6",
          onPress: () => router.push("/connected-accounts"),
        },
        {
          icon: "credit-card",
          label: t("profile.plans"),
          color: "#2563EB",
          onPress: () => router.push("/plans"),
        },
        {
          icon: "receipt-long",
          label: t("profile.paymentHistory"),
          color: "#10B981",
          onPress: () => router.push("/payment-history"),
        },
      ],
    },
    {
      title: t("profile.section.prefs"),
      items: [
        {
          icon: "notifications",
          label: t("profile.notifSettings"),
          color: "#F59E0B",
          value: notifEnabled ? t("common.on") : t("common.off"),
          onPress: () => setNotifModal(true),
        },
        {
          icon: "dark-mode",
          label: t("profile.theme"),
          color: "#6366F1",
          value: theme,
          onPress: () => setThemeModal(true),
        },
        {
          icon: "language",
          label: t("profile.language"),
          color: "#2563EB",
          value: languageLabel,
          onPress: () => setLangModal(true),
        },
      ],
    },
    {
      title: t("profile.section.other"),
      items: [
        {
          icon: "help",
          label: t("profile.help"),
          color: "#8B5CF6",
          onPress: () =>
            Alert.alert(t("profile.helpTitle"), `${t("profile.helpBody")}\n${SUPPORT_EMAIL}`, [
              { text: t("common.cancel"), style: "cancel" },
              { text: t("profile.helpOpen"), onPress: openSupportEmail },
            ]),
        },
        {
          icon: "description",
          label: t("profile.privacy"),
          color: "#6B7280",
          onPress: () => router.push("/privacy"),
        },
        {
          icon: "star",
          label: t("profile.rate"),
          color: "#F59E0B",
          onPress: () =>
            Alert.alert(
              "⭐",
              t("profile.rateThanks")
            ),
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <Pressable onPress={pickImage} style={styles.avatarContainer}>
            <View style={styles.avatarLarge}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarLargeText}>
                  {userName ? userName.charAt(0).toUpperCase() : "S"}
                </Text>
              )}
            </View>

            <View style={[styles.cameraBadge, { backgroundColor: colors.card }]}>
              <IconSymbol name="camera.fill" size={14} color="#2563EB" />
            </View>
          </Pressable>

          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>

          <View style={styles.roleRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {userDepartment || t("profile.roleFallback")}
              </Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{organizationName}</Text>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{projectCount}</Text>
              <Text style={styles.profileStatLabel}>Proje</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{taskCount}</Text>
              <Text style={styles.profileStatLabel}>Görev</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{completedTaskCount}</Text>
              <Text style={styles.profileStatLabel}>Tamamlanan</Text>
            </View>
          </View>
        </View>

        <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.planInfo}>
            <Text style={[styles.planLabel, { color: colors.textSecondary }]}>Mevcut Plan</Text>
            <Text style={[styles.planName, { color: colors.text }]}>
              {PLAN_LABELS[currentPlan] || "Ücretsiz Başlangıç"}
            </Text>
          </View>

          <Pressable
            style={styles.planBadge}
            onPress={() => router.push("/plans")}
          >
            <Text style={styles.planBadgeText}>
              {currentPlan === "FREE" ? "Yükselt" : "Planları Gör"}
            </Text>
          </Pressable>
        </View>

        {currentPlan !== "FREE" && (
          <Pressable
            style={[styles.cancelSubscriptionBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
            onPress={handleCancelSubscription}
          >
            <MaterialIcons name="cancel" size={18} color="#DC2626" />
            <Text style={styles.cancelSubscriptionText}>
              {currentPlan === "BUSINESS"
                ? "Business Aboneliğini İptal Et"
                : "Pro Aboneliğini İptal Et"}
            </Text>
          </Pressable>
        )}

        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.menuSection}>
            <Text style={[styles.menuSectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>

            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, ii) => (
                <Pressable
                  key={ii}
                  style={[
                    styles.menuItem,
                    ii < section.items.length - 1 && [styles.menuItemBorder, { borderBottomColor: colors.border }],
                  ]}
                  onPress={item.onPress}
                >
                  <View
                    style={[
                      styles.menuIconWrap,
                      { backgroundColor: item.color + "18" },
                    ]}
                  >
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>

                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>

                  <View style={styles.menuRight}>
                    {"value" in item && item.value ? (
                      <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{item.value}</Text>
                    ) : null}
                    <IconSymbol
                      name="chevron.right"
                      size={14}
                      color={colors.textSecondary}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: isDark ? "#7F1D1D" : "#FEE2E2" }]} onPress={handleLogout}>
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={20}
            color="#EF4444"
          />
          <Text style={styles.logoutText}>{t("profile.logout")}</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.textSecondary }]}>TaskiFlow v1.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>

      <Sheet
        visible={profileModal}
        onClose={() => setProfileModal(false)}
        title="Profil Bilgileri"
        colors={colors}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Ad Soyad</Text>
          <TextInput
            style={[styles.sheetInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={tempName}
            onChangeText={setTempName}
            placeholder="Ad Soyad"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Kullanıcı Adı</Text>
          <TextInput
            style={[styles.sheetInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={tempUsername}
            onChangeText={setTempUsername}
            placeholder="kullaniciadi"
            autoCapitalize="none"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>E-posta</Text>
          <TextInput
            style={[styles.sheetInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={tempEmail}
            onChangeText={setTempEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="ornek@mail.com"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Telefon</Text>
          <TextInput
            style={[styles.sheetInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={tempPhone}
            onChangeText={setTempPhone}
            keyboardType="phone-pad"
            placeholder="+90 5xx xxx xx xx"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Biyografi</Text>
          <TextInput
            style={[styles.sheetInput, styles.sheetTextArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={tempBio}
            onChangeText={setTempBio}
            placeholder="Kendiniz hakkında kısa bir açıklama"
            multiline
            textAlignVertical="top"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Departman / Rol</Text>
          <TextInput
            style={[styles.sheetInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={tempDepartment}
            onChangeText={setTempDepartment}
            placeholder="Mobil Geliştirme"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Profil Rolü</Text>
          <TextInput
            style={[styles.sheetInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={tempProfileRole}
            onChangeText={setTempProfileRole}
            placeholder="Stajyer / Mobil Developer"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şehir / Konum</Text>
          <TextInput
            style={[styles.sheetInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={tempLocation}
            onChangeText={setTempLocation}
            placeholder="Şehir / Ülke"
            placeholderTextColor={colors.placeholder}
          />

          <View style={styles.sheetButtons}>
            <Pressable
              style={[styles.sheetCancelBtn, { borderColor: colors.border }]}
              onPress={() => setProfileModal(false)}
            >
              <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>İptal</Text>
            </Pressable>

            <Pressable style={styles.sheetSaveBtn} onPress={saveProfile}>
              <Text style={styles.sheetSaveText}>Kaydet</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Sheet>

      <Sheet
        visible={notifModal}
        onClose={() => setNotifModal(false)}
        title="Bildirim Ayarları"
        colors={colors}
      >
        <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Push Bildirimleri</Text>
          <Switch
            value={notifEnabled}
            onValueChange={handleNotificationChange}
            trackColor={{ true: "#2563EB" }}
          />
        </View>

        <Pressable
          style={styles.sheetDoneBtn}
          onPress={() => setNotifModal(false)}
        >
          <Text style={styles.sheetSaveText}>Tamam</Text>
        </Pressable>
      </Sheet>

      <Sheet
        visible={themeModal}
        onClose={() => setThemeModal(false)}
        title="Tema Seç"
        colors={colors}
      >
        {(["Açık", "Koyu", "Sistem"] as ThemeMode[]).map((t) => (
          <Pressable
            key={t}
            style={[
              styles.optionRow,
              { backgroundColor: colors.inputBg },
              theme === t && [styles.optionRowActive, { backgroundColor: colors.cardLight, borderColor: colors.primary }],
            ]}
            onPress={() => handleThemeChange(t)}
          >
            <Text
              style={[styles.optionText, { color: colors.text }, theme === t && styles.optionTextActive]}
            >
              {t}
            </Text>
            {theme === t && (
              <IconSymbol name="checkmark" size={18} color="#2563EB" />
            )}
          </Pressable>
        ))}
      </Sheet>

      <Sheet
        visible={langModal}
        onClose={() => setLangModal(false)}
        title={t("profile.chooseLanguage")}
        colors={colors}
      >
        {languageOptions.map((l) => (
          <Pressable
            key={l.code}
            style={[
              styles.optionRow,
              { backgroundColor: colors.inputBg },
              languageLabel === l.label && [styles.optionRowActive, { backgroundColor: colors.cardLight, borderColor: colors.primary }],
            ]}
            onPress={() => handleLanguageChange(l.code)}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.text },
                languageLabel === l.label && styles.optionTextActive,
              ]}
            >
              {l.label}
            </Text>
            {languageLabel === l.label && (
              <IconSymbol name="checkmark" size={18} color="#2563EB" />
            )}
          </Pressable>
        ))}
      </Sheet>

      <Modal
        visible={securityModal}
        animationType="slide"
        onRequestClose={() => setSecurityModal(false)}
      >
        <SafeAreaView style={[styles.securityScreen, { backgroundColor: colors.background }]}>
          <View style={[styles.securityHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
            <Pressable
              style={[styles.securityBackBtn, { backgroundColor: colors.cardLight }]}
              onPress={() => setSecurityModal(false)}
            >
              <MaterialIcons
                name="arrow-back-ios-new"
                size={20}
                color={colors.text}
              />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={[styles.securityHeaderTitle, { color: colors.text }]}>Güvenlik ve Erişim</Text>
              <Text style={[styles.securityHeaderSubtitle, { color: colors.textSecondary }]}>
                Hesap güvenliğini ve erişim ayarlarını yönet
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.securityScroll}
          >
            <SecurityAccordionItem
              sectionKey="password"
              icon="lock-outline"
              title={t("password.changeTitle")}
              subtitle={t("password.policy")}
              isOpen={openSecuritySection === "password"}
              onToggle={toggleSecuritySection}
              colors={colors}
            >
              <Text style={[styles.securityInputLabel, { color: colors.textSecondary }]}>{t("password.current")}</Text>
              <View style={[styles.passwordField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.passwordFieldInput, { color: colors.inputText }]}
                  value={currentPass}
                  onChangeText={(v) => {
                    setCurrentPass(v);
                    setPasswordError("");
                  }}
                  secureTextEntry={!showCurrentPass}
                  placeholder="••••••••"
                  placeholderTextColor={colors.placeholder}
                />
                <Pressable onPress={() => setShowCurrentPass((p) => !p)} hitSlop={8}>
                  <MaterialIcons
                    name={showCurrentPass ? "visibility-off" : "visibility"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              <Text style={[styles.securityInputLabel, { color: colors.textSecondary }]}>{t("password.new")}</Text>
              <View style={[styles.passwordField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.passwordFieldInput, { color: colors.inputText }]}
                  value={newPass}
                  onChangeText={(v) => {
                    setNewPass(v);
                    setPasswordError("");
                  }}
                  secureTextEntry={!showNewPass}
                  placeholder="••••••••"
                  placeholderTextColor={colors.placeholder}
                />
                <Pressable onPress={() => setShowNewPass((p) => !p)} hitSlop={8}>
                  <MaterialIcons
                    name={showNewPass ? "visibility-off" : "visibility"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              <Text style={[styles.securityInputLabel, { color: colors.textSecondary }]}>{t("password.confirm")}</Text>
              <View style={[styles.passwordField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.passwordFieldInput, { color: colors.inputText }]}
                  value={confirmPass}
                  onChangeText={(v) => {
                    setConfirmPass(v);
                    setPasswordError("");
                  }}
                  secureTextEntry={!showConfirmPass}
                  placeholder="••••••••"
                  placeholderTextColor={colors.placeholder}
                />
                <Pressable onPress={() => setShowConfirmPass((p) => !p)} hitSlop={8}>
                  <MaterialIcons
                    name={showConfirmPass ? "visibility-off" : "visibility"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              {!!passwordError && (
                <Text style={styles.passwordErrorText}>{passwordError}</Text>
              )}

              <Pressable
                style={[styles.securityPrimaryButton, passwordSaving && { opacity: 0.7 }]}
                onPress={saveSecurityPassword}
                disabled={passwordSaving}
              >
                <Text style={styles.securityPrimaryButtonText}>
                  {passwordSaving ? t("common.loading") : t("password.update")}
                </Text>
              </Pressable>
            </SecurityAccordionItem>

            <SecurityAccordionItem
              sectionKey="2fa"
              icon="verified-user"
              title="İki faktörlü doğrulama"
              subtitle="Hesabını ek bir güvenlik katmanıyla koru"
              isOpen={openSecuritySection === "2fa"}
              onToggle={toggleSecuritySection}
              colors={colors}
            >
              <View style={[styles.securitySettingRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.securitySettingTitle, { color: colors.text }]}>
                    Authenticator uygulaması
                  </Text>
                  <Text style={[styles.securitySettingDesc, { color: colors.textSecondary }]}>
                    Google Authenticator, Authy vb.
                  </Text>
                </View>

                <View style={styles.securityStatusSwitch}>
                  <Text
                    style={[
                      styles.securityStatusText,
                      authenticatorEnabled
                        ? styles.statusActive
                        : styles.statusPassive,
                    ]}
                  >
                    {authenticatorEnabled ? "Aktif" : "Kurulmadı"}
                  </Text>
                  <Switch
                    value={authenticatorEnabled}
                    onValueChange={setAuthenticatorEnabled}
                    trackColor={{ true: "#2563EB", false: "#D1D5DB" }}
                  />
                </View>
              </View>

              <View style={[styles.securitySettingRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.securitySettingTitle, { color: colors.text }]}>SMS doğrulama</Text>
                  <Text style={[styles.securitySettingDesc, { color: colors.textSecondary }]}>
                    Telefon numarası ile giriş koruması
                  </Text>
                </View>

                <View style={styles.securityStatusSwitch}>
                  <Text
                    style={[
                      styles.securityStatusText,
                      sms2FAEnabled ? styles.statusActive : styles.statusPassive,
                    ]}
                  >
                    {sms2FAEnabled ? "Aktif" : "Kapalı"}
                  </Text>
                  <Switch
                    value={sms2FAEnabled}
                    onValueChange={setSms2FAEnabled}
                    trackColor={{ true: "#2563EB", false: "#D1D5DB" }}
                  />
                </View>
              </View>
            </SecurityAccordionItem>

            <SecurityAccordionItem
              sectionKey="email"
              icon="mark-email-read"
              title="E-posta doğrulama"
              subtitle={tempEmail || userEmail}
              isOpen={openSecuritySection === "email"}
              onToggle={toggleSecuritySection}
              colors={colors}
            >
              <View style={[styles.securitySettingRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.securitySettingTitle, { color: colors.text }]}>Hesap e-postası</Text>
                  <Text style={[styles.securitySettingDesc, { color: colors.textSecondary }]}>{userEmail}</Text>
                </View>

                <View style={styles.securityStatusSwitch}>
                  <Text
                    style={[
                      styles.securityStatusText,
                      emailVerified ? styles.statusActive : styles.statusPassive,
                    ]}
                  >
                    {emailVerified ? "Aktif" : "Doğrulanmadı"}
                  </Text>
                  <Switch
                    value={emailVerified}
                    onValueChange={setEmailVerified}
                    trackColor={{ true: "#2563EB", false: "#D1D5DB" }}
                  />
                </View>
              </View>
            </SecurityAccordionItem>

            <SecurityAccordionItem
              sectionKey="sessions"
              icon="devices"
              title="Aktif oturumlar"
              subtitle="Hesabınıza bağlı tüm cihazlar"
              isOpen={openSecuritySection === "sessions"}
              onToggle={toggleSecuritySection}
              colors={colors}
            >
              {sessions.map((session, index) => (
                <View
                  key={session.id}
                  style={[
                    styles.sessionRow,
                    index < sessions.length - 1 && [styles.sessionRowBorder, { borderBottomColor: colors.border }],
                  ]}
                >
                  <View style={[styles.sessionIcon, { backgroundColor: colors.cardLight }]}>
                    <MaterialIcons name="devices" size={18} color={colors.textSecondary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sessionDevice, { color: colors.text }]}>{session.device}</Text>
                    <Text style={[styles.sessionLocation, { color: colors.textSecondary }]}>{session.location}</Text>
                  </View>

                  {session.current ? (
                    <View style={styles.currentDeviceBadge}>
                      <Text style={styles.currentDeviceBadgeText}>Bu cihaz</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.sessionDangerBtn}
                      onPress={() => handleEndSession(session.id)}
                    >
                      <Text style={styles.sessionDangerBtnText}>Sonlandır</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </SecurityAccordionItem>

            <SecurityAccordionItem
              sectionKey="danger"
              icon="warning-amber"
              title="Tehlike bölgesi"
              subtitle="Bu işlemler geri alınamaz"
              danger
              isOpen={openSecuritySection === "danger"}
              onToggle={toggleSecuritySection}
              colors={colors}
            >
              <View style={[styles.dangerActionRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dangerActionTitle, { color: colors.text }]}>
                    Tüm oturumları sonlandır
                  </Text>
                  <Text style={[styles.dangerActionDesc, { color: colors.textSecondary }]}>
                    Bu cihaz dışındaki tüm oturumları kapat
                  </Text>
                </View>

                <Pressable
                  style={styles.dangerSmallBtn}
                  onPress={handleEndAllSessions}
                >
                  <Text style={styles.dangerSmallBtnText}>Sonlandır</Text>
                </Pressable>
              </View>

              <View style={[styles.dangerActionRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dangerActionTitle, { color: colors.text }]}>Hesabı sil</Text>
                  <Text style={[styles.dangerActionDesc, { color: colors.textSecondary }]}>
                    Tüm veriler kalıcı olarak silinir
                  </Text>
                </View>

                <Pressable
                  style={[styles.dangerOutlineBtn, { backgroundColor: colors.card }]}
                  onPress={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  <Text style={styles.dangerOutlineBtnText}>
                    {deletingAccount ? "..." : "Hesabı sil"}
                  </Text>
                </Pressable>
              </View>

              <Text style={[styles.securityInputLabel, { color: colors.textSecondary }]}>
                Onay için şifreniz
              </Text>
              <TextInput
                style={[styles.securityInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
                value={deleteAccountPassword}
                onChangeText={setDeleteAccountPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
              />
            </SecurityAccordionItem>

            <View style={{ height: 24 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 24,
  },

  profileCard: {
    backgroundColor: "#2563EB",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 14,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarLargeText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  profileName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  profileEmail: {
    color: "#DBEAFE",
    fontSize: 14,
    marginTop: 4,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  profileStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: "100%",
  },
  profileStat: {
    flex: 1,
    alignItems: "center",
  },
  profileStatValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  profileStatLabel: {
    color: "#DBEAFE",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
  profileStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  planName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  planBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  cancelSubscriptionBtn: {
    marginHorizontal: 20,
    marginTop: 10,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  cancelSubscriptionText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },

  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuValue: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 28,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "700",
  },
  version: {
    textAlign: "center",
    color: "#D1D5DB",
    fontSize: 12,
    marginTop: 20,
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "92%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  sheetInput: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    fontSize: 14,
    color: "#111827",
  },
  sheetTextArea: {
    minHeight: 96,
  },

  sheetButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  sheetCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  sheetSaveBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSaveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  sheetDoneBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  optionRowActive: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#2563EB",
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  optionTextActive: {
    color: "#2563EB",
    fontWeight: "700",
  },

  securityScreen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  securityBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  securityHeaderTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
  },
  securityHeaderSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  securityScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  securityAccordionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    overflow: "hidden",
  },
  securityAccordionDanger: {
    borderColor: "#FECACA",
    backgroundColor: "#FFFDFD",
  },
  securityAccordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  securityAccordionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  securityAccordionIconWrapDanger: {
    backgroundColor: "#FEE2E2",
  },
  securityAccordionTextWrap: {
    flex: 1,
  },
  securityAccordionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  securityAccordionTitleDanger: {
    color: "#B91C1C",
  },
  securityAccordionSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 17,
  },
  securityAccordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  securityInputLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 8,
  },
  securityInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111827",
  },
  passwordField: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  passwordFieldInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    paddingRight: 8,
  },
  passwordErrorText: {
    marginTop: 12,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  securityPrimaryButton: {
    marginTop: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
  },
  securityPrimaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  securitySettingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  securitySettingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  securitySettingDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  securityStatusSwitch: {
    alignItems: "flex-end",
    gap: 6,
  },
  securityStatusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusActive: {
    color: "#16A34A",
  },
  statusPassive: {
    color: "#D97706",
  },

  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  sessionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sessionDevice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  sessionLocation: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  currentDeviceBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  currentDeviceBadgeText: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "800",
  },
  sessionDangerBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sessionDangerBtnText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
  },

  dangerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#FEE2E2",
  },
  dangerActionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  dangerActionDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  dangerSmallBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  dangerSmallBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "800",
  },
  dangerOutlineBtn: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  dangerOutlineBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "800",
  },
});