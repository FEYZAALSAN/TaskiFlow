const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genai.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

async function sendMessage(userMessage, userId, history = [], projectContext = null) {
  let taskContext = "Henüz görev yok.";

  if (userId) {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { title: true } },
        column: { select: { title: true } },
      },
    });

    if (tasks.length > 0) {
      taskContext = tasks.map(t => `
    - Görev: ${t.title}
    - Proje: ${t.project.title}
    - Durum: ${t.column.title}
    - Öncelik: ${t.priority}
    - Bitiş Tarihi: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString("tr-TR") : "Belirtilmemiş"}
    - Tamamlandı: ${t.isCompleted ? "Evet" : "Hayır"}
    - Açıklama: ${t.description || "Yok"}
      `).join("\n");
    }
  }

  const systemPrompt = `Sen TaskiFlow uygulamasının akıllı asistanısın.
Kullanıcının görevleri hakkında yardımcı olabilir, genel sorulara da cevap verebilirsin.

Kullanıcının mevcut görevleri:
${taskContext}

${projectContext ? `Proje bağlamı: ${JSON.stringify(projectContext)}` : ""}

Türkçe cevap ver. Samimi ve yardımcı ol.`;

  const chatHistory = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Anladım, TaskiFlow asistanı olarak yardımcı olmaya hazırım!" }] },
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

module.exports = { sendMessage };