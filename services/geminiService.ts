
import { GoogleGenAI } from "@google/genai";

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Buat deskripsi singkat yang menarik untuk produk fashion dengan nama "${productName}" dalam kategori "${category}". Maksimal 2 kalimat. Gunakan bahasa Indonesia yang santai tapi profesional.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });
    return response.text?.trim() || "Deskripsi gagal dibuat.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gagal menghubungi AI.";
  }
};
