import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AivoraHeader } from "@/components/AivoraHeader";
import { useModelStore } from "@/stores/modelStore";
import { ChatMessage } from "@/types";

interface StorageDiagnostics {
  messageCount: number;
  estimatedSizeKb: string;
  activeModelName: string;
  keys: string[];
  recentMessages: ChatMessage[];
}

export default function SettingsScreen() {
  const selectedModel = useModelStore((state) => state.selectedModel);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  // Storage Inspector Modal State
  const [storageModalVisible, setStorageModalVisible] = useState(false);
  const [storageData, setStorageData] = useState<StorageDiagnostics>({
    messageCount: 0,
    estimatedSizeKb: "0.0 KB",
    activeModelName: selectedModel.displayName,
    keys: [],
    recentMessages: [],
  });

  const loadStorageDiagnostics = async () => {
    try {
      let storedHistory = await AsyncStorage.getItem("voice_assistant_history_v1");
      if (!storedHistory && typeof window !== "undefined" && typeof localStorage !== "undefined") {
        storedHistory = localStorage.getItem("voice_assistant_history_v1");
      }

      let storedModel = await AsyncStorage.getItem("@aivora_selected_model_v1");
      if (!storedModel && typeof window !== "undefined" && typeof localStorage !== "undefined") {
        storedModel = localStorage.getItem("@aivora_selected_model_v1");
      }

      const allKeys = await AsyncStorage.getAllKeys();

      let parsedMessages: ChatMessage[] = [];
      if (storedHistory) {
        try {
          parsedMessages = JSON.parse(storedHistory);
        } catch {
          parsedMessages = [];
        }
      }

      let parsedModelName = selectedModel.displayName;
      if (storedModel) {
        try {
          const modelObj = JSON.parse(storedModel);
          parsedModelName = modelObj.displayName || selectedModel.displayName;
        } catch {
          parsedModelName = selectedModel.displayName;
        }
      }

      const rawBytes =
        (storedHistory?.length || 0) * 2 + (storedModel?.length || 0) * 2 + 1024;
      const sizeInKb = (rawBytes / 1024).toFixed(1) + " KB";

      setStorageData({
        messageCount: parsedMessages.length,
        estimatedSizeKb: sizeInKb,
        activeModelName: parsedModelName,
        keys: allKeys.length > 0 ? [...allKeys] : ["voice_assistant_history_v1", "@aivora_selected_model_v1"],
        recentMessages: parsedMessages.slice(-6).reverse(),
      });
      setStorageModalVisible(true);
    } catch {
      setStorageModalVisible(true);
    }
  };

  const handleClearAllData = async () => {
    const doClear = async () => {
      try {
        await AsyncStorage.clear();
        if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
          localStorage.clear();
        }
        setStorageModalVisible(false);
        if (Platform.OS === "web") {
          alert("All local conversation history and cache have been successfully cleared.");
        } else {
          Alert.alert("Success", "All local conversation history and cache have been cleared.");
        }
      } catch {
        // Ignore clear error
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to clear all local conversation data?")) {
        await doClear();
      }
    } else {
      Alert.alert(
        "Clear All Local Data",
        "This will permanently delete all cached conversations from your device.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Clear All", style: "destructive", onPress: doClear },
        ]
      );
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
      {/* Top Universal Header with Model Selector */}
      <AivoraHeader />

      <ScrollView 
        className="flex-1 px-4 py-3.5" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />}
      >
        {/* Page Title Header */}
        <View className="mb-4">
          <Text className="text-xl font-bold tracking-tight text-slate-900">Settings</Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            Configure your assistant preferences and privacy
          </Text>
        </View>

        {/* AI & Voice Preferences */}
        <View className="mb-5">
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Voice & Assistant
          </Text>
          <View className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
            <View className="flex-row items-center justify-between px-3 py-2.5">
              <View className="flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <Ionicons name="volume-high-outline" size={18} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-slate-800">Auto-Speak Responses</Text>
                  <Text className="text-[11px] text-slate-500">Read AI answers aloud automatically</Text>
                </View>
              </View>
              <Switch
                value={autoSpeak}
                onValueChange={setAutoSpeak}
                trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
                thumbColor={autoSpeak ? "#2563eb" : "#f1f5f9"}
              />
            </View>

            <View className="flex-row items-center justify-between px-3 py-2.5">
              <View className="flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <Ionicons name="language-outline" size={18} color="#059669" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-slate-800">Language</Text>
                  <Text className="text-[11px] text-slate-500">Default input & speech language</Text>
                </View>
              </View>
              <View className="rounded-lg bg-slate-100 px-2.5 py-1">
                <Text className="text-xs font-semibold text-slate-700">English (US)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy & History Storage */}
        <View className="mb-5">
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Privacy & Storage
          </Text>
          <View className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
            {/* Interactive Local Storage Row (Opens Storage Inspector) */}
            <TouchableOpacity
              onPress={loadStorageDiagnostics}
              className="flex-row items-center justify-between px-3 py-2.5 active:bg-blue-50/50 rounded-xl"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <Ionicons name="server-outline" size={18} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-800">Local Storage Data</Text>
                  <Text className="text-[11px] text-slate-500">
                    Tap to view stored chats, keys & memory usage
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="rounded-full bg-blue-50 px-2.5 py-0.5">
                  <Text className="text-[10px] font-bold text-blue-700">View Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            {/* Clear All Data Button */}
            <TouchableOpacity
              onPress={handleClearAllData}
              className="flex-row items-center justify-between rounded-xl px-3 py-2.5 active:bg-rose-50"
            >
              <View className="flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
                  <Ionicons name="trash-outline" size={18} color="#e11d48" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-rose-700">Clear All Local Data</Text>
                  <Text className="text-[11px] text-rose-400">Delete all cached chats now</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View className="mb-8">
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            About Aivora
          </Text>
          <View className="rounded-2xl bg-white p-3.5 shadow-sm">
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-xs text-slate-500">App Version</Text>
              <Text className="text-xs font-semibold text-slate-800">v1.0.0 (Build 1)</Text>
            </View>
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-xs text-slate-500">AI Intelligence Core</Text>
              <Text className="text-xs font-semibold text-blue-600">
                {selectedModel.displayName} Engine
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Local Storage Inspector Modal */}
      <Modal
        visible={storageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStorageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setStorageModalVisible(false)}>
          <View className="flex-1 justify-end bg-black/40">
            <TouchableWithoutFeedback>
              <View className="max-h-[85%] rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl">
                {/* Modal Header */}
                <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                  <View className="flex-row items-center">
                    <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                      <Ionicons name="server" size={18} color="#2563eb" />
                    </View>
                    <View>
                      <Text className="text-base font-bold text-slate-900">Local Storage Inspector</Text>
                      <Text className="text-[11px] text-slate-500">
                        Cached items stored on this device
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setStorageModalVisible(false)}
                    className="p-1 rounded-full active:bg-slate-100"
                  >
                    <Ionicons name="close" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="mt-3">
                  {/* Stats Overview Grid */}
                  <View className="flex-row gap-2.5 mb-4">
                    <View className="flex-1 rounded-2xl bg-blue-50/70 p-3.5 border border-blue-100">
                      <Text className="text-[11px] font-semibold text-blue-700">Stored Messages</Text>
                      <Text className="mt-1 text-xl font-extrabold text-blue-900">
                        {storageData.messageCount}
                      </Text>
                    </View>

                    <View className="flex-1 rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-100">
                      <Text className="text-[11px] font-semibold text-emerald-700">Storage Used</Text>
                      <Text className="mt-1 text-xl font-extrabold text-emerald-900">
                        {storageData.estimatedSizeKb}
                      </Text>
                    </View>
                  </View>

                  {/* Storage Details */}
                  <View className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <View className="flex-row items-center justify-between pb-2 border-b border-slate-200/60">
                      <Text className="text-xs font-medium text-slate-500">Storage Engine</Text>
                      <Text className="text-xs font-bold text-slate-800">
                        AsyncStorage (Native On-Device)
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between py-2 border-b border-slate-200/60">
                      <Text className="text-xs font-medium text-slate-500">Saved Model Preset</Text>
                      <Text className="text-xs font-bold text-blue-600">
                        {storageData.activeModelName}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between pt-2">
                      <Text className="text-xs font-medium text-slate-500">Privacy Status</Text>
                      <Text className="text-xs font-bold text-emerald-700">100% Client-Side Only</Text>
                    </View>
                  </View>

                  {/* Recent Stored Message Snippets */}
                  <View className="mb-4">
                    <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Recent Stored Messages ({storageData.recentMessages.length})
                    </Text>
                    {storageData.recentMessages.length === 0 ? (
                      <View className="rounded-xl bg-slate-50 p-4 items-center justify-center">
                        <Text className="text-xs text-slate-400">No cached chat messages found.</Text>
                      </View>
                    ) : (
                      <View className="gap-2">
                        {storageData.recentMessages.map((msg, idx) => (
                          <View
                            key={idx}
                            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                          >
                            <View className="flex-row items-center justify-between mb-1">
                              <View className="flex-row items-center">
                                <View
                                  className={`mr-1.5 h-2 w-2 rounded-full ${
                                    msg.role === "user" ? "bg-blue-600" : "bg-emerald-500"
                                  }`}
                                />
                                <Text className="text-[11px] font-bold text-slate-700">
                                  {msg.role === "user" ? "You" : "Aivora"}
                                </Text>
                              </View>
                              {msg.timestamp && (
                                <Text className="text-[10px] text-slate-400">
                                  {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Text>
                              )}
                            </View>
                            <Text
                              numberOfLines={2}
                              className="text-xs leading-4 text-slate-600"
                            >
                              {msg.text}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Wipe Storage Button */}
                  <TouchableOpacity
                    onPress={handleClearAllData}
                    className="mb-4 flex-row items-center justify-center rounded-2xl bg-rose-600 py-3.5 shadow-sm active:bg-rose-700"
                  >
                    <Ionicons name="trash-outline" size={16} color="#ffffff" />
                    <Text className="ml-2 text-xs font-bold text-white">
                      Clear & Wipe All Local Storage
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
