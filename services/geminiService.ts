import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePostEnhancement = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, engaging social media post about: "${topic}". Include 2-3 relevant hashtags. Keep it under 280 characters.`,
    });
    return response.text || '';
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate content. Please try again.";
  }
};

export const generateClanDescription = async (name: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a catchy, 1-sentence description for a social group called "${name}".`,
    });
    return response.text || '';
  } catch (error) {
    return ""; // Return empty string on failure so user can type manually
  }
};

export const analyzeContentForModeration = async (text: string): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Is the following text offensive, hate speech, or spam? Answer ONLY with "YES" or "NO". Text: "${text}"`,
    });
    const answer = response.text?.trim().toUpperCase();
    return answer === 'NO'; // Returns true if safe
  } catch (error) {
    return true; 
  }
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  try {
    // Map codes to names for better prompt understanding
    const langMap: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ja': 'Japanese',
        'ru': 'Russian'
    };
    const fullLang = langMap[targetLang] || targetLang;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text to ${fullLang}. Return ONLY the translated text, do not add any explanations or quotes. Text: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};
