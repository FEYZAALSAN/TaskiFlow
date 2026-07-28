const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const getAIChatResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error("HATA: API Key bulunamadı!");
      return res.status(500).json({ error: "API Key yapılandırması eksik." });
    }

    console.log("Gemini'ye giden mesaj:", message);

    const result = await model.generateContent(message || "Merhaba");
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Yanıtı Başarılı!");

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("--- DETAYLI GEMINI HATASI ---");
    console.error(error);
    res.status(500).json({
      error: "AI yanıt veremedi.",
      details: error.message,
    });
  }
};

module.exports = { getAIChatResponse };