import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

type FileType = "PDF" | "Excel" | "Sunu" | "Word" | "Görsel";

type FileItem = {
  id: string;
  title: string;
  type: FileType;
  size: string;
  project: string;
  updatedAt: string;
  owner: string;
};

const SAMPLE_FILES: FileItem[] = [
  {
    id: "1",
    title: "Q1 2024 Report",
    type: "PDF",
    size: "2.4 MB",
    project: "Rapor",
    updatedAt: "2 saat önce",
    owner: "Finans",
  },
  {
    id: "2",
    title: "Proje Planı",
    type: "Excel",
    size: "1.1 MB",
    project: "Proje",
    updatedAt: "1 gün önce",
    owner: "Operasyon",
  },
  {
    id: "3",
    title: "Sunum Taslağı",
    type: "Sunu",
    size: "5.0 MB",
    project: "Sunum",
    updatedAt: "3 gün önce",
    owner: "Yönetim",
  },
  {
    id: "4",
    title: "Sözleşme v2",
    type: "Word",
    size: "340 KB",
    project: "Hukuk",
    updatedAt: "1 hafta önce",
    owner: "Legal",
  },
  {
    id: "5",
    title: "Logo Görselleri",
    type: "Görsel",
    size: "1.2 MB",
    project: "Tasarım",
    updatedAt: "2 hafta önce",
    owner: "Design",
  },
  {
    id: "6",
    title: "Bütçe Tablosu",
    type: "Excel",
    size: "920 KB",
    project: "Bütçe",
    updatedAt: "1 gün önce",
    owner: "Finans",
  },
];

export default function DocumentsScreen() {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SAMPLE_FILES;

    return SAMPLE_FILES.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.project.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCardPress = (id: string) => {
    setActiveCardId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>Documents</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
          Dosyaları görüntüle, seç ve daha sonra istediğin yere bağla.
        </Text>

        {/* Search + filters */}
        <View style={styles.topBar}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <MaterialIcons name="search" size={20} color={colors.placeholder} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Belge ara..."
              placeholderTextColor={colors.placeholder}
              style={[styles.searchInput, { color: colors.inputText }]}
            />
          </View>

          <Pressable style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Tümü</Text>
          </Pressable>

          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialIcons name="grid-view" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Upload area */}
        <Pressable
          style={[
            styles.uploadBox,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? colors.border : "#BFDBFE",
            },
          ]}
        >
          <View
            style={[
              styles.uploadIconWrapper,
              { backgroundColor: isDark ? colors.cardLight : "#EFF6FF" },
            ]}
          >
            <MaterialIcons name="cloud-upload" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.uploadTitle, { color: colors.text }]}>
            Dosyaları buraya sürükleyin veya seçin
          </Text>
          <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
            PDF, Word, Excel, Sunu, Görseller desteklenir
          </Text>
        </Pressable>

        {/* Cards */}
        <View style={styles.grid}>
          {filteredFiles.map((item) => {
            const isActive = activeCardId === item.id;
            const fileMeta = getFileMeta(item.type, isDark);

            return (
              <View key={item.id} style={styles.cardWrapper}>
                <Pressable
                  onPress={() => handleCardPress(item.id)}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    isActive && {
                      borderColor: colors.primary,
                      backgroundColor: isDark ? colors.cardLight : "#F8FBFF",
                    },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.fileIconBox,
                        { backgroundColor: fileMeta.softColor },
                      ]}
                    >
                      <MaterialIcons
                        name={fileMeta.icon}
                        size={20}
                        color={fileMeta.color}
                      />
                    </View>

                    <Pressable
                      style={styles.moreButton}
                      onPress={() => handleCardPress(item.id)}
                    >
                      <MaterialIcons name="more-horiz" size={20} color={colors.textSecondary} />
                    </Pressable>
                  </View>

                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={[styles.cardType, { color: colors.textSecondary }]}>
                    {item.type} • {item.size}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.cardProject, { color: colors.placeholder }]}>
                      {item.project}
                    </Text>
                    <View style={styles.statusDot} />
                  </View>
                </Pressable>

                {isActive && (
                  <View
                    style={[
                      styles.expandedPanel,
                      {
                        backgroundColor: colors.card,
                        borderColor: isDark ? colors.border : "#DBEAFE",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.expandedRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>
                        Dosya adı
                      </Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>
                        {item.title}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.expandedRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>
                        Tür
                      </Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>
                        {item.type}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.expandedRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>
                        Boyut
                      </Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>
                        {item.size}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.expandedRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>
                        Sahibi
                      </Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>
                        {item.owner}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.expandedRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>
                        Güncelleme
                      </Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>
                        {item.updatedAt}
                      </Text>
                    </View>

                    <View style={styles.actionRow}>
                      <Pressable style={styles.primaryAction}>
                        <MaterialIcons name="visibility" size={18} color="#FFFFFF" />
                        <Text style={styles.primaryActionText}>Aç</Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.secondaryAction,
                          {
                            backgroundColor: colors.trackBg,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <MaterialIcons name="download" size={18} color={colors.textSecondary} />
                        <Text style={[styles.secondaryActionText, { color: colors.text }]}>
                          İndir
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.secondaryAction,
                          {
                            backgroundColor: colors.trackBg,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <MaterialIcons name="share" size={18} color={colors.textSecondary} />
                        <Text style={[styles.secondaryActionText, { color: colors.text }]}>
                          Paylaş
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getFileMeta(type: FileType, isDark: boolean) {
  switch (type) {
    case "PDF":
      return {
        icon: "picture-as-pdf" as const,
        color: "#EF4444",
        softColor: "#FEE2E2",
      };
    case "Excel":
      return {
        icon: "table-chart" as const,
        color: "#22C55E",
        softColor: "#DCFCE7",
      };
    case "Sunu":
      return {
        icon: "slideshow" as const,
        color: "#F59E0B",
        softColor: "#FEF3C7",
      };
    case "Word":
      return {
        icon: "description" as const,
        color: "#3B82F6",
        softColor: "#DBEAFE",
      };
    case "Görsel":
      return {
        icon: "image" as const,
        color: "#A855F7",
        softColor: "#F3E8FF",
      };
    default:
      return {
        icon: "insert-drive-file" as const,
        color: isDark ? "#94A3B8" : "#64748B",
        softColor: isDark ? "#1E293B" : "#E2E8F0",
      };
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    marginBottom: 18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filterButton: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  uploadBox: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  uploadIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
  grid: {
    gap: 14,
  },
  cardWrapper: {
    width: "100%",
  },
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "700",
  },
  cardType: {
    marginTop: 6,
    fontSize: 13,
  },
  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardProject: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FACC15",
  },
  expandedPanel: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  expandedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  expandedLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  expandedValue: {
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "58%",
    textAlign: "right",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 6,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    fontWeight: "700",
    marginLeft: 6,
  },
});
