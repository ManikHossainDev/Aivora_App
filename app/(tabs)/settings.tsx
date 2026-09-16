import React, { useState } from "react";
import { Alert, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [autoSpeak, setAutoSpeak] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

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

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5 py-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold tracking-tight text-slate-900">Settings</Text>
          <Text className="mt-0.5 text-xs text-slate-500">Configure your assistant preferences and privacy</Text>
        </View>

        {/* AI & Voice Preferences */}
        <View className="mb-5">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Voice & Assistant
          </Text>
          <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <View className="flex-row items-center justify-between border-b border-slate-100 p-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <Ionicons name="volume-high-outline" size={20} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-800">Auto-Speak Responses</Text>
                  <Text className="text-xs text-slate-500">Read AI answers aloud automatically</Text>
                </View>
              </View>
              <Switch
                value={autoSpeak}
                onValueChange={setAutoSpeak}
                trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
                thumbColor={autoSpeak ? "#2563eb" : "#f1f5f9"}
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <Ionicons name="language-outline" size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-800">Language</Text>
                  <Text className="text-xs text-slate-500">Default input & speech language</Text>
                </View>
              </View>
              <View className="rounded-lg bg-slate-100 px-3 py-1.5">
                <Text className="text-xs font-semibold text-slate-700">English (US)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Storage & Auto-Expiry Privacy */}
        <View className="mb-5">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Privacy & Storage
          </Text>
          <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <View className="flex-row items-center justify-between border-b border-slate-100 p-4">
              <View className="flex-row items-center flex-1 pr-3">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                  <Ionicons name="timer-outline" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-800">24-Hour Ephemeral Retention</Text>
                  <Text className="text-xs text-slate-500">
                    Conversations automatically purge after 24 hours
                  </Text>
                </View>
              </View>
              <View className="rounded-full bg-amber-100 px-2.5 py-1">
                <Text className="text-[11px] font-semibold text-amber-800">Active</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClearAllData}
              className="flex-row items-center justify-between p-4 active:bg-rose-50"
            >
              <View className="flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
                  <Ionicons name="trash-outline" size={20} color="#e11d48" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-rose-700">Clear All Local Data</Text>
                  <Text className="text-xs text-rose-400">Delete all cached chats now</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View className="mb-6">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            About Aivora
          </Text>
          <View className="rounded-2xl border border-slate-200 bg-white p-4">
            <View className="flex-row items-center justify-between border-b border-slate-100 pb-3">
              <Text className="text-xs text-slate-500">App Version</Text>
              <Text className="text-xs font-semibold text-slate-800">v1.0.0 (Build 1)</Text>
            </View>
            <View className="flex-row items-center justify-between pt-3">
              <Text className="text-xs text-slate-500">AI Intelligence Core</Text>
              <Text className="text-xs font-semibold text-blue-600">Aivora 3.6 Flash Engine</Text>
            </View>
          </View>
        </View>

        {/* Log out */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mb-8 flex-row items-center justify-center rounded-2xl border border-slate-300 bg-white py-3.5 shadow-sm active:bg-slate-100"
        >
          <Ionicons name="log-out-outline" size={18} color="#475569" />
          <Text className="ml-2 text-sm font-semibold text-slate-700">Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
