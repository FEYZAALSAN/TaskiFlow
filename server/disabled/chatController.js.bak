const { sendMessage } = require("../services/geminiService");

exports.chat = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id || req.user.userId;

  if (!message) {
    return res.status(400).json({ error: "Mesaj boş olamaz." });
  }

  try {
    const reply = await sendMessage(message, userId);
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat hatası:", error);
    res.status(500).json({ error: "Yapay zeka yanıt veremedi." });
  }
};