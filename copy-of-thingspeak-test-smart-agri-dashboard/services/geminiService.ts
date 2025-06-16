

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CropInfoRequest, OptimalConditions, DataInsightRequest, CropRecommendation, LanguageCode, SoilMoistureStatusType, GeneralSensorStatus } from '../types'; // Added LanguageCode
import { LANGUAGES } from '../constants'; // To get full language names if needed

// Assuming translations for prompts are managed by the calling component or a translation service
// For simplicity, we'll append a language instruction directly here.
// A more robust solution might involve passing fully translated prompts or using a dedicated i18n library for prompt construction.

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Google AI is not set. AI features (Gemini, Imagen) will not work. Ensure the API_KEY environment variable is correctly configured.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
const IMAGE_MODEL = 'imagen-3.0-generate-002';

// Helper to get language instruction string
const getLanguageInstruction = (lang: LanguageCode, t: (key: string) => string): string => {
  return t(`gemini.languageInstruction.${lang}`);
};

const parseJsonFromText = <T,>(text: string, t: (key: string, replacements?: Record<string, string | number>) => string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  if (!jsonStr) { // Handle empty string case after potential stripping
    return null;
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Raw text:", text);
    return null; 
  }
};

const getDetailedErrorMessage = (error: unknown): string => {
    let detail = "An unknown error occurred.";
    const apiError = error as any; // Cast to any to check for nested properties

    if (apiError && apiError.error && typeof apiError.error.message === 'string') {
        detail = apiError.error.message; // Specifically captures the {error: {message: "..."}} structure
    } else if (error instanceof Error) {
        detail = error.message;
    } else if (typeof error === 'object' && error !== null && typeof (error as any).message === 'string') {
        detail = (error as any).message; // Catches errors that are objects with a direct 'message' property
    } else if (typeof error === 'string') {
        detail = error;
    }
    return detail;
};

export const getCropOptimalConditions = async (
    request: CropInfoRequest, 
    lang: LanguageCode,
    t: (key: string, replacements?: Record<string, string | number>) => string // Pass translation function
  ): Promise<OptimalConditions | string | null> => {
  if (!ai) return t('gemini.common.error.apiKeyMissing');

  const languageInstruction = getLanguageInstruction(lang, t);
  
  const basePrompt = t('gemini.cropOptimalConditions.prompt', { cropName: request.cropName });
  const fullPrompt = `${basePrompt}${languageInstruction}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const textResponse = response.text;
    const parsedJson = parseJsonFromText<OptimalConditions>(textResponse, t);

    if (parsedJson) {
      return parsedJson;
    } else {
      return t('gemini.common.error.parseError', { rawResponse: textResponse });
    }

  } catch (error) {
    console.error("Error fetching crop optimal conditions from Gemini:", error);
    const detail = getDetailedErrorMessage(error);
    return `${t('gemini.common.error.fetchError')} Details: ${detail}`;
  }
};


export const generateDataInsights = async (
    request: DataInsightRequest,
    lang: LanguageCode,
    t: (key: string, replacements?: Record<string, string | number>) => string
  ): Promise<string | null> => {
  if (!ai) return t('gemini.common.error.apiKeyMissing');
  
  const yieldDataString = request.yieldData.map(d => `${d.name}: ${d.value} tons`).join(', ');
  const moistureDataString = request.moistureData.map(d => `${d.name}: ${d.value}%`).join(', ');
  let pestDataString = "";
  if (request.pestData && request.pestData.length > 0) {
    pestDataString = "Pest Incidence: " + request.pestData.map(d => `${d.month}: ${d.incidenceRate}%`).join(', ');
  }
  
  const languageInstruction = getLanguageInstruction(lang, t);
  const basePrompt = t('gemini.dataInsights.prompt', {
    yieldDataString,
    moistureDataString,
    pestDataString: pestDataString ? `- ${pestDataString}` : ''
  });
  const fullPrompt = `${basePrompt}${languageInstruction}`;


  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: fullPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating data insights from Gemini:", error);
    const detail = getDetailedErrorMessage(error);
    return `${t('gemini.common.error.fetchError')} Details: ${detail}`;
  }
};


export const getFarmingAdvice = async (
    cropName: string, 
    currentConditions: {temp: number, moistureStatusKey: SoilMoistureStatusType | GeneralSensorStatus }, // Changed moisture to moistureStatusKey, removed pH
    lang: LanguageCode,
    t: (key: string, replacements?: Record<string, string | number>) => string
  ): Promise<string | null> => {
  if (!ai) return t('gemini.common.error.apiKeyMissing');

  const languageInstruction = getLanguageInstruction(lang, t);
  const basePrompt = t('gemini.farmingAdvice.prompt', { // This key's content in locale files will be updated
    cropName,
    temp: String(currentConditions.temp),
    moistureStatusKey: currentConditions.moistureStatusKey // Pass the status key
  });
  const fullPrompt = `${basePrompt}${languageInstruction}`;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: fullPrompt, 
    });
    return response.text;
  } catch (error) {
    console.error("Error getting farming advice:", error);
    const detail = getDetailedErrorMessage(error);
    return `${t('gemini.common.error.fetchError')} Details: ${detail}`;
  }
};

export const getAICropRecommendations = async (
    conditions: { temperature: number; moisture: number; ph: number },
    lang: LanguageCode,
    t: (key: string, replacements?: Record<string, string | number>) => string
  ): Promise<CropRecommendation[] | string | null> => {
  if (!ai) return t('gemini.common.error.apiKeyMissing');

  const languageInstruction = getLanguageInstruction(lang, t);
  const basePrompt = t('gemini.aiCropRecommendations.prompt', {
      temperature: String(conditions.temperature),
      moisture: String(conditions.moisture),
      ph: String(conditions.ph)
  });
  const fullPrompt = `${basePrompt}${languageInstruction}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const textResponse = response.text;
    // Parse as unknown to perform detailed runtime checks
    const parsedJson = parseJsonFromText<unknown>(textResponse, t);

    if (parsedJson) {
      // Scenario 1: It's an array of CropRecommendation objects
      if (Array.isArray(parsedJson)) {
        if (parsedJson.every(item => 
            item && typeof item === 'object' && 
            'cropName' in item && typeof (item as any).cropName === 'string' &&
            'reason' in item && typeof (item as any).reason === 'string' &&
            'estimatedGrowingPeriod' in item && typeof (item as any).estimatedGrowingPeriod === 'string')) {
          return parsedJson as CropRecommendation[];
        } else {
          console.error("Parsed JSON array elements do not match CropRecommendation structure or type:", parsedJson);
          return t('gemini.common.error.parseError', { rawResponse: textResponse });
        }
      } 
      // Scenario 2: It's a single CropRecommendation object
      else if (typeof parsedJson === 'object' && parsedJson !== null && 
               'cropName' in parsedJson && typeof (parsedJson as any).cropName === 'string' &&
               'reason' in parsedJson && typeof (parsedJson as any).reason === 'string' &&
               'estimatedGrowingPeriod' in parsedJson && typeof (parsedJson as any).estimatedGrowingPeriod === 'string') {
        return [parsedJson as CropRecommendation]; // Wrap the single object in an array
      } 
      // Scenario 3: It's something else (not a valid response format)
      else {
        console.error("Parsed JSON is not a valid CropRecommendation array or single object:", parsedJson);
        return t('gemini.common.error.parseError', { rawResponse: textResponse });
      }
    } else {
      // parseJsonFromText returned null (JSON parsing failed or empty/invalid raw response)
      return t('gemini.common.error.parseError', { rawResponse: textResponse });
    }

  } catch (error) {
    console.error("Error fetching AI crop recommendations from Gemini:", error);
    const detail = getDetailedErrorMessage(error);
    return `${t('gemini.common.error.fetchError')} Details: ${detail}`;
  }
};

export const generateCropImage = async (
    cropName: string,
    t: (key: string, replacements?: Record<string, string | number>) => string
  ): Promise<string> => { // Returns dataURI string on success, or error message string on failure
  if (!ai) {
    console.warn("Imagen API not initialized. API_KEY missing or invalid for image generation services.");
    return t('gemini.common.error.apiKeyMissing.image');
  }

  const prompt = t('gemini.generateCropImage.prompt', { cropName });

  try {
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    console.warn(`No image bytes found in Imagen response for '${cropName}'. This could be due to the prompt or model limitations. Response:`, response);
    return t('gemini.generateCropImage.error.noImageBytes', { cropName });
  } catch (error) {
    console.error(`Error generating image for '${cropName}' using Imagen. Raw error:`, error);
    const detail = getDetailedErrorMessage(error);
    return t('gemini.generateCropImage.error.apiError', { error: detail });
  }
};