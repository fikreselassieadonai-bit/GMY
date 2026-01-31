
import { GoogleGenAI, Type } from "@google/genai";
import { AIMetadata } from "../types";

export const analyzeAudioWithAI = async (fileName: string, fileSize: number): Promise<AIMetadata> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given an audio file named "${fileName}" with a size of ${fileSize} bytes, predict the possible music metadata.
      Be creative but logical based on the filename.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            genre: { type: Type.STRING },
            mood: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["suggestedTitle", "genre", "mood", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as AIMetadata;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      suggestedTitle: fileName.replace(/\.[^/.]+$/, ""),
      genre: "Unknown",
      mood: "Unknown",
      description: "Analysis failed, but you can still convert the file."
    };
  }
};
