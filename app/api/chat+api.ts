import { ChatMessage, GeminiContent, SupportedLanguage } from "@/types";

interface RequestPayload {
  message?: string;
  audioBase64?: string;
  mimeType?: string;
  history?: ChatMessage[];
  language?: SupportedLanguage;
}

// Active models with fallback to prevent 503 Overloaded issues
const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

export async function POST(request: Request): Promise<Response> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is missing. Please configure it in .env or .env.local.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = (await request.json()) as RequestPayload;
    const { message, audioBase64, mimeType = "audio/m4a", history = [], language = "en-US" } = body;

    if ((!message || !message.trim()) && !audioBase64) {
      return new Response(
        JSON.stringify({ error: "Either a text 'message' or 'audioBase64' is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build conversation contents for Gemini
    const contents: GeminiContent[] = [];

    // Map recent history (limit to last 10 messages)
    const recentHistory = history.slice(-10);
    for (const item of recentHistory) {
      if (item.text && item.text.trim()) {
        contents.push({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.text.trim() }],
        });
      }
    }

    if (audioBase64) {
      // Audio Input from Mobile / Mic Recording
      const promptInstruction =
        "Listen to the user's speech in the audio. Respond with a JSON object with: 1) 'transcript': exact English text of what the user said, 2) 'reply': your natural, brief conversational reply in English. Format: {\"transcript\": \"...\", \"reply\": \"...\"}";

      contents.push({
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "audio/m4a",
              data: audioBase64,
            },
          },
          {
            text: promptInstruction,
          },
        ],
      });
    } else {
      // Standard Text Message
      contents.push({
        role: "user",
        parts: [{ text: (message || "").trim() }],
      });
    }

    const systemInstructionText =
      "Your name is Aivora. You are an intelligent, friendly, and highly capable AI voice assistant. Always communicate only in English. Never refer to yourself as Gemini or mention that you are created as Gemini. If the user asks for your name or identity, always state that you are Aivora. Keep your responses concise, conversational, clear, and optimized for voice playback.";

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 400,
        ...(audioBase64 ? { responseMimeType: "application/json" } : {}),
      },
    };

    let lastError = "Gemini Service Unavailable";
    let lastStatus = 503;

    // Try models with automatic fallback
    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const geminiResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload),
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const candidate = data.candidates?.[0];
          const rawText = candidate?.content?.parts?.[0]?.text?.trim() || "";

          let finalReply = rawText;
          let finalTranscript = "";

          if (audioBase64) {
            try {
              const parsed = JSON.parse(rawText);
              finalReply = parsed.reply || rawText;
              finalTranscript = parsed.transcript || "";
            } catch {
              finalReply = rawText;
            }
          }

          if (!finalReply) {
            finalReply = "I could not generate a response. Please try again.";
          }

          return new Response(
            JSON.stringify({
              reply: finalReply,
              transcript: finalTranscript,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const errorText = await geminiResponse.text();
        lastStatus = geminiResponse.status;
        try {
          const jsonErr = JSON.parse(errorText);
          lastError = jsonErr.error?.message || errorText;
        } catch {
          lastError = errorText;
        }

        if (lastStatus !== 503 && lastStatus !== 429 && lastStatus !== 404) {
          break;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : "Network error contacting Gemini";
      }
    }

    return new Response(
      JSON.stringify({
        error: `Gemini API error (${lastStatus}): ${lastError}`,
      }),
      {
        status: lastStatus,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(
      JSON.stringify({ error: `Server error: ${errMessage}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
