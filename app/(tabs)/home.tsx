import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { ChatMessage } from "@/types";
import { AivoraHeader } from "@/components/AivoraHeader";

// Suggestion Prompts for instant interaction
const SUGGESTION_PROMPTS = [
  { icon: "flash-outline", text: "5 habits for peak daily productivity" },
  { icon: "bulb-outline", text: "Brainstorm 3 innovative tech startup ideas" },
  { icon: "book-outline", text: "Explain quantum computing in simple terms" },
  { icon: "mail-outline", text: "Draft a polite follow-up business email" },
];

export default function HomeScreen() {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Message Editing States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const flatListRef = useRef<FlatList>(null);

  // 8-Bar Dynamic Equalizer Wave Graph Animation
  const barAnim1 = useRef(new Animated.Value(0.25)).current;
  const barAnim2 = useRef(new Animated.Value(0.65)).current;
  const barAnim3 = useRef(new Animated.Value(0.4)).current;
  const barAnim4 = useRef(new Animated.Value(0.95)).current;
  const barAnim5 = useRef(new Animated.Value(0.5)).current;
  const barAnim6 = useRef(new Animated.Value(0.85)).current;
  const barAnim7 = useRef(new Animated.Value(0.35)).current;
  const barAnim8 = useRef(new Animated.Value(0.7)).current;

  // Pulse Ring Glow for Mic
  const micPulseAnim = useRef(new Animated.Value(1)).current;

  const {
    status,
    transcript,
    messages,
    error,
    isSTTSupported,
    toggleListening,
    speak,
    stopSpeaking,
    sendMessage,
    editMessageAndResend,
    clearHistory,
    resetError,
  } = useVoiceAssistant({
    initialLanguage: "en-US",
    autoSpeak: true,
  });

  // Soundwave graph animation loop
  useEffect(() => {
    let loopAnim: Animated.CompositeAnimation | null = null;
    let micLoopAnim: Animated.CompositeAnimation | null = null;

    if (status === "listening" || status === "speaking") {
      // Bar wave animation loop
      loopAnim = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(barAnim1, { toValue: 1, duration: 260, useNativeDriver: true }),
            Animated.timing(barAnim1, { toValue: 0.2, duration: 260, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim2, { toValue: 0.15, duration: 320, useNativeDriver: true }),
            Animated.timing(barAnim2, { toValue: 0.95, duration: 320, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim3, { toValue: 1, duration: 380, useNativeDriver: true }),
            Animated.timing(barAnim3, { toValue: 0.25, duration: 380, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim4, { toValue: 0.2, duration: 240, useNativeDriver: true }),
            Animated.timing(barAnim4, { toValue: 1, duration: 240, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim5, { toValue: 0.9, duration: 350, useNativeDriver: true }),
            Animated.timing(barAnim5, { toValue: 0.15, duration: 350, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim6, { toValue: 0.2, duration: 300, useNativeDriver: true }),
            Animated.timing(barAnim6, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim7, { toValue: 0.95, duration: 400, useNativeDriver: true }),
            Animated.timing(barAnim7, { toValue: 0.2, duration: 400, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim8, { toValue: 0.2, duration: 270, useNativeDriver: true }),
            Animated.timing(barAnim8, { toValue: 0.85, duration: 270, useNativeDriver: true }),
          ]),
        ])
      );
      loopAnim.start();

      // Mic pulse glow loop
      micLoopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulseAnim, { toValue: 1.18, duration: 600, useNativeDriver: true }),
          Animated.timing(micPulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      );
      micLoopAnim.start();
    } else {
      barAnim1.setValue(0.25);
      barAnim2.setValue(0.65);
      barAnim3.setValue(0.4);
      barAnim4.setValue(0.95);
      barAnim5.setValue(0.5);
      barAnim6.setValue(0.85);
      barAnim7.setValue(0.35);
      barAnim8.setValue(0.7);
      micPulseAnim.setValue(1);
    }

    return () => {
      loopAnim?.stop();
      micLoopAnim?.stop();
    };
  }, [status, barAnim1, barAnim2, barAnim3, barAnim4, barAnim5, barAnim6, barAnim7, barAnim8, micPulseAnim]);

  // Auto scroll to latest message when messages array updates
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 120);
    }
  }, [messages, status]);

  // Auto scroll when keyboard opens
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const showSub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });

    return () => {
      showSub.remove();
    };
  }, []);

  const handleSendText = (textOverride?: string) => {
    const textToSend = (textOverride !== undefined ? textOverride : inputText).trim();
    if (!textToSend) return;
    setInputText("");
    sendMessage(textToSend);
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingText(message.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleSaveAndResendEdit = async (messageId: string) => {
    if (!editingText.trim()) return;
    const text = editingText.trim();
    setEditingMessageId(null);
    setEditingText("");
    await editMessageAndResend(messageId, text);
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore copy error
    }
  };


  const formatMessageTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusDetails = () => {
    switch (status) {
      case "listening":
        return {
          title: "Listening",
          badgeColor: "bg-emerald-500",
          ringColor: "border-emerald-400 bg-emerald-50",
          iconColor: "#059669",
        };
      case "thinking":
        return {
          title: "Processing",
          badgeColor: "bg-amber-500",
          ringColor: "border-amber-400 bg-amber-50",
          iconColor: "#d97706",
        };
      case "speaking":
        return {
          title: "Speaking",
          badgeColor: "bg-purple-500",
          ringColor: "border-purple-400 bg-purple-50",
          iconColor: "#9333ea",
        };
      case "error":
        return {
          title: "Error",
          badgeColor: "bg-rose-500",
          ringColor: "border-rose-300 bg-rose-50",
          iconColor: "#e11d48",
        };
      default:
        return {
          title: "Ready",
          badgeColor: "bg-slate-400",
          ringColor: "border-slate-200 bg-slate-50",
          iconColor: "#2563eb",
        };
    }
  };

  const statusInfo = getStatusDetails();

  // Message Bubble Item
  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    const isCopied = copiedId === item.id;
    const isEditingThis = editingMessageId === item.id;

    return (
      <View
        className={`my-2 max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "self-end rounded-br-sm bg-blue-600"
            : "self-start rounded-bl-sm border border-slate-200 bg-white"
        }`}
      >
        {/* Top Meta Line: Sender, Time & Actions */}
        <View className="mb-1.5 flex-row items-center justify-between gap-3">
          <View className="flex-row items-center">
            <View
              className={`mr-1.5 h-4 w-4 items-center justify-center rounded-full ${
                isUser ? "bg-blue-400" : "bg-indigo-100"
              }`}
            >
              <Ionicons
                name={isUser ? "person" : "sparkles"}
                size={10}
                color={isUser ? "#ffffff" : "#4f46e5"}
              />
            </View>
            <Text
              className={`text-xs font-semibold ${
                isUser ? "text-blue-100" : "text-slate-700"
              }`}
            >
              {isUser ? "You" : "Aivora"}
            </Text>
            {item.timestamp && (
              <Text
                className={`ml-2 text-[10px] ${
                  isUser ? "text-blue-200" : "text-slate-400"
                }`}
              >
                {formatMessageTime(item.timestamp)}
              </Text>
            )}
          </View>

          {/* Action Buttons: Edit, Copy & Replay Speak */}
          <View className="flex-row items-center gap-1.5">
            {/* Edit Button for User Messages */}
            {isUser && !isEditingThis && (
              <TouchableOpacity
                onPress={() => handleStartEdit(item)}
                className="p-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="create-outline" size={14} color="#bfdbfe" />
              </TouchableOpacity>
            )}

            {/* Copy Button */}
            <TouchableOpacity
              onPress={() => handleCopyMessage(item.id, item.text)}
              className="p-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isCopied ? "checkmark-circle" : "copy-outline"}
                size={14}
                color={isUser ? "#bfdbfe" : isCopied ? "#10b981" : "#94a3b8"}
              />
            </TouchableOpacity>

            {/* Voice playback for AI */}
            {!isUser && (
              <TouchableOpacity
                onPress={() => speak(item.text)}
                className="p-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="volume-high-outline" size={15} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Message Content: Normal View vs Inline Edit View */}
        {isEditingThis ? (
          <View className="mt-1 rounded-xl bg-blue-700/60 p-2">
            <TextInput
              value={editingText}
              onChangeText={setEditingText}
              multiline
              autoFocus
              className="text-base leading-5 text-white"
              style={{ minHeight: 40, maxHeight: 120 }}
            />
            <View className="mt-2 flex-row items-center justify-end gap-2">
              <TouchableOpacity
                onPress={handleCancelEdit}
                className="rounded-lg bg-blue-800/80 px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-blue-200">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSaveAndResendEdit(item.id)}
                className="flex-row items-center rounded-lg bg-white px-3 py-1.5 shadow-sm"
              >
                <Ionicons name="send" size={12} color="#2563eb" />
                <Text className="ml-1 text-xs font-bold text-blue-600">Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text
            selectable
            className={`text-base leading-6 ${
              isUser ? "text-white" : "text-slate-800"
            }`}
            style={{ flexShrink: 1, flexWrap: "wrap" }}
          >
            {item.text}
          </Text>
        )}

        {/* Copy Feedback Toast */}
        {isCopied && (
          <Text className="mt-1 text-[10px] font-medium text-emerald-600">
            ✓ Copied to clipboard
          </Text>
        )}
      </View>
    );
  };

  const waveBarColor = status === "listening" ? "#10b981" : "#8b5cf6";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        {/* Top Header with Model Selector */}
        <AivoraHeader />

        {/* Error Alert Box */}
        {error ? (
          <View className="mx-4 mt-3 flex-row items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3">
            <View className="flex-1 flex-row items-center pr-2">
              <Ionicons name="alert-circle" size={20} color="#e11d48" />
              <Text className="ml-2 text-xs font-medium text-rose-800">{error}</Text>
            </View>
            <TouchableOpacity onPress={resetError} className="p-1">
              <Ionicons name="close" size={18} color="#e11d48" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Conversation Message List & Empty State with Suggestion Prompts */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 px-4 py-2">
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center py-6">
                <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <Ionicons name="chatbubble-ellipses-outline" size={32} color="#2563eb" />
                </View>
                <Text className="text-center text-xl font-bold text-slate-900">
                  How can I help you today?
                </Text>
                <Text className="mt-1 px-8 text-center text-xs text-slate-500">
                  Tap the mic to talk or type your message.
                </Text>

                {/* Quick Suggestion Chips */}
                <View className="mt-6 w-full max-w-sm gap-2">
                  <Text className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Suggested Questions
                  </Text>
                  {SUGGESTION_PROMPTS.map((prompt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSendText(prompt.text)}
                      className="flex-row items-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:bg-blue-50"
                    >
                      <View className="mr-3 h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                        <Ionicons name={prompt.icon as any} size={16} color="#2563eb" />
                      </View>
                      <Text className="flex-1 text-sm font-medium text-slate-700">
                        {prompt.text}
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessageItem}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingVertical: 12 }}
                onScroll={(e) => {
                  const offsetY = e.nativeEvent.contentOffset.y;
                  const contentHeight = e.nativeEvent.contentSize.height;
                  const layoutHeight = e.nativeEvent.layoutMeasurement.height;
                  setShowScrollBottom(contentHeight - offsetY - layoutHeight > 150);
                }}
                scrollEventThrottle={100}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Scroll To Bottom Quick Button */}
        {showScrollBottom && (
          <TouchableOpacity
            onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
            className="absolute bottom-24 right-5 h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg active:bg-slate-100"
          >
            <Ionicons name="arrow-down" size={20} color="#475569" />
          </TouchableOpacity>
        )}

        {/* Dedicated Live Voice Graph Waveform Animation (Seamless, Transparent, No Background Box) */}
        {(status === "listening" || status === "speaking") && (
          <View className="mx-4 mb-2 items-center justify-center py-2">
            <View className="relative w-full flex-row items-center justify-center">
              {/* 8-Bar Waveform Frequency Visualizer Graph */}
              <View className="flex-row items-center justify-center gap-1.5 py-1">
                {[barAnim1, barAnim2, barAnim3, barAnim4, barAnim5, barAnim6, barAnim7, barAnim8].map(
                  (anim, i) => (
                    <Animated.View
                      key={i}
                      style={{
                        transform: [{ scaleY: anim }],
                        height: 28,
                        width: 4,
                        borderRadius: 3,
                        backgroundColor: waveBarColor,
                      }}
                    />
                  )
                )}
              </View>

              {status === "speaking" && (
                <TouchableOpacity
                  onPress={stopSpeaking}
                  className="absolute right-2 flex-row items-center rounded-full bg-slate-200/80 px-2.5 py-1 active:bg-slate-300"
                >
                  <Ionicons name="stop-circle" size={14} color="#475569" />
                  <Text className="ml-1 text-[11px] font-semibold text-slate-700">Stop</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* If user actual speech is recognized in real-time, show it cleanly */}
            {transcript && transcript.trim().length > 0 ? (
              <Text className="mt-1 text-center text-xs font-medium italic text-slate-700">
                "{transcript}"
              </Text>
            ) : null}
          </View>
        )}

        {/* Bottom Responsive Input & Controls Section */}
        <View className="bg-white px-4 py-3 shadow-sm">
          <View className="flex-row items-end justify-between">
            {/* Multi-line Expandable Input Box */}
            <View className="mr-3 flex-1 flex-row items-end rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Aivora anything..."
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={1000}
                className="flex-1 text-base leading-5 text-slate-900"
                style={{
                  minHeight: 28,
                  maxHeight: 110,
                  textAlignVertical: "center",
                }}
              />

              {/* Clear Input Button */}
              {inputText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setInputText("")}
                  className="mr-1.5 p-1"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}

              {/* Send Button */}
              {inputText.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => handleSendText()}
                  className="mb-0.5 rounded-full bg-blue-600 p-1 active:bg-blue-700 shadow-sm"
                >
                  <Ionicons name="arrow-up" size={18} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Microphone Action Button with Animated Pulse Wave */}
            <Animated.View style={{ transform: [{ scale: status === "listening" ? micPulseAnim : 1 }] }}>
              <TouchableOpacity
                onPress={toggleListening}
                activeOpacity={0.8}
                className={`h-12 w-12 items-center justify-center rounded-full border-2 shadow-md ${statusInfo.ringColor}`}
              >
                {status === "thinking" ? (
                  <ActivityIndicator size="small" color="#d97706" />
                ) : (
                  <Ionicons
                    name={
                      status === "listening"
                        ? "mic"
                        : status === "speaking"
                        ? "volume-medium"
                        : "mic-outline"
                    }
                    size={24}
                    color={statusInfo.iconColor}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Character counter / Web Notice */}
          {inputText.length > 0 ? (
            <View className="mt-1 flex-row items-center justify-end px-1">
              <Text className="text-[10px] text-slate-400">{inputText.length}/1000</Text>
            </View>
          ) : !isSTTSupported && Platform.OS === "web" ? (
            <View className="mt-1 flex-row items-center justify-center px-1">
              <Text className="text-[11px] text-amber-600">
                Speech recognition is best supported in Chrome / Edge.
              </Text>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
