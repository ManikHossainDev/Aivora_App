import React, { useState } from "react";
import { Alert, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AivoraHeader } from "@/components/AivoraHeader";
import { useModelStore } from "@/stores/modelStore";

export default function SettingsScreen() {
  const selectedModel = useModelStore((state) => state.selectedModel);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const handleClearAllData = async () => {
    const doClear = async () => {
      try {
        await AsyncStorage.clear();
        if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
          localStorage.clear();
        }
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

      <ScrollView className="flex-1 px-4 py-3.5" showsVerticalScrollIndicator={false}>
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
            <View className="flex-row items-center justify-between px-3 py-2.5">
              <View className="flex-row items-center flex-1 pr-2">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <Ionicons name="shield-checkmark-outline" size={18} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-800">Local Chat History</Text>
                  <Text className="text-[11px] text-slate-500">
                    Conversations are securely saved to your local storage
                  </Text>
                </View>
              </View>
              <View className="rounded-full bg-blue-50 px-2.5 py-0.5">
                <Text className="text-[10px] font-bold text-blue-700">Enabled</Text>
              </View>
            </View>

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
    </SafeAreaView>
  );
}
