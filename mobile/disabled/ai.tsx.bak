import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import { API_URL } from "@/constants/api";

const PROJECT_CONTEXT = {
  name: "PROJ-Alpha", sprint: "Sprint 7", totalTasks: 16, done: 7,
  inProgress: 4, todo: 3, blocked: 2,
  teamMembers: ["Ahmet K.", "Zeynep M.", "Burak T.", "Selin A."],
  velocity: { last: 52, avg: 58, target: 80 },
  blockedTasks: [{ name: "Rapor export özelliği", age: 14, assignee: "Zeynep M." }],
  highPriorityTodo: [{ name: "Email bildirim sistemi", assignee: "Ahmet K.", sp: 8 }],
};

const ANALYSIS_CARDS = [
  { id: "risk", title: "Risk Tespiti", icon: "warning" as const, color: "#EF4444", bg: "#FEE2E2", prompt: `Risk analizi yap, kısa Türkçe öneriler (max 4 madde):\n${JSON.stringify(PROJECT_CONTEXT)}` },
  { id: "priority", title: "Görev Önceliklendirme", icon: "format-list-bulleted" as const, color: "#2563EB", bg: "#EEF2FF", prompt: `Hangi görevlere öncelik verilmeli? Kısa Türkçe (max 4 madde):\n${JSON.stringify(PROJECT_CONTEXT)}` },
  { id: "team", title: "Takım Performansı", icon: "people" as const, color: "#10B981", bg: "#D1FAE5", prompt: `Takım performansını analiz et, kısa Türkçe (max 4 madde):\n${JSON.stringify(PROJECT_CONTEXT)}` },
];

type Message = { role: "user" | "assistant"; content: string };
type Analysis = { id: string; content: string; loading: boolean };

export default function AIScreen() {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: `Merhaba! Ben TaskiFlow AI asistanınım. **${PROJECT_CONTEXT.name}** projeniz hakkında sorularınızı yanıtlayabilirim.` }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); }, [messages]);

  const callBackend = async (message: string, history: Message[]): Promise<string> => {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message, history, projectContext: PROJECT_CONTEXT }),
    });
    if (!response.ok) throw new Error(`Sunucu hatası: ${response.status}`);
    const data = await response.json();
    return data.reply || "Boş yanıt döndü.";
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const reply = await callBackend(userMsg, messages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages([...newMessages, { role: "assistant", content: `Hata: ${err.message}` }]);
    } finally { setIsLoading(false); }
  };

  const runAnalysis = async (card: typeof ANALYSIS_CARDS[0]) => {
    setAnalyses(prev => {
      const exists = prev.find(a => a.id === card.id);
      if (exists) return prev.map(a => a.id === card.id ? { ...a, loading: true } : a);
      return [...prev, { id: card.id, content: "", loading: true }];
    });
    setExpandedCard(card.id);
    try {
      const reply = await callBackend(card.prompt, []);
      setAnalyses(prev => prev.map(a => a.id === card.id ? { ...a, content: reply, loading: false } : a));
    } catch (err: any) {
      setAnalyses(prev => prev.map(a => a.id === card.id ? { ...a, content: `Hata: ${err.message}`, loading: false } : a));
    }
  };

  const getAnalysis = (id: string) => analyses.find(a => a.id === id);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
          <View style={styles.headerLeft}>
            <View style={styles.botIcon}><MaterialIcons name="auto-awesome" size={18} color="#fff" /></View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>TaskiFlow AI</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Proje asistanı · {PROJECT_CONTEXT.name}</Text>
            </View>
          </View>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Aktif</Text>
          </View>
        </View>

        <Pressable style={[styles.toggleBar, { backgroundColor: colors.cardLight, borderBottomColor: colors.border }]} onPress={() => setShowAnalysis(!showAnalysis)}>
          <MaterialIcons name="analytics" size={16} color="#2563EB" />
          <Text style={styles.toggleText}>AI Analizleri & Proje Özeti</Text>
          <MaterialIcons name={showAnalysis ? "expand-less" : "expand-more"} size={20} color="#2563EB" />
        </Pressable>

        {showAnalysis && (
          <ScrollView style={[styles.analysisPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]} nestedScrollEnabled>
            <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>📊 Proje Özeti</Text>
              <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Sprint</Text><Text style={[styles.summaryVal, { color: colors.text }]}>{PROJECT_CONTEXT.sprint}</Text></View>
              <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tamamlanan</Text><Text style={[styles.summaryVal, { color: "#10B981" }]}>{PROJECT_CONTEXT.done}/{PROJECT_CONTEXT.totalTasks}</Text></View>
              <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Bloke</Text><Text style={[styles.summaryVal, { color: "#EF4444" }]}>{PROJECT_CONTEXT.blocked}</Text></View>
              <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Velocity</Text><Text style={[styles.summaryVal, { color: "#2563EB" }]}>{PROJECT_CONTEXT.velocity.last} SP</Text></View>
            </View>

            {ANALYSIS_CARDS.map(card => {
              const analysis = getAnalysis(card.id);
              const isExpanded = expandedCard === card.id;
              return (
                <View key={card.id} style={[styles.analysisCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Pressable style={styles.analysisCardHeader} onPress={() => analysis ? setExpandedCard(isExpanded ? null : card.id) : runAnalysis(card)}>
                    <View style={[styles.analysisIcon, { backgroundColor: isDark ? colors.cardLight : card.bg }]}>
                      <MaterialIcons name={card.icon} size={18} color={card.color} />
                    </View>
                    <Text style={[styles.analysisTitle, { color: colors.text }]}>{card.title}</Text>
                    {!analysis
                      ? <View style={[styles.runBadge, { backgroundColor: colors.cardLight }]}><Text style={styles.runBadgeText}>Çalıştır</Text></View>
                      : <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={20} color={colors.textSecondary} />
                    }
                  </Pressable>
                  {isExpanded && analysis && (
                    <View style={styles.analysisResult}>
                      {analysis.loading ? <ActivityIndicator size="small" color="#2563EB" /> : <Text style={[styles.analysisText, { color: colors.textSecondary }]}>{analysis.content}</Text>}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}

        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
          {messages.map((msg, i) => (
            <View key={i} style={[styles.msgRow, msg.role === "user" && styles.msgRowUser]}>
              <View style={[styles.msgAvatar, msg.role === "user" && styles.msgAvatarUser]}>
                <MaterialIcons name={msg.role === "assistant" ? "auto-awesome" : "person"} size={14} color="#fff" />
              </View>
              <View style={[styles.msgBubble, msg.role === "assistant" && { backgroundColor: colors.card, borderColor: colors.border }, msg.role === "user" && styles.msgBubbleUser]}>
                <Text style={[styles.msgText, { color: colors.text }, msg.role === "user" && styles.msgTextUser]}>{msg.content}</Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={styles.msgRow}>
              <View style={styles.msgAvatar}><MaterialIcons name="auto-awesome" size={14} color="#fff" /></View>
              <View style={[styles.msgBubble, { backgroundColor: colors.card, borderColor: colors.border }]}><ActivityIndicator size="small" color="#2563EB" /></View>
            </View>
          )}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {["Sprint'i tamamlayabilir miyiz?", "En riskli görev hangisi?", "Takım iş yükü dengeli mi?"].map(q => (
            <Pressable key={q} style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setInput(q)}>
              <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.inputRow, { backgroundColor: colors.headerBg, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={input} onChangeText={setInput}
            placeholder="Projeniz hakkında bir şey sorun..." placeholderTextColor={colors.placeholder}
            multiline onSubmitEditing={sendMessage}
          />
          <Pressable style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || isLoading}>
            <MaterialIcons name="send" size={18} color="#fff" />
          </Pressable>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  botIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  headerSub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
  activeText: { fontSize: 12, fontWeight: "600", color: "#10B981" },
  toggleBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#EEF2FF", borderBottomWidth: 1, borderBottomColor: "#E0E7FF" },
  toggleText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#2563EB" },
  analysisPanel: { maxHeight: 320, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  summaryCard: { margin: 12, padding: 14, backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontSize: 12, color: "#6B7280" },
  summaryVal: { fontSize: 12, fontWeight: "700", color: "#111827" },
  analysisCard: { marginHorizontal: 12, marginBottom: 8, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden" },
  analysisCardHeader: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  analysisIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  analysisTitle: { flex: 1, fontSize: 13, fontWeight: "600", color: "#111827" },
  runBadge: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  runBadgeText: { fontSize: 11, fontWeight: "700", color: "#2563EB" },
  analysisResult: { paddingHorizontal: 12, paddingBottom: 12 },
  analysisText: { fontSize: 12, color: "#374151", lineHeight: 18 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  msgRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  msgRowUser: { flexDirection: "row-reverse" },
  msgAvatar: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  msgAvatarUser: { backgroundColor: "#6B7280" },
  msgBubble: { maxWidth: "75%", padding: 12, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  msgBubbleUser: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  msgText: { fontSize: 14, color: "#111827", lineHeight: 20 },
  msgTextUser: { color: "#fff" },
  quickRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "#fff", borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB" },
  quickChipText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  input: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: "#F9FAFB", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#111827" },
  sendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.4 },
});
