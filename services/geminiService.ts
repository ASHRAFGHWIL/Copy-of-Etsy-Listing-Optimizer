
import { GoogleGenAI, Type } from "@google/genai";
import { ListingData } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume it's set.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
  process.env.API_KEY = "YOUR_API_KEY_HERE"; 
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const listingSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A compelling, SEO-friendly title. Max 140 characters. Must include at least 4 of the generated keywords.",
    },
    description: {
      type: Type.STRING,
      description: "A persuasive and readable product description. Max 500 characters. Must naturally integrate all 13 generated keywords.",
    },
    keywords: {
      type: Type.ARRAY,
      description: "An array of 13 high-value SEO keywords. Each keyword must be 2-3 words long and max 20 characters.",
      items: { type: Type.STRING },
    },
    category: {
      type: Type.STRING,
      description: "The single most appropriate Etsy category for this product.",
    },
    materials: {
      type: Type.ARRAY,
      description: "An array of 13 potential materials for the product.",
      items: { type: Type.STRING },
    },
  },
  required: ["title", "description", "keywords", "category", "materials"],
};

export const generateListing = async (productDescription: string): Promise<ListingData> => {
  try {
    const prompt = `
      You are an expert SEO and marketing specialist for Etsy, focusing on the US market. Your task is to generate a complete, optimized product listing based on a user-provided product description.

      Analyze the following product description:
      "${productDescription}"

      Based on this description, generate a JSON object that strictly adheres to the provided schema. Ensure all constraints are met:
      - Title: Max 140 characters, uses at least 4 generated keywords.
      - Description: Max 500 characters, uses all 13 generated keywords naturally.
      - Keywords: Exactly 13 keywords. Each is 2-3 words and max 20 chars (including spaces).
      - Category: The single best-fit Etsy category.
      - Materials: Exactly 13 relevant materials.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: listingSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    // Basic validation to ensure the structure is as expected
    if (
      !parsedData.title || 
      !parsedData.description || 
      !Array.isArray(parsedData.keywords) || 
      !parsedData.category || 
      !Array.isArray(parsedData.materials)
    ) {
      throw new Error("Received malformed data from API.");
    }

    return parsedData as ListingData;

  } catch (error) {
    console.error("Error generating listing:", error);
    throw new Error("Failed to generate listing data. Please check your API key and try again.");
  }
};
