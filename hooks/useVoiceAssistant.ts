import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChatMessage,
  ISpeechRecognition,
  ISpeechRecognitionErrorEvent,
  ISpeechRecognitionEvent,
  SupportedLanguage,
  VoiceChatErrorType,
  VoiceChatStatus,
} from "@/types";
import { sendChatMessageToGemini } from "@/services/geminiService";

const STORAGE_KEY = "voice_assistant_history_v1";

// Safely resolve native modules using requireOptionalNativeModule to prevent fatal crashes
function getSpeechModule(): any {
  try {
    const { requireOptionalNativeModule } = require("expo-modules-core");
    const hasNative = requireOptionalNativeModule ? requireOptionalNativeModule("ExpoSpeech") : null;
    if (!hasNative) return null;
    return require("expo-speech");
  } catch {
    return null;
  }
}

function getAudioModule(): { AudioModule: any; RecordingPresets: any } {
  try {
    const { requireOptionalNativeModule } = require("expo-modules-core");
    const hasNative = requireOptionalNativeModule ? requireOptionalNativeModule("ExpoAudio") : null;
    if (!hasNative) return { AudioModule: null, RecordingPresets: null };
    const expoAudio = require("expo-audio");
    return {
      AudioModule: expoAudio.AudioModule,
      RecordingPresets: expoAudio.RecordingPresets,
    };
  } catch {
    return { AudioModule: null, RecordingPresets: null };
  }
}

function getFileSystemModule(): any {
  try {
    const { requireOptionalNativeModule } = require("expo-modules-core");
    return require("expo-file-system/legacy") || require("expo-file-system");
  } catch {
    try {
      return require("expo-file-system");
    } catch {
      return null;
    }
  }
}

export interface UseVoiceAssistantOptions {
  initialLanguage?: SupportedLanguage;
  autoSpeak?: boolean;
}

export interface UseVoiceAssistantReturn {
  // States
  status: VoiceChatStatus;
  language: SupportedLanguage;
  transcript: string;
  messages: ChatMessage[];
  error: string | null;
  errorType: VoiceChatErrorType | null;
  isSTTSupported: boolean;
  isTTSSupported: boolean;

  // Actions
  setLanguage: (lang: SupportedLanguage) => void;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  toggleListening: () => Promise<void>;
  speak: (text?: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  sendMessage: (customText?: string) => Promise<void>;
  editMessageAndResend: (messageId: string, newText: string) => Promise<void>;
  clearHistory: () => void;
  resetError: () => void;
}

export function useVoiceAssistant(
  options: UseVoiceAssistantOptions = {}
): UseVoiceAssistantReturn {
  const { initialLanguage = "en-US", autoSpeak = true } = options;

  const [status, setStatus] = useState<VoiceChatStatus>("idle");
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);
  const [transcript, setTranscript] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<VoiceChatErrorType | null>(null);

  const [isSTTSupported, setIsSTTSupported] = useState<boolean>(true);
  const [isTTSSupported, setIsTTSSupported] = useState<boolean>(true);

  // References
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const nativeRecorderRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const latestTranscriptRef = useRef<string>("");
  const messagesRef = useRef<ChatMessage[]>([]);
  const languageRef = useRef<SupportedLanguage>(initialLanguage);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Save messages to persistent AsyncStorage & localStorage
  const saveMessages = useCallback(async (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    messagesRef.current = newMessages;

    const jsonStr = JSON.stringify(newMessages);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, jsonStr);
    } catch {
      // Ignore async storage error
    }

    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, jsonStr);
      } catch {
        // Ignore local storage error
      }
    }
  }, []);

  // 1. Initial Load Persistent Chat History
  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        const SpeechRecognitionAPI =
          (window as unknown as { SpeechRecognition?: new () => ISpeechRecognition }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognition }).webkitSpeechRecognition;

        setIsSTTSupported(Boolean(SpeechRecognitionAPI) || Boolean(navigator.mediaDevices?.getUserMedia));
        setIsTTSSupported(typeof window.speechSynthesis !== "undefined");
      }
    } else {
      setIsSTTSupported(true);
      setIsTTSSupported(true);
    }

    // Load from storage
    const loadStoredHistory = async () => {
      try {
        let stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored && typeof window !== "undefined" && typeof localStorage !== "undefined") {
          stored = localStorage.getItem(STORAGE_KEY);
        }

        if (stored) {
          const parsed: ChatMessage[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
            messagesRef.current = parsed;
          }
        }
      } catch {
        // Ignore read errors
      }
    };

    loadStoredHistory();
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setErrorType(null);
    setStatus("idle");
  }, []);

  // 2. Text-to-Speech (TTS)
  const stopSpeaking = useCallback(async () => {
    try {
      const Speech = getSpeechModule();
      if (Speech && typeof Speech.stop === "function") {
        await Speech.stop();
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignore stop errors
    }
    setStatus((prev) => (prev === "speaking" ? "idle" : prev));
  }, []);

  const speak = useCallback(
    async (textToSpeak?: string) => {
      let content = textToSpeak;
      if (!content) {
        const lastMsg = [...messagesRef.current].reverse().find((m) => m.role === "assistant");
        content = lastMsg?.text;
      }

      if (!content || !content.trim()) return;

      try {
        await stopSpeaking();
        setStatus("speaking");

        const isBangla = languageRef.current.startsWith("bn");
        const langCode = isBangla ? "bn-BD" : "en-US";

        const Speech = getSpeechModule();
        if (Speech && typeof Speech.speak === "function") {
          // Native Device TTS
          Speech.speak(content.trim(), {
            language: langCode,
            pitch: 1.0,
            rate: 1.0,
            onDone: () => setStatus("idle"),
            onStopped: () => setStatus("idle"),
            onError: () => setStatus("idle"),
          });
        } else if (typeof window !== "undefined" && window.speechSynthesis) {
          // Web Browser TTS
          const utterance = new SpeechSynthesisUtterance(content.trim());
          utterance.lang = langCode;

          const voices = window.speechSynthesis.getVoices();
          const matchedVoice = voices.find((v) =>
            isBangla
              ? v.lang.toLowerCase().startsWith("bn")
              : v.lang.toLowerCase().startsWith("en")
          );

          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }

          utterance.onstart = () => setStatus("speaking");
          utterance.onend = () => setStatus("idle");
          utterance.onerror = () => setStatus("idle");

          window.speechSynthesis.speak(utterance);
        } else {
          setStatus("idle");
        }
      } catch {
        setStatus("idle");
      }
    },
    [stopSpeaking]
  );

  // 3. Send Message to Gemini AI
  const sendMessage = useCallback(
    async (customText?: string, audioPayload?: { base64: string; mimeType: string }) => {
      const text = customText !== undefined ? customText.trim() : latestTranscriptRef.current.trim();
      const hasAudio = Boolean(audioPayload?.base64);

      if (!text && !hasAudio) {
        setStatus("idle");
        return;
      }

      await stopSpeaking();

      if (text) {
        const userMessage: ChatMessage = {
          id: `${Date.now()}-user`,
          role: "user",
          text,
          timestamp: Date.now(),
        };
        const updatedHistory = [...messagesRef.current, userMessage];
        saveMessages(updatedHistory);
      }

      setTranscript(text || "");
      latestTranscriptRef.current = "";

      setStatus("thinking");
      setError(null);
      setErrorType(null);

      try {
        const response = await sendChatMessageToGemini({
          message: text || undefined,
          audioBase64: audioPayload?.base64,
          mimeType: audioPayload?.mimeType,
          history: messagesRef.current,
          language: languageRef.current,
        });

        let updatedHistory = messagesRef.current;
        if (hasAudio && response.transcript) {
          const userMessage: ChatMessage = {
            id: `${Date.now()}-user`,
            role: "user",
            text: response.transcript,
            timestamp: Date.now(),
          };
          updatedHistory = [...updatedHistory, userMessage];
          setTranscript(response.transcript);
        }

        const assistantMessage: ChatMessage = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: response.reply,
          timestamp: Date.now(),
        };

        const finalHistory = [...updatedHistory, assistantMessage];
        saveMessages(finalHistory);

        if (autoSpeak) {
          await speak(response.reply);
        } else {
          setStatus("idle");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get a response from AI.";

        const isNetwork =
          errorMessage.toLowerCase().includes("network") ||
          errorMessage.toLowerCase().includes("failed to fetch");

        setError(errorMessage);
        setErrorType(isNetwork ? "network_error" : "api_error");
        setStatus("error");
      }
    },
    [autoSpeak, saveMessages, speak, stopSpeaking]
  );

  // Edit previous user message and re-send to get updated answer
  const editMessageAndResend = useCallback(
    async (messageId: string, newText: string) => {
      const trimmed = newText.trim();
      if (!trimmed) return;

      await stopSpeaking();

      const index = messagesRef.current.findIndex((m) => m.id === messageId);
      if (index === -1) return;

      const updatedUserMsg: ChatMessage = {
        ...messagesRef.current[index],
        text: trimmed,
        timestamp: Date.now(),
      };

      const previousHistory = messagesRef.current.slice(0, index);
      const newHistory = [...previousHistory, updatedUserMsg];

      await saveMessages(newHistory);

      setTranscript(trimmed);
      setStatus("thinking");
      setError(null);
      setErrorType(null);

      try {
        const response = await sendChatMessageToGemini({
          message: trimmed,
          history: previousHistory,
          language: languageRef.current,
        });

        const assistantMessage: ChatMessage = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: response.reply,
          timestamp: Date.now(),
        };

        const finalHistory = [...newHistory, assistantMessage];
        await saveMessages(finalHistory);

        if (autoSpeak) {
          await speak(response.reply);
        } else {
          setStatus("idle");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get a response from AI.";
        const isNetwork =
          errorMessage.toLowerCase().includes("network") ||
          errorMessage.toLowerCase().includes("failed to fetch");

        setError(errorMessage);
        setErrorType(isNetwork ? "network_error" : "api_error");
        setStatus("error");
      }
    },
    [autoSpeak, saveMessages, speak, stopSpeaking]
  );

  // 4. Speech-to-Text & Native Mobile Microphone Recording
  const stopListening = useCallback(async () => {
    isListeningRef.current = false;

    // Mobile recording stop
    if (Platform.OS !== "web" && nativeRecorderRef.current) {
      try {
        const recorder = nativeRecorderRef.current;
        nativeRecorderRef.current = null;
        await recorder.stop();
        const uri = recorder.uri;

        if (uri) {
          setStatus("thinking");
          const FileSystem = getFileSystemModule();
          if (FileSystem) {
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: "base64",
            });

            await sendMessage(undefined, {
              base64,
              mimeType: "audio/m4a",
            });
            return;
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error processing voice recording.";
        setError(msg);
        setErrorType("recognition_error");
        setStatus("error");
        return;
      }
    }

    // Web Speech stop
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
  }, [sendMessage]);

  const startListening = useCallback(async () => {
    await stopSpeaking();
    resetError();

    // 1) Mobile Native Microphone
    if (Platform.OS !== "web") {
      try {
        const { AudioModule, RecordingPresets } = getAudioModule();
        if (!AudioModule) {
          throw new Error("Voice recording native module is not linked yet in this build. Please run with `npx expo run:android` to rebuild or use text input.");
        }

        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          setError("Microphone permission denied. Please allow microphone access in settings.");
          setErrorType("mic_permission_denied");
          setStatus("error");
          return;
        }

        const preset = RecordingPresets?.HIGH_QUALITY || {};
        const recorder = new AudioModule.AudioRecorder(preset);
        await recorder.prepareToRecordAsync();
        await recorder.record();

        nativeRecorderRef.current = recorder;
        isListeningRef.current = true;
        setTranscript("");
        setStatus("listening");
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to record audio from microphone.";
        setError(msg);
        setErrorType("recognition_error");
        setStatus("error");
        return;
      }
    }

    // 2) Web Browser Speech Recognition
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: new () => ISpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      setErrorType("speech_unsupported");
      setStatus("error");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }

      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = languageRef.current;
      recognition.maxAlternatives = 1;

      latestTranscriptRef.current = "";
      setTranscript("");
      isListeningRef.current = true;

      recognition.onstart = () => {
        setStatus("listening");
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0]) {
            currentText += item[0].transcript;
          }
        }
        if (currentText) {
          latestTranscriptRef.current = currentText;
          setTranscript(currentText);
        }
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        isListeningRef.current = false;
        const err = event.error;

        if (err === "not-allowed" || err === "service-not-allowed") {
          setError("Microphone permission denied. Please allow microphone access.");
          setErrorType("mic_permission_denied");
          setStatus("error");
        } else if (err === "no-speech") {
          setStatus("idle");
        } else if (err === "audio-capture") {
          setError("No microphone detected. Please check your audio device.");
          setErrorType("recognition_error");
          setStatus("error");
        } else if (err === "network") {
          setError("Speech recognition network error occurred.");
          setErrorType("network_error");
          setStatus("error");
        } else if (err === "aborted") {
          setStatus("idle");
        } else {
          setError(`Speech recognition error: ${err}`);
          setErrorType("recognition_error");
          setStatus("error");
        }
      };

      recognition.onend = () => {
        const hadActiveSession = isListeningRef.current;
        isListeningRef.current = false;

        const recognizedText = latestTranscriptRef.current.trim();
        if (hadActiveSession && recognizedText) {
          sendMessage(recognizedText);
        } else {
          setStatus((prev) => (prev === "listening" ? "idle" : prev));
        }
      };

      recognition.start();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize microphone.";
      setError(`Microphone error: ${msg}`);
      setErrorType("recognition_error");
      setStatus("error");
    }
  }, [resetError, sendMessage, stopSpeaking]);

  const toggleListening = useCallback(async () => {
    if (status === "listening") {
      await stopListening();
    } else if (status === "speaking") {
      await stopSpeaking();
    } else {
      await startListening();
    }
  }, [startListening, status, stopListening, stopSpeaking]);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    languageRef.current = newLang;
  }, []);

  const clearHistory = useCallback(() => {
    saveMessages([]);
  }, [saveMessages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    status,
    language,
    transcript,
    messages,
    error,
    errorType,
    isSTTSupported,
    isTTSSupported,
    setLanguage,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    sendMessage,
    editMessageAndResend,
    clearHistory,
    resetError,
  };
}
