
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Flashcard } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const flashcardSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: 'The question or front side of the flashcard.'
      },
      answer: {
        type: Type.STRING,
        description: 'The answer or back side of the flashcard.'
      }
    },
    required: ['question', 'answer']
  }
};

export const geminiService = {
  askQuestion: async (
    question: string,
    sourceContent: string,
    useThinkingMode: boolean
  ): Promise<string> => {
    try {
      const model = useThinkingMode ? "gemini-2.5-pro" : "gemini-2.5-flash";
      const config = useThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
      
      const prompt = `Based on the following source material, answer the user's question.
      
      --- SOURCE MATERIAL ---
      ${sourceContent}
      --- END SOURCE MATERIAL ---
      
      USER QUESTION: ${question}`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        ... (useThinkingMode && { config })
      });
      
      return response.text;
    } catch (error) {
      console.error("Error asking question:", error);
      return "Sorry, I encountered an error while processing your question.";
    }
  },

  generateReport: async (sourceContent: string): Promise<string> => {
    try {
      const prompt = `Analyze the following source material and generate a comprehensive, well-structured report summarizing the key points, themes, and conclusions.
      
      --- SOURCE MATERIAL ---
      ${sourceContent}
      --- END SOURCE MATERIAL ---`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt
      });

      return response.text;
    } catch (error) {
      console.error("Error generating report:", error);
      return "Sorry, I encountered an error while generating the report.";
    }
  },

  generateFlashcards: async (sourceContent: string): Promise<Flashcard[]> => {
    try {
      const prompt = `Analyze the following source material and generate a set of flashcards covering the key concepts, definitions, and facts.
      
      --- SOURCE MATERIAL ---
      ${sourceContent}
      --- END SOURCE MATERIAL ---`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: flashcardSchema,
        }
      });
      
      const jsonText = response.text.trim();
      const parsedFlashcards = JSON.parse(jsonText);
      
      const flashcardsWithIds: Flashcard[] = parsedFlashcards.map((card: any, index: number) => ({
        ...card,
        id: `flashcard-${Date.now()}-${index}`
      }));

      return flashcardsWithIds;

    } catch (error) {
      console.error("Error generating flashcards:", error);
      return [];
    }
  },
};