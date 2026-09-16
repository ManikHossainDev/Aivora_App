export type VoiceChatStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

export type SupportedLanguage = "en-US" | "bn-BD";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export type VoiceChatErrorType =
  | "mic_permission_denied"
  | "speech_unsupported"
  | "recognition_error"
  | "api_error"
  | "network_error"
  | "synthesis_error";

export interface VoiceChatError {
  type: VoiceChatErrorType;
  message: string;
  details?: unknown;
}

export interface GeminiInlineData {
  mimeType: string;
  data: string;
}

export interface GeminiPart {
  text?: string;
  inlineData?: GeminiInlineData;
}

export interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

export interface GeminiChatRequestBody {
  message?: string;
  audioBase64?: string;
  mimeType?: string;
  history?: ChatMessage[];
  language?: SupportedLanguage;
}

export interface GeminiChatResponse {
  reply: string;
  transcript?: string;
}

// Global browser Speech Recognition interfaces for TS environments
export interface ISpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative;
}

export interface ISpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

export interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

export interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
