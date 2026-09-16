import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AivoraModelOption {
  id: string; // e.g. "gemini-3.6-flash"
  displayName: string; // e.g. "Aivora 3.6 Flash"
  shortName: string; // e.g. "3.6 Flash"
  badge: string; // e.g. "Fastest"
  description: string;
  isDefault?: boolean;
}

export const AIVORA_MODELS: AivoraModelOption[] = [
  {
    id: "gemini-3.6-flash",
    displayName: "Aivora 3.6 Flash",
    shortName: "3.6 Flash",
    badge: "Ultra Fast",
    description: "Low-latency real-time voice & text responses",
    isDefault: true,
  },
  {
    id: "gemini-3.7-flash",
    displayName: "Aivora 3.7 Flash",
    shortName: "3.7 Flash",
    badge: "Smart & Balanced",
    description: "Enhanced reasoning with fast conversational flow",
  },
  {
    id: "gemini-3.8-flash",
    displayName: "Aivora 3.8 Flash",
    shortName: "3.8 Flash",
    badge: "Deep Reasoning",
    description: "Complex problem solving & detailed analysis",
  },
  {
    id: "gemini-flash-latest",
    displayName: "Aivora Pro Latest",
    shortName: "Pro Latest",
    badge: "State-of-the-Art",
    description: "Most capable multi-modal intelligence engine",
  },
];

interface ModelStoreState {
  selectedModel: AivoraModelOption;
  setModel: (model: AivoraModelOption) => void;
  loadStoredModel: () => Promise<void>;
}

const STORAGE_KEY = "@aivora_selected_model_v1";

export const useModelStore = create<ModelStoreState>((set) => ({
  selectedModel: AIVORA_MODELS[0],
  setModel: (model: AivoraModelOption) => {
    set({ selectedModel: model });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(model)).catch(() => {});
  },
  loadStoredModel: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const match = AIVORA_MODELS.find((m) => m.id === parsed.id);
        if (match) {
          set({ selectedModel: match });
        }
      }
    } catch {
      // Ignore load error
    }
  },
}));
