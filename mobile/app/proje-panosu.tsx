import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable,
    TextInput, ImageBackground, Dimensions, Platform, Modal,
    ActivityIndicator, Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = Math.min(width * 0.78, 320);

const BACKGROUNDS = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000',
];
interface Task {
    id: string;
    title: string;
    priority: string;
    dueDate?: string;
    description?: string;
    isCompleted: boolean;
    assignee?: { name: string; email: string };
    columnId: string;
}

interface Column {
    id: string;
    name?: string;
    title?: string;
    tasks: Task[];
}

interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function ProjePanosuScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const { projectId, showRapor: showRaporParam } = useLocalSearchParams<{ projectId: string; showRapor?: string }>();
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);
    const [bgIndex, setBgIndex] = useState(0);
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [showRapor, setShowRapor] = useState(showRaporParam === "true");
    const [projectTitle, setProjectTitle] = useState("Proje Panosu");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("HEPSİ");
    const [members, setMembers] = useState<Member[]>([]);
    const [orgId, setOrgId] = useState<string | null>(null);

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [activeColumnId, setActiveColumnId] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [newPriority, setNewPriority] = useState("ORTA");
    const [newDesc, setNewDesc] = useState("");
    const [addLoading, setAddLoading] = useState(false);

    const FILTERS = ["HEPSİ", "YÜKSEK", "ORTA", "DÜŞÜK"];
    const PRIORITIES = ["YÜKSEK", "ORTA", "DÜŞÜK"];

    useEffect(() => { loadOrgAndBoard(); }, []);

    const loadOrgAndBoard = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const orgRes = await fetch(`${API_URL}/organizations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const orgData = await orgRes.json();
            const org = Array.isArray(orgData) ? orgData[0] : orgData;
            if (org?.id) {
                setOrgId(org.id);
                const membersRes = await fetch(`${API_URL}/organizations/${org.id}/members`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const membersData = await membersRes.json();
                if (Array.isArray(membersData)) setMembers(membersData);
            }
        } catch (e) {
            console.log("Org/üye yükleme hatası:", e);
        }
        fetchBoard();
    };

    const fetchBoard = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_URL}/project/${projectId}/board`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.columns) {
                setColumns(data.columns);
                setProjectTitle(data.title || "Proje Panosu");
            }
        } catch (e) {
            console.log("Board yükleme hatası:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTitle.trim() || !selectedMember || !newDesc.trim()) {
            Alert.alert("Hata", "Tüm alanları doldurun ve bir kişi seçin.");
            return;
        }
        try {
            setAddLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_URL}/tasks/create/${projectId}/${activeColumnId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title: newTitle,
                    assigneeMail: selectedMember.email,
                    priority: newPriority,
                    date: new Date().toISOString(),
                    description: newDesc,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setAddModalVisible(false);
                setNewTitle(""); setSelectedMember(null); setNewDesc(""); setNewPriority("ORTA");
                fetchBoard();
            } else {
                Alert.alert("Hata", data.error || "Görev eklenemedi.");
            }
        } catch (e) {
            Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        } finally {
            setAddLoading(false);
        }
    };

   const handleComplete = async (task: Task) => {
    try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(`${API_URL}/tasks/${task.id}/complete`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: task.isCompleted ? "NONE" : "COMPLETED" }),
        });
        const data = await response.json();
        console.log("Complete status:", response.status);
        console.log("Complete response:", JSON.stringify(data));
        fetchBoard();
    } catch (e) {
        console.log("Complete hatası:", e);
        Alert.alert("Hata", "Durum güncellenemedi.");
    }
};

    const getColName = (col: Column) => col.name || col.title || "";
    const isCompletedColumn = (col: Column) => getColName(col).toLowerCase().includes("tamamland");
    const getPriorityColor = (p: string) => {
        if (p === "YÜKSEK") return "#EF4444";
        if (p === "ORTA") return "#F59E0B";
        return "#10B981";
    };

    const allTasks = columns.flatMap(c => c.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.isCompleted).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const filteredColumns = columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => {
            const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchFilter = activeFilter === "HEPSİ" || t.priority === activeFilter;
            return matchSearch && matchFilter;
        })
    }));

    return (
        <View style={styles.container}>
            <ImageBackground source={{ uri: BACKGROUNDS[bgIndex] }} style={styles.background}>
                <SafeAreaView style={styles.safe}>
                    <View style={styles.header}>
                        <View style={styles.headerRow1}>
                           <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/genel-bakis")} style={styles.backBtn}>
    <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
</Pressable>
<Text style={styles.headerTitle}>{projectTitle.toUpperCase()}</Text>
<View style={styles.headerActions}>
    {showRaporParam !== "true" && (
        <>
            <Pressable style={styles.actionBtn} onPress={() => setShowRapor(!showRapor)}>
                <MaterialIcons name="bar-chart" size={14} color="#2563EB" />
                <Text style={styles.actionBtnText}>RAPOR</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => setShowBgPicker(true)}>
                <MaterialIcons name="image" size={14} color={colors.textSecondary} />
                <Text style={styles.actionBtnText}>RESİM</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => router.push({ pathname: "/documents", params: { projectId: String(projectId) } })}>
                <MaterialIcons name="attach-file" size={14} color={colors.textSecondary} />
                <Text style={styles.actionBtnText}>BELGE</Text>
            </Pressable>
        </>
    )}
</View>
                        </View>

                        {showRaporParam !== "true" && (
                            <>
                                <View style={styles.searchBox}>
                                    <MaterialIcons name="search" size={18} color={colors.placeholder} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Görevlerde ara..."
                                        placeholderTextColor={colors.placeholder}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                                <View style={styles.filterGroup}>
                                    {FILTERS.map(f => (
                                        <Pressable
                                            key={f}
                                            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
                                            onPress={() => setActiveFilter(f)}
                                        >
                                            <Text style={[styles.filterBtnText, activeFilter === f && styles.filterBtnTextActive]}>{f}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>

                    <View style={styles.mainContent}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 60, flex: 1 }} />
                        ) : showRaporParam === "true" ? (
                            <ScrollView style={styles.raporPanelFullScreen} contentContainerStyle={{ paddingBottom: 40 }}>
                                <Text style={styles.raporTitle}>PROJE RAPORU</Text>
                                <View style={styles.raporCircleBox}>
                                    <View style={styles.raporCircle}>
                                        <Text style={styles.raporCirclePercent}>%{progress}</Text>
                                        <Text style={styles.raporCircleLabel}>Tamamlandı</Text>
                                    </View>
                                </View>
                                <View style={styles.raporProgressBg}>
                                    <View style={[styles.raporProgressFill, { width: `${progress}%` as any }]} />
                                </View>
                                <View style={styles.raporStats}>
                                    <View style={styles.raporStatItem}>
                                        <Text style={styles.raporStatNum}>{totalTasks}</Text>
                                        <Text style={styles.raporStatLabel}>Toplam</Text>
                                    </View>
                                    <View style={styles.raporStatItem}>
                                        <Text style={[styles.raporStatNum, { color: "#10B981" }]}>{completedTasks}</Text>
                                        <Text style={styles.raporStatLabel}>Bitti</Text>
                                    </View>
                                    <View style={styles.raporStatItem}>
                                        <Text style={[styles.raporStatNum, { color: "#F59E0B" }]}>{totalTasks - completedTasks}</Text>
                                        <Text style={styles.raporStatLabel}>Bekliyor</Text>
                                    </View>
                                </View>
                                {columns.map(col => (
                                    <View key={col.id} style={styles.raporColItem}>
                                        <Text style={styles.raporColName}>{getColName(col)}</Text>
                                        <Text style={styles.raporColCount}>{col.tasks.length}</Text>
                                    </View>
                                ))}
                                {members.length > 0 && (
                                    <>
                                        <Text style={[styles.raporTitle, { marginTop: 24, fontSize: 12 }]}>EKİP</Text>
                                        {members.map(m => (
                                            <View key={m.id} style={styles.raporMemberItem}>
                                                <View style={styles.raporMemberAvatar}>
                                                    <Text style={styles.raporMemberAvatarText}>{m.name?.charAt(0).toUpperCase()}</Text>
                                                </View>
                                                <Text style={styles.raporMemberName}>{m.name}</Text>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </ScrollView>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardScroll}>
                                {filteredColumns.map((col) => (
                                    <View key={col.id} style={[styles.column, showRapor && { width: width * 0.55 }]}>
                                        <View style={styles.columnHeader}>
                                            <Text style={styles.columnTitle}>{getColName(col).toUpperCase()}</Text>
                                            <View style={styles.countBadge}>
                                                <Text style={styles.countText}>{col.tasks.length}</Text>
                                            </View>
                                        </View>
                                        <ScrollView showsVerticalScrollIndicator={false} style={styles.taskList}>
                                            {col.tasks.map(task => (
                                                <View key={task.id} style={styles.taskCard}>
                                                    <View style={styles.taskCardTop}>
                                                        <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) }]}>
                                                            <Text style={styles.priorityTagText}>{task.priority}</Text>
                                                        </View>
                                                        {!isCompletedColumn(col) && (
                                                            <Pressable
                                                                style={[styles.checkbox, task.isCompleted && styles.checkboxDone]}
                                                                onPress={() => handleComplete(task)}
                                                            >
                                                                {task.isCompleted && <MaterialIcons name="check" size={14} color="#fff" />}
                                                            </Pressable>
                                                        )}
                                                    </View>
                                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                                    {task.description ? <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text> : null}
                                                    <View style={styles.taskFooter}>
                                                        {task.assignee && (
                                                            <View style={styles.assigneeRow}>
                                                                <View style={styles.miniAvatar}>
                                                                    <Text style={styles.miniAvatarText}>
                                                                        {task.assignee.name?.charAt(0).toUpperCase() || "?"}
                                                                    </Text>
                                                                </View>
                                                                <Text style={styles.assigneeName}>{task.assignee.name}</Text>
                                                            </View>
                                                        )}
                                                        {task.dueDate && (
                                                            <Text style={styles.taskDate}>
                                                                {new Date(task.dueDate).toLocaleDateString("tr-TR")}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                            ))}
                                            <Pressable
                                                style={styles.addCardBtn}
                                                onPress={() => { setActiveColumnId(col.id); setAddModalVisible(true); }}
                                            >
                                                <Text style={styles.addCardText}>+ YENİ GÖREV</Text>
                                            </Pressable>
                                        </ScrollView>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        {showRapor && showRaporParam !== "true" && (
                            <View style={styles.raporPanel}>
                                <Text style={styles.raporTitle}>PROJE RAPORU</Text>
                                <View style={styles.raporCircleBox}>
                                    <View style={styles.raporCircle}>
                                        <Text style={styles.raporCirclePercent}>%{progress}</Text>
                                        <Text style={styles.raporCircleLabel}>Tamamlandı</Text>
                                    </View>
                                </View>
                                <View style={styles.raporProgressBg}>
                                    <View style={[styles.raporProgressFill, { width: `${progress}%` as any }]} />
                                </View>
                                <View style={styles.raporStats}>
                                    <View style={styles.raporStatItem}>
                                        <Text style={styles.raporStatNum}>{totalTasks}</Text>
                                        <Text style={styles.raporStatLabel}>Toplam</Text>
                                    </View>
                                    <View style={styles.raporStatItem}>
                                        <Text style={[styles.raporStatNum, { color: "#10B981" }]}>{completedTasks}</Text>
                                        <Text style={styles.raporStatLabel}>Bitti</Text>
                                    </View>
                                    <View style={styles.raporStatItem}>
                                        <Text style={[styles.raporStatNum, { color: "#F59E0B" }]}>{totalTasks - completedTasks}</Text>
                                        <Text style={styles.raporStatLabel}>Bekliyor</Text>
                                    </View>
                                </View>
                                {columns.map(col => (
                                    <View key={col.id} style={styles.raporColItem}>
                                        <Text style={styles.raporColName}>{getColName(col)}</Text>
                                        <Text style={styles.raporColCount}>{col.tasks.length}</Text>
                                    </View>
                                ))}
                                {members.length > 0 && (
                                    <>
                                        <Text style={[styles.raporTitle, { marginTop: 16, fontSize: 10 }]}>EKİP</Text>
                                        {members.map(m => (
                                            <View key={m.id} style={styles.raporMemberItem}>
                                                <View style={styles.raporMemberAvatar}>
                                                    <Text style={styles.raporMemberAvatarText}>{m.name?.charAt(0).toUpperCase()}</Text>
                                                </View>
                                                <Text style={styles.raporMemberName} numberOfLines={1}>{m.name}</Text>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </ImageBackground>

            <Modal visible={showBgPicker} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.bgPickerModal}>
                        <Text style={styles.bgPickerTitle}>Arka Plan Seç</Text>
                        <View style={styles.bgPickerRow}>
                            {BACKGROUNDS.map((bg, i) => (
                                <Pressable key={i} style={[styles.bgThumb, bgIndex === i && styles.bgThumbActive]} onPress={() => { setBgIndex(i); setShowBgPicker(false); }}>
                                    <ImageBackground source={{ uri: bg }} style={styles.bgThumbImg} imageStyle={{ borderRadius: 12 }}>
                                        {bgIndex === i && (
                                            <View style={styles.bgThumbCheck}>
                                                <MaterialIcons name="check" size={16} color="#fff" />
                                            </View>
                                        )}
                                    </ImageBackground>
                                </Pressable>
                            ))}
                        </View>
                        <Pressable onPress={() => setShowBgPicker(false)} style={styles.bgPickerClose}>
                            <Text style={styles.bgPickerCloseText}>Kapat</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal visible={addModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.addModal}>
                        <View style={styles.addModalHeader}>
                            <Text style={styles.addModalTitle}>Yeni Görev</Text>
                            <Pressable onPress={() => setAddModalVisible(false)}>
                                <MaterialIcons name="close" size={22} color={colors.text} />
                            </Pressable>
                        </View>
                        <Text style={styles.addLabel}>GÖREV ADI</Text>
                        <TextInput style={styles.addInput} value={newTitle} onChangeText={setNewTitle} placeholder="Görev başlığı..." placeholderTextColor={colors.placeholder} />
                        <Text style={styles.addLabel}>ATANAN KİŞİ</Text>
                        {members.length === 0 ? (
                            <Text style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 8 }}>Ekip üyesi bulunamadı.</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                <View style={styles.membersSelectRow}>
                                    {members.map(m => (
                                        <Pressable
                                            key={m.id}
                                            style={[styles.memberChip, selectedMember?.id === m.id && styles.memberChipActive]}
                                            onPress={() => setSelectedMember(m)}
                                        >
                                            <View style={[styles.memberChipAvatar, selectedMember?.id === m.id && { backgroundColor: "#fff" }]}>
                                                <Text style={[styles.memberChipAvatarText, selectedMember?.id === m.id && { color: "#2563EB" }]}>
                                                    {m.name?.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <Text style={[styles.memberChipName, selectedMember?.id === m.id && { color: "#fff" }]}>{m.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                        <Text style={styles.addLabel}>ÖNCELİK</Text>
                        <View style={styles.priorityRow}>
                            {PRIORITIES.map(p => (
                                <Pressable
                                    key={p}
                                    style={[styles.priorityChip, newPriority === p && { backgroundColor: getPriorityColor(p) }]}
                                    onPress={() => setNewPriority(p)}
                                >
                                    <Text style={[styles.priorityChipText, newPriority === p && { color: "#fff" }]}>{p}</Text>
                                </Pressable>
                            ))}
                        </View>
                        <Text style={styles.addLabel}>AÇIKLAMA</Text>
                        <TextInput style={[styles.addInput, { height: 80 }]} value={newDesc} onChangeText={setNewDesc} placeholder="Görev açıklaması..." placeholderTextColor={colors.placeholder} multiline textAlignVertical="top" />
                        <Pressable style={styles.addSubmitBtn} onPress={handleAddTask} disabled={addLoading}>
                            {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addSubmitText}>Görevi Ekle</Text>}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (colors: Record<string, string>, isDark: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    background: { flex: 1 },
    safe: { flex: 1, backgroundColor: isDark ? 'rgba(11,18,31,0.78)' : 'rgba(255,255,255,0.35)' },
    header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, backgroundColor: isDark ? 'rgba(11,18,31,0.94)' : 'rgba(255,255,255,0.88)', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12 },
    headerRow1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
 backBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '900', color: colors.text, letterSpacing: 1, flex: 1, textAlign: 'center' },
    headerActions: { flexDirection: 'row', gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.cardLight, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
    actionBtnText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
   raporBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
raporBtnText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
resimBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
resimBtnText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 12, paddingHorizontal: 12, height: 40, marginBottom: 10, borderWidth: 1, borderColor: colors.inputBorder },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: colors.inputText },
    filterGroup: { flexDirection: 'row', backgroundColor: colors.trackBg, borderRadius: 20, padding: 4, alignSelf: 'flex-start' },
    filterBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
    filterBtnActive: { backgroundColor: colors.card, elevation: 1 },
    filterBtnText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
    filterBtnTextActive: { color: '#6366F1' },
    mainContent: { flex: 1, flexDirection: 'row' },
    boardScroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
    column: { width: COLUMN_WIDTH, backgroundColor: isDark ? 'rgba(23,34,55,0.92)' : 'rgba(255,255,255,0.75)', borderRadius: 24, padding: 16, marginRight: 16, maxHeight: '92%' },
    columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    columnTitle: { fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
    countBadge: { backgroundColor: colors.cardLight, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    countText: { fontSize: 10, fontWeight: '800', color: '#6366F1' },
    taskList: { flex: 1 },
    taskCard: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    taskCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    priorityTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    priorityTagText: { color: '#fff', fontSize: 9, fontWeight: '900' },
    checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    checkboxDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
    taskTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 4 },
    taskDesc: { fontSize: 11, color: colors.textSecondary, marginBottom: 10 },
    taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    miniAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
    miniAvatarText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    assigneeName: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
    taskDate: { fontSize: 10, color: colors.textSecondary },
    addCardBtn: { borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    addCardText: { fontSize: 12, fontWeight: '800', color: colors.textSecondary },
    raporPanelFullScreen: { flex: 1, padding: 24, backgroundColor: isDark ? 'rgba(11,18,31,0.94)' : 'rgba(255,255,255,0.92)' },
    raporPanel: { width: 160, backgroundColor: isDark ? 'rgba(11,18,31,0.94)' : 'rgba(255,255,255,0.92)', padding: 14, borderLeftWidth: 1, borderLeftColor: colors.border },
    raporTitle: { fontSize: 11, fontWeight: '900', color: colors.text, letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
    raporCircleBox: { alignItems: 'center', marginBottom: 12 },
    raporCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#EEF2FF', borderWidth: 6, borderColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
    raporCirclePercent: { fontSize: 20, fontWeight: '900', color: '#2563EB' },
    raporCircleLabel: { fontSize: 8, color: colors.textSecondary, fontWeight: '600' },
    raporProgressBg: { height: 6, backgroundColor: colors.trackBg, borderRadius: 3, overflow: 'hidden', marginBottom: 16 },
    raporProgressFill: { height: 6, backgroundColor: '#2563EB', borderRadius: 3 },
    raporStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    raporStatItem: { alignItems: 'center' },
    raporStatNum: { fontSize: 18, fontWeight: '900', color: colors.text },
    raporStatLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: '600' },
    raporColItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
    raporColName: { fontSize: 10, fontWeight: '700', color: colors.text },
    raporColCount: { fontSize: 10, fontWeight: '900', color: '#6366F1' },
    raporMemberItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
    raporMemberAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
    raporMemberAvatarText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    raporMemberName: { fontSize: 10, color: colors.text, fontWeight: '600', flex: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    bgPickerModal: { backgroundColor: colors.modalBg, borderRadius: 24, padding: 24, width: '100%' },
    bgPickerTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 16, textAlign: 'center' },
    bgPickerRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 16 },
    bgThumb: { width: 80, height: 80, borderRadius: 14, overflow: 'hidden', borderWidth: 3, borderColor: 'transparent' },
    bgThumbActive: { borderColor: '#2563EB' },
    bgThumbImg: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    bgThumbCheck: { backgroundColor: 'rgba(37,99,235,0.7)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    bgPickerClose: { alignItems: 'center', paddingVertical: 10 },
    bgPickerCloseText: { color: colors.textSecondary, fontWeight: '700' },
    addModal: { backgroundColor: colors.modalBg, borderRadius: 24, padding: 24, width: '100%', maxHeight: '90%' },
    addModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    addModalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
    addLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, marginTop: 12, letterSpacing: 0.5 },
    addInput: { height: 46, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: colors.inputText },
    membersSelectRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
    memberChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.trackBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
    memberChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    memberChipAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
    memberChipAvatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    memberChipName: { fontSize: 13, fontWeight: '600', color: colors.text },
    priorityRow: { flexDirection: 'row', gap: 8 },
    priorityChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
    priorityChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    addSubmitBtn: { backgroundColor: '#2563EB', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    addSubmitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
