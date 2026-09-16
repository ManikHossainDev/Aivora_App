import React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AivoraHeader } from "@/components/AivoraHeader";
import { useModelStore } from "@/stores/modelStore";

export default function AssistantHubScreen() {
  const selectedModel = useModelStore((state) => state.selectedModel);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const capabilities = [
    {
      icon: "mic-outline",
      iconBg: "bg-emerald-50",
      iconColor: "#059669",
      title: "Real-Time Voice Input",
      desc: "Speak naturally with dynamic 8-bar audio frequency waveform tracking.",
    },
    {
      icon: "sparkles-outline",
      iconBg: "bg-blue-50",
      iconColor: "#2563eb",
      title: "Active Intelligence Core",
      desc: `Powered by ${selectedModel.displayName} for high-speed conversational reasoning.`,
    },
    {
      icon: "volume-high-outline",
      iconBg: "bg-purple-50",
      iconColor: "#9333ea",
      title: "Voice Audio Playback",
      desc: "High-clarity speech synthesis with instant one-click audio replay.",
    },
    {
      icon: "shield-checkmark-outline",
      iconBg: "bg-amber-50",
      iconColor: "#d97706",
      title: "Local Storage Privacy",
      desc: "Your conversation history is securely saved directly on your device storage.",
    },
  ];

  const systemSpecs = [
    { label: "Active AI Engine", value: selectedModel.displayName },
    { label: "Latency Profile", value: selectedModel.badge },
    { label: "Voice Synthesis", value: "Active & Ready" },
    { label: "Speech Recognition", value: "Multilingual Engine" },
    { label: "Data Storage", value: "Local Storage" },
    { label: "Architecture", value: "Client-Side Native" },
  ];

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
          <Text className="text-xl font-bold tracking-tight text-slate-900">Assistant Hub</Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            Aivora intelligence capabilities & system overview
          </Text>
        </View>

        {/* Hero AI Status Card */}
        <View className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <Ionicons name="sparkles" size={22} color="#ffffff" />
              </View>
              <View>
                <Text className="text-base font-bold text-slate-900">Aivora AI</Text>
                <Text className="text-xs font-semibold text-blue-600">
                  {selectedModel.displayName}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center rounded-full bg-emerald-50 px-2.5 py-1">
              <View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              <Text className="text-[11px] font-bold text-emerald-700">Online</Text>
            </View>
          </View>

          <View className="mt-3.5 rounded-xl bg-slate-50 p-3">
            <Text className="text-xs leading-5 text-slate-600">
              Aivora is your next-generation conversational voice assistant, engineered for fast reasoning, natural voice synthesis, and seamless productivity.
            </Text>
          </View>
        </View>

        {/* AI Capabilities Section */}
        <View className="mb-5">
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Core Capabilities
          </Text>
          <View className="gap-2.5">
            {capabilities.map((cap, index) => (
              <View
                key={index}
                className="flex-row items-center rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <View
                  className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${cap.iconBg}`}
                >
                  <Ionicons name={cap.icon as any} size={20} color={cap.iconColor} />
                </View>
                <View className="flex-1 pr-1">
                  <Text className="text-xs font-bold text-slate-800">{cap.title}</Text>
                  <Text className="mt-0.5 text-[11px] leading-4 text-slate-500">{cap.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* System Specifications & Diagnostics */}
        <View className="mb-8">
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            System Specifications
          </Text>
          <View className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
            {systemSpecs.map((spec, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between px-3 py-2.5"
              >
                <Text className="text-xs font-medium text-slate-500">{spec.label}</Text>
                <Text className="text-xs font-semibold text-slate-800">{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
