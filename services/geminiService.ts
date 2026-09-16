import { Platform } from "react-native";
import Constants from "expo-constants";
import { ChatMessage, GeminiChatResponse, SupportedLanguage } from "@/types";

export interface SendMessageOptions {
  message?: string;
  audioBase64?: string;
  mimeType?: string;
  history?: ChatMessage[];
  language?: SupportedLanguage;
}

function getApiUrl(): string {
  if (Platform.OS === "web") {
    return "/api/chat";
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    const base = process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
    return `${base}/api/chat`;
  }

  // Detect host IP automatically when running in Expo on mobile
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8081/api/chat`;
  }

  return "http://localhost:8081/api/chat";
}

export async function sendChatMessageToGemini({
  message,
  audioBase64,
  mimeType,
  history = [],
  language = "en-US",
}: SendMessageOptions): Promise<GeminiChatResponse> {
  try {
    const endpoint = getApiUrl();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        audioBase64,
        mimeType,
        history,
        language,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } catch {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data || typeof data.reply !== "string") {
      throw new Error("Invalid response format received from AI server.");
    }

    return {
      reply: data.reply,
      transcript: data.transcript,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request was cancelled.");
      }
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Network error: Unable to connect to AI server. Please check your internet connection.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred while communicating with Aivora.");
  }
}
