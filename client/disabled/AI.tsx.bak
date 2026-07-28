import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Sparkles, Send, AlertTriangle, Users, ListTodo,
  RefreshCw, ChevronDown, ChevronUp, Bot, User
} from "lucide-react";

const PROJECT_CONTEXT = {
  name: "PROJ-Alpha",
  sprint: "Sprint 7",
  totalTasks: 16,
  done: 7,
  inProgress: 4,
  todo: 3,
  blocked: 2,
  teamMembers: ["Ahmet K.", "Zeynep M.", "Burak T.", "Selin A."],
  velocity: { last: 52, avg: 58, target: 80 },
  oldestTask: { name: "Kullanıcı onboarding akışı", age: 24 },
  blockedTasks: [
    { name: "Rapor export özelliği", age: 14, assignee: "Zeynep M." },
  ],
  highPriorityTodo: [
    { name: "Email bildirim sistemi", assignee: "Ahmet K.", sp: 8 },
  ],
};

const ANALYSIS_CARDS = [
  {
    id: "risk",
    title: "Risk Tespiti",
    icon: <AlertTriangle size={18} />,
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    prompt: `Aşağıdaki proje verilerine göre risk analizi yap ve kısa, net Türkçe öneriler sun (maksimum 4 madde, her biri 1-2 cümle):\nProje: ${JSON.stringify(PROJECT_CONTEXT)}\nÖzellikle bloke görevler, geciken işler ve sprint hedefine ulaşma ihtimali üzerine odaklan.`,
  },
  {
    id: "priority",
    title: "Görev Önceliklendirme",
    icon: <ListTodo size={18} />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    prompt: `Aşağıdaki proje verilerine göre hangi görevlere öncelik verilmeli? Kısa, net Türkçe öneriler sun (maksimum 4 madde):\nProje: ${JSON.stringify(PROJECT_CONTEXT)}\nSprint hedefine ulaşmak için en kritik görevleri ve neden öncelikli olduklarını belirt.`,
  },
  {
    id: "team",
    title: "Takım Performansı",
    icon: <Users size={18} />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    prompt: `Aşağıdaki proje verilerine göre takım performansını analiz et ve kısa, net Türkçe öneriler sun (maksimum 4 madde):\nProje: ${JSON.stringify(PROJECT_CONTEXT)}\nVelocity trendi, iş yükü dağılımı ve takımın güçlü/zayıf yönlerine odaklan.`,
  },
];

type Message = { role: "user" | "assistant"; content: string };
type AnalysisResult = { id: string; content: string; loading: boolean };

export default function AIPage() {
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Merhaba! Ben TaskiFlow AI asistanınım. **${PROJECT_CONTEXT.name}** projeniz hakkında sorularınızı yanıtlayabilirim.\n\nSoldan analiz kartlarını çalıştırabilir ya da bana doğrudan soru sorabilirsiniz.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Tek API çağrısı — her zaman kendi backend'imize gider ────────────────
const callBackend = async (message: string, history: Message[] = []): Promise<string> => {
  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, projectContext: PROJECT_CONTEXT }),
    });

    // Eğer backend 200 dönmediyse hatayı detaylıca yakala
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      // Backend'den gelen 'details' veya 'error' mesajını fırlat
      throw new Error(errData.details || errData.error || `Sunucu Hatası: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend'den gelen verinin içinde 'reply' olduğundan emin ol
    if (!data.reply) {
      console.error("Backend'den geçersiz veri geldi:", data);
      return "Sunucudan boş yanıt döndü.";
    }

    return data.reply;
  } catch (err: any) {
    console.error("Bağlantı Hatası:", err);
    throw err; // Bu hata yukarıdaki catch bloğuna (Hata: ...) gider
  }
};

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const reply = await callBackend(userMsg, messages);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Hata: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnalysis = (id: string) => analyses.find(a => a.id === id);

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"}`}>

      {/* SOL: Analiz Kartları */}
      <div className={`w-80 flex-shrink-0 border-r p-4 overflow-y-auto flex flex-col gap-4 ${darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white"}`}>

        {/* Proje Özeti */}
        <div className={`p-4 rounded-2xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-blue-500" />
            <span className="font-bold text-sm">Proje Özeti</span>
          </div>
          <div className="text-xs space-y-1.5 opacity-70">
            <div className="flex justify-between"><span>Proje</span><span className="font-semibold">{PROJECT_CONTEXT.name}</span></div>
            <div className="flex justify-between"><span>Sprint</span><span className="font-semibold">{PROJECT_CONTEXT.sprint}</span></div>
            <div className="flex justify-between"><span>Tamamlanan</span><span className="font-semibold text-emerald-500">{PROJECT_CONTEXT.done}/{PROJECT_CONTEXT.totalTasks}</span></div>
            <div className="flex justify-between"><span>Bloke</span><span className="font-semibold text-red-500">{PROJECT_CONTEXT.blocked}</span></div>
            <div className="flex justify-between"><span>Velocity</span><span className="font-semibold text-blue-500">{PROJECT_CONTEXT.velocity.last} SP</span></div>
          </div>
        </div>

        {/* Analiz Kartları */}
        <p className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">AI Analizleri</p>

        {ANALYSIS_CARDS.map(card => {
          const analysis = getAnalysis(card.id);
          const isExpanded = expandedCard === card.id;

          return (
            <div key={card.id} className={`rounded-2xl border overflow-hidden transition-all ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <button
                onClick={() => analysis ? setExpandedCard(isExpanded ? null : card.id) : runAnalysis(card)}
                className="w-full p-4 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.bgColor} ${card.color}`}>
                    {card.icon}
                  </div>
                  <span className="font-semibold text-sm">{card.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysis && !analysis.loading && (
                    <button onClick={(e) => { e.stopPropagation(); runAnalysis(card); }} className="opacity-40 hover:opacity-100 transition-opacity">
                      <RefreshCw size={13} />
                    </button>
                  )}
                  {analysis
                    ? (isExpanded ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40" />)
                    : <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Çalıştır</span>
                  }
                </div>
              </button>

              {isExpanded && analysis && (
                <div className="px-4 pb-4">
                  {analysis.loading ? (
                    <div className="flex items-center gap-2 text-xs opacity-50">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Analiz yapılıyor...
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed opacity-80 whitespace-pre-wrap">{analysis.content}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SAĞ: Sohbet */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center gap-3 ${darkMode ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-white"}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">TaskiFlow AI</div>
            <div className="text-xs opacity-40">Proje asistanı · {PROJECT_CONTEXT.name}</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-500">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Aktif
          </div>
        </div>

        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${msg.role === "assistant" ? "bg-blue-600" : "bg-gray-600"}`}>
                {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === "assistant"
                  ? darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200 shadow-sm"
                  : "bg-blue-600 text-white"
                }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className={`px-4 py-3 rounded-2xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Hızlı sorular */}
        <div className={`px-6 py-2 flex gap-2 flex-wrap border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
          {["Sprint'i tamamlayabilir miyiz?", "En riskli görev hangisi?", "Takım iş yükü dengeli mi?"].map(q => (
            <button key={q} onClick={() => setInput(q)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                ${darkMode ? "border-gray-700 hover:border-blue-500 hover:text-blue-400" : "border-gray-200 hover:border-blue-400 hover:text-blue-600"}`}>
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className={`px-6 py-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className={`flex gap-3 items-end p-3 rounded-2xl border transition-colors
            ${darkMode ? "bg-gray-800 border-gray-700 focus-within:border-blue-500" : "bg-white border-gray-200 focus-within:border-blue-400 shadow-sm"}`}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Projeniz hakkında bir şey sorun..."
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}