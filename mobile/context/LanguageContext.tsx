import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

export type AppLanguage = "tr" | "en" | "ar";

type TranslationMap = Record<string, string>;

const STORAGE_KEY = "profile_language";

const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
};

const LABEL_TO_CODE: Record<string, AppLanguage> = {
  Türkçe: "tr",
  English: "en",
  العربية: "ar",
  tr: "tr",
  en: "en",
  ar: "ar",
};

const translations: Record<AppLanguage, TranslationMap> = {
  tr: {
    "tabs.overview": "Genel Bakış",
    "tabs.ai": "AI",
    "tabs.reports": "Raporlar",
    "tabs.add": "Görev",
    "tabs.profile": "Profil",
    "common.on": "Açık",
    "common.off": "Kapalı",
    "common.error": "Hata",
    "common.success": "Başarılı",
    "common.cancel": "İptal",
    "common.save": "Kaydet",
    "common.loading": "Yükleniyor...",
    "profile.roleFallback": "Rol Seçilmedi",
    "profile.section.org": "Organizasyon",
    "profile.section.account": "Hesap",
    "profile.section.prefs": "Tercihler",
    "profile.section.other": "Diğer",
    "profile.workspace": "Çalışma Alanı",
    "profile.teams": "Takımlar",
    "profile.members": "Üyeler",
    "profile.profileInfo": "Profil Bilgileri",
    "profile.security": "Güvenlik ve Erişim",
    "profile.connected": "Bağlı Hesaplar",
    "profile.plans": "Abonelik ve Planlar",
    "profile.paymentHistory": "Ödeme Geçmişi",
    "profile.notifSettings": "Bildirim Ayarları",
    "profile.theme": "Tema",
    "profile.language": "Dil",
    "profile.help": "Yardım & Destek",
    "profile.privacy": "Gizlilik Politikası",
    "profile.rate": "Uygulamayı Değerlendir",
    "profile.details": "Detaylar",
    "profile.chooseLanguage": "Dil Seç",
    "profile.languageChanged": "Dil güncellendi.",
    "profile.helpTitle": "Yardım & Destek",
    "profile.helpBody": "Destek için e-posta uygulamanız açılacak.",
    "profile.helpOpen": "E-posta Gönder",
    "profile.rateThanks": "Geri bildiriminiz için teşekkür ederiz.",
    "profile.logout": "Çıkış Yap",
    "profile.logoutConfirm": "Çıkış yapmak istediğinize emin misiniz?",
    "overview.welcome": "Hoş Geldiniz, {name}",
    "overview.search": "Proje kayıtlarında ara...",
    "overview.newProject": "Yeni Proje",
    "overview.employees": "Şirket Çalışanları",
    "overview.membersCount": "{count} ÜYE",
    "overview.noMembers": "Henüz ekip üyesi yok.",
    "overview.savedProjects": "Kayıtlı Projeler",
    "overview.total": "{count} TOPLAM",
    "overview.noProjects": "Görüntülenecek proje bulunamadı.",
    "overview.openFile": "Dosyayı Aç >",
    "overview.completedProjects": "Tamamlanan Projeler",
    "overview.progress": "İlerleme",
    "overview.totalProjects": "TOPLAM PROJE",
    "overview.avgProgress": "ORTALAMA İLERLEME",
    "notifications.title": "Bildirimler",
    "password.current": "Mevcut şifre",
    "password.new": "Yeni şifre",
    "password.confirm": "Şifre tekrar",
    "password.update": "Şifreyi güncelle",
    "password.changeTitle": "Şifre değiştir",
    "password.policy": "En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter",
    "password.needCurrent": "Mevcut şifrenizi girin.",
    "password.policyFail": "Yeni şifre politikaya uymuyor. En az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir.",
    "password.mismatch": "Şifreler eşleşmiyor.",
    "password.updated": "Şifre güncellendi.",
    "password.updateFailed": "Şifre güncellenemedi.",
    "password.sessionMissing": "Oturum bulunamadı. Lütfen tekrar giriş yapın.",
    "password.serverError": "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
    "connected.title": "Bağlı Hesaplar",
    "connected.subtitle": "Üçüncü parti hesap bağlantılarını yönetin",
    "connected.linked": "Bağlı",
    "connected.notLinked": "Bağlı değil",
    "connected.link": "Bağla",
    "connected.unlink": "Bağlantıyı Kes",
    "connected.note": "Bağladığınız hesap bilgisi bu cihazda güvenle saklanır. Sosyal giriş API anahtarları eklendiğinde otomatik oturum açılacaktır.",
    "connected.linkPrompt": "Bağlamak istediğiniz hesabın e-posta veya kullanıcı adını girin.",
    "connected.linkPlaceholderGoogle": "ornek@gmail.com",
    "connected.linkPlaceholderGithub": "kullanici-adi",
    "connected.invalidInput": "Geçerli bir e-posta veya kullanıcı adı girin.",
    "connected.linkedOk": "{provider} hesabı bağlandı.",
    "connected.unlinkedOk": "{provider} bağlantısı kaldırıldı.",
  },
  en: {
    "tabs.overview": "Overview",
    "tabs.ai": "AI",
    "tabs.reports": "Reports",
    "tabs.add": "Task",
    "tabs.profile": "Profile",
    "common.on": "On",
    "common.off": "Off",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.loading": "Loading...",
    "profile.roleFallback": "No role selected",
    "profile.section.org": "Organization",
    "profile.section.account": "Account",
    "profile.section.prefs": "Preferences",
    "profile.section.other": "Other",
    "profile.workspace": "Workspace",
    "profile.teams": "Teams",
    "profile.members": "Members",
    "profile.profileInfo": "Profile Info",
    "profile.security": "Security & Access",
    "profile.connected": "Connected Accounts",
    "profile.plans": "Subscription & Plans",
    "profile.paymentHistory": "Payment History",
    "profile.notifSettings": "Notification Settings",
    "profile.theme": "Theme",
    "profile.language": "Language",
    "profile.help": "Help & Support",
    "profile.privacy": "Privacy Policy",
    "profile.rate": "Rate the App",
    "profile.details": "Details",
    "profile.chooseLanguage": "Choose Language",
    "profile.languageChanged": "Language updated.",
    "profile.helpTitle": "Help & Support",
    "profile.helpBody": "Your email app will open for support.",
    "profile.helpOpen": "Send Email",
    "profile.rateThanks": "Thanks for your feedback.",
    "profile.logout": "Log Out",
    "profile.logoutConfirm": "Are you sure you want to log out?",
    "overview.welcome": "Welcome, {name}",
    "overview.search": "Search projects...",
    "overview.newProject": "New Project",
    "overview.employees": "Company Employees",
    "overview.membersCount": "{count} MEMBERS",
    "overview.noMembers": "No team members yet.",
    "overview.savedProjects": "Saved Projects",
    "overview.total": "{count} TOTAL",
    "overview.noProjects": "No projects to display.",
    "overview.openFile": "Open File >",
    "overview.completedProjects": "Completed Projects",
    "overview.progress": "Progress",
    "overview.totalProjects": "TOTAL PROJECTS",
    "overview.avgProgress": "AVERAGE PROGRESS",
    "notifications.title": "Notifications",
    "password.current": "Current password",
    "password.new": "New password",
    "password.confirm": "Confirm password",
    "password.update": "Update password",
    "password.changeTitle": "Change password",
    "password.policy": "At least 8 chars, 1 uppercase, 1 lowercase, 1 number and 1 special character",
    "password.needCurrent": "Enter your current password.",
    "password.policyFail": "New password does not meet the policy. Use 8+ chars with upper/lowercase, a number and a special character.",
    "password.mismatch": "Passwords do not match.",
    "password.updated": "Password updated.",
    "password.updateFailed": "Could not update password.",
    "password.sessionMissing": "Session not found. Please sign in again.",
    "password.serverError": "Could not reach the server. Please try again.",
    "connected.title": "Connected Accounts",
    "connected.subtitle": "Manage third-party account connections",
    "connected.linked": "Connected",
    "connected.notLinked": "Not connected",
    "connected.link": "Connect",
    "connected.unlink": "Disconnect",
    "connected.note": "Connection status is stored on this device. Full social login integration will be enabled soon.",
    "connected.linkPrompt": "Enter the email or username for the account you want to link.",
    "connected.linkPlaceholderGoogle": "you@example.com",
    "connected.linkPlaceholderGithub": "username",
    "connected.invalidInput": "Enter a valid email or username.",
    "connected.linkedOk": "{provider} account connected.",
    "connected.unlinkedOk": "{provider} disconnected.",
  },
  ar: {
    "tabs.overview": "نظرة عامة",
    "tabs.ai": "الذكاء الاصطناعي",
    "tabs.reports": "التقارير",
    "tabs.add": "مهمة",
    "tabs.profile": "الملف الشخصي",
    "common.on": "تشغيل",
    "common.off": "إيقاف",
    "common.error": "خطأ",
    "common.success": "نجاح",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.loading": "جارٍ التحميل...",
    "profile.roleFallback": "لم يتم اختيار دور",
    "profile.section.org": "المؤسسة",
    "profile.section.account": "الحساب",
    "profile.section.prefs": "التفضيلات",
    "profile.section.other": "أخرى",
    "profile.workspace": "مساحة العمل",
    "profile.teams": "الفرق",
    "profile.members": "الأعضاء",
    "profile.profileInfo": "معلومات الملف",
    "profile.security": "الأمان والوصول",
    "profile.connected": "الحسابات المرتبطة",
    "profile.plans": "الاشتراك والخطط",
    "profile.paymentHistory": "سجل المدفوعات",
    "profile.notifSettings": "إعدادات الإشعارات",
    "profile.theme": "المظهر",
    "profile.language": "اللغة",
    "profile.help": "المساعدة والدعم",
    "profile.privacy": "سياسة الخصوصية",
    "profile.rate": "قيّم التطبيق",
    "profile.details": "التفاصيل",
    "profile.chooseLanguage": "اختر اللغة",
    "profile.languageChanged": "تم تحديث اللغة.",
    "profile.helpTitle": "المساعدة والدعم",
    "profile.helpBody": "سيتم فتح تطبيق البريد للدعم.",
    "profile.helpOpen": "إرسال بريد",
    "profile.rateThanks": "شكرًا لملاحظاتك.",
    "profile.logout": "تسجيل الخروج",
    "profile.logoutConfirm": "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    "overview.welcome": "مرحبًا، {name}",
    "overview.search": "ابحث في المشاريع...",
    "overview.newProject": "مشروع جديد",
    "overview.employees": "موظفو الشركة",
    "overview.membersCount": "{count} أعضاء",
    "overview.noMembers": "لا يوجد أعضاء بعد.",
    "overview.savedProjects": "المشاريع المحفوظة",
    "overview.total": "{count} الإجمالي",
    "overview.noProjects": "لا توجد مشاريع للعرض.",
    "overview.openFile": "فتح الملف >",
    "overview.completedProjects": "المشاريع المكتملة",
    "overview.progress": "التقدم",
    "overview.totalProjects": "إجمالي المشاريع",
    "overview.avgProgress": "متوسط التقدم",
    "notifications.title": "الإشعارات",
    "password.current": "كلمة المرور الحالية",
    "password.new": "كلمة المرور الجديدة",
    "password.confirm": "تأكيد كلمة المرور",
    "password.update": "تحديث كلمة المرور",
    "password.changeTitle": "تغيير كلمة المرور",
    "password.policy": "8 أحرف على الأقل، حرف كبير وصغير ورقم ورمز خاص",
    "password.needCurrent": "أدخل كلمة المرور الحالية.",
    "password.policyFail": "كلمة المرور الجديدة لا تستوفي السياسة.",
    "password.mismatch": "كلمتا المرور غير متطابقتين.",
    "password.updated": "تم تحديث كلمة المرور.",
    "password.updateFailed": "تعذر تحديث كلمة المرور.",
    "password.sessionMissing": "لم يتم العثور على الجلسة. يرجى تسجيل الدخول مرة أخرى.",
    "password.serverError": "تعذر الاتصال بالخادم. حاول مرة أخرى.",
    "connected.title": "الحسابات المرتبطة",
    "connected.subtitle": "إدارة اتصالات الحسابات الخارجية",
    "connected.linked": "مرتبط",
    "connected.notLinked": "غير مرتبط",
    "connected.link": "ربط",
    "connected.unlink": "إلغاء الربط",
    "connected.note": "يتم حفظ حالة الاتصال على هذا الجهاز. سيتم تفعيل تسجيل الدخول الاجتماعي قريبًا.",
    "connected.linkPrompt": "أدخل البريد أو اسم المستخدم للحساب الذي تريد ربطه.",
    "connected.linkPlaceholderGoogle": "example@email.com",
    "connected.linkPlaceholderGithub": "username",
    "connected.invalidInput": "أدخل بريدًا أو اسم مستخدم صالحًا.",
    "connected.linkedOk": "تم ربط حساب {provider}.",
    "connected.unlinkedOk": "تم إلغاء ربط {provider}.",
  },
};

type LanguageContextType = {
  language: AppLanguage;
  languageLabel: string;
  setLanguage: (lang: AppLanguage | string) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  languageOptions: { code: AppLanguage; label: string }[];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function normalizeLanguage(value?: string | null): AppLanguage {
  if (!value) return "tr";
  return LABEL_TO_CODE[value] || "tr";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("tr");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      setLanguageState(normalizeLanguage(saved));
    });
  }, []);

  const setLanguage = async (lang: AppLanguage | string) => {
    const next = normalizeLanguage(String(lang));
    setLanguageState(next);
    await AsyncStorage.setItem(STORAGE_KEY, LANGUAGE_LABELS[next]);

    const shouldBeRTL = next === "ar";
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  };

  const value = useMemo(() => {
    const t = (key: string, vars?: Record<string, string | number>) => {
      const template = translations[language][key] || translations.tr[key] || key;
      if (!vars) return template;
      return Object.keys(vars).reduce(
        (acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k])),
        template
      );
    };

    return {
      language,
      languageLabel: LANGUAGE_LABELS[language],
      setLanguage,
      t,
      languageOptions: [
        { code: "tr" as const, label: LANGUAGE_LABELS.tr },
        { code: "en" as const, label: LANGUAGE_LABELS.en },
        { code: "ar" as const, label: LANGUAGE_LABELS.ar },
      ],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
