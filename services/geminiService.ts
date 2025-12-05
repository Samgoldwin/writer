import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CorrectionResponse, ToneOption } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    correctedText: {
      type: Type.STRING,
      description: "The fully corrected text with all grammar, spelling, punctuation, and style errors fixed. Preserve the original meaning."
    },
    changesSummary: {
      type: Type.STRING,
      description: "A concise bulleted list (using markdown) explaining the key grammatical and stylistic changes made. Focus on the 'why'."
    },
    tone: {
      type: Type.STRING,
      description: "The detected or applied tone of the text."
    }
  },
  required: ["correctedText", "changesSummary", "tone"]
};

export const correctText = async (text: string, tone: ToneOption): Promise<CorrectionResponse> => {
  if (!text.trim()) {
    throw new Error("Input text cannot be empty");
  }

  const prompt = `
    Analyze and correct the following text.
    Target Tone: ${tone}.
    
    Task:
    1. Fix all grammatical, spelling, and punctuation errors.
    2. Improve sentence structure and flow without changing the core meaning.
    3. Ensure the tone matches the requested '${tone}' style.
    4. Provide a summary of changes.

    Input Text:
    """
    ${text}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert copy editor and linguist. Your goal is to elevate the user's writing to a native, professional standard while strictly preserving their intent.",
        temperature: 0.3, // Low temperature for deterministic corrections
      }
    });

    const resultText = response.text;
    if (!resultText) {
       throw new Error("No response from AI");
    }

    return JSON.parse(resultText) as CorrectionResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
