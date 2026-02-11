
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getEnrichedTranslation = async (word: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Дай перевод немецкого слова "${word}" на русский в контексте изучения языка.`,
    });
    return response.text || "Перевод не найден";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ошибка загрузки";
  }
};
