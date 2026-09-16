import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { WhatsAppVoiceNote } from "@/components/WhatsAppVoiceNote";

// Gemini-style Prompt Suggestion Cards
const SUGGESTION_PROMPTS = [
  {
    icon: "bulb-outline",
    iconColor: "#eab308",
    iconBg: "bg-amber-50",
    title: "Brainstorm Ideas",
    desc: "Innovative tech startup & app concepts",
    text: "Brainstorm 3 innovative tech startup ideas with execution roadmap.",
  },
  {
    icon: "flash-outline",
    iconColor: "#3b82f6",
    iconBg: "bg-blue-50",
    title: "Peak Productivity",
    desc: "Daily habits for high performance",
    text: "Give me 5 proven daily habits for peak productivity and focus.",
  },
  {
    icon: "mail-outline",
    iconColor: "#10b981",
    iconBg: "bg-emerald-50",
    title: "Draft an Email",
    desc: "Polite follow-up business email",
    text: "Draft a polite and professional follow-up email for a project proposal.",
  },
  {
    icon: "code-slash-outline",
    iconColor: "#8b5cf6",
    iconBg: "bg-purple-50",
    title: "Explain Complex Tech",
    desc: "Quantum computing in simple terms",
    text: "Explain quantum computing and neural networks in simple analogies.",
  },
];

export default function HomeScreen() {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, "like" | "dislike">>({});
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Message Inline Editing State
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
    currentlyPlayingId,
    playbackProgress,
    playbackElapsedSeconds,
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

      micLoopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
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

  // Auto scroll to latest message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 120);
    }
  }, [messages, status]);

  // Keyboard listener for auto-scroll & offset tracking
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const keyboardH = e.endCoordinates?.height || 0;
      setKeyboardHeight(keyboardH);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSendText = (textOverride?: string) => {
    const textToSend = (textOverride !== undefined ? textOverride : inputText).trim();
    if (!textToSend) return;
    setInputText("");
    sendMessage(textToSend);
  };

  const handleStartEdit = useCallback((message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingText(message.text);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingText("");
  }, []);

  const handleSaveAndResendEdit = useCallback(async (messageId: string) => {
    if (!editingText.trim()) return;
    const text = editingText.trim();
    setEditingMessageId(null);
    setEditingText("");
    await editMessageAndResend(messageId, text);
  }, [editingText, editMessageAndResend]);

  const handleCopyMessage = useCallback(async (id: string, text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore copy error
    }
  }, []);

  const handleToggleFeedback = useCallback((id: string, type: "like" | "dislike") => {
    setLikedIds((prev) => ({
      ...prev,
      [id]: prev[id] === type ? (undefined as any) : type,
    }));
  }, []);

  const handleRegenerate = useCallback(async (index: number) => {
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        await sendMessage(messages[i].text);
        break;
      }
    }
  }, [messages, sendMessage]);

  const formatMessageTime = useCallback((timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Render WhatsApp Voice Note or Standard Text Message
  const renderMessageItem = useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.role === "user";
    const isCopied = copiedId === item.id;
    const isEditingThis = editingMessageId === item.id;
    const userFeedback = likedIds[item.id];
    const isPlayingThis = currentlyPlayingId === item.id;

    // 1. WhatsApp-Style Voice Message Capsule (both User Voice Note & AI Voice Note)
    if (item.isVoice) {
      return (
        <WhatsAppVoiceNote
          item={item}
          index={index}
          isPlaying={isPlayingThis}
          playbackProgress={playbackProgress}
          playbackElapsedSeconds={playbackElapsedSeconds}
          onPlayPause={() => {
            if (isPlayingThis) {
              stopSpeaking();
            } else {
              speak(item.text, item.id);
            }
          }}
          onCopy={(text) => handleCopyMessage(item.id, text)}
          isCopied={isCopied}
          onStartEdit={isUser ? handleStartEdit : undefined}
          onToggleFeedback={!isUser ? handleToggleFeedback : undefined}
          userFeedback={userFeedback}
          onRegenerate={!isUser ? handleRegenerate : undefined}
        />
      );
    }

    // 2. Standard Gemini User Text Message
    if (isUser) {
      return (
        <View className="my-2.5 max-w-[85%] self-end">
          <View className="rounded-3xl rounded-tr-md bg-[#e9eef6] px-4 py-3 shadow-sm">
            {isEditingThis ? (
              <View>
                <TextInput
                  value={editingText}
                  onChangeText={setEditingText}
                  multiline
                  autoFocus
                  className="text-base leading-5 text-slate-900"
                  style={{ minHeight: 40, maxHeight: 120 }}
                />
                <View className="mt-2.5 flex-row items-center justify-end gap-2">
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    className="rounded-full bg-slate-200 px-3 py-1"
                  >
                    <Text className="text-xs font-semibold text-slate-600">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSaveAndResendEdit(item.id)}
                    className="flex-row items-center rounded-full bg-blue-600 px-3.5 py-1 shadow-sm"
                  >
                    <Ionicons name="send" size={11} color="#ffffff" />
                    <Text className="ml-1 text-xs font-bold text-white">Resend</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row items-end">
                <Text
                  selectable
                  className="text-base leading-6 text-slate-900 mr-2"
                  style={{ flexShrink: 1 }}
                >
                  {item.text}
                </Text>
                <TouchableOpacity
                  onPress={() => handleStartEdit(item)}
                  className="ml-2 p-1 opacity-70 active:opacity-100"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="create-outline" size={15} color="#475569" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {item.timestamp && (
            <Text className="mr-2 mt-1 self-end text-[10px] text-slate-400">
              {formatMessageTime(item.timestamp)}
            </Text>
          )}
        </View>
      );
    }

    // 3. Standard Gemini AI Text Message
    return (
      <View className="my-3 w-full self-start pr-4">
        <View className="flex-row items-start">
          {/* Sparkle AI Icon */}
          <View className="mr-3 mt-1 h-7 w-7 items-center justify-center rounded-full bg-blue-50">
            <Ionicons name="sparkles" size={15} color="#2563eb" />
          </View>

          <View className="flex-1">
            {/* AI Text Response */}
            <Text
              selectable
              className="text-base leading-7 text-slate-800"
              style={{ flexShrink: 1 }}
            >
              {item.text}
            </Text>

            {/* Copy Feedback Toast */}
            {isCopied && (
              <Text className="mt-1 text-[11px] font-semibold text-emerald-600">
                ✓ Copied to clipboard
              </Text>
            )}

            {/* Action Row */}
            <View className="mt-2.5 flex-row items-center gap-1">
              {/* Audio Listen */}
              <TouchableOpacity
                onPress={() => (isPlayingThis ? stopSpeaking() : speak(item.text, item.id))}
                className="rounded-full p-2 active:bg-slate-100"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons
                  name={isPlayingThis ? "stop-circle" : "volume-medium-outline"}
                  size={16}
                  color={isPlayingThis ? "#2563eb" : "#64748b"}
                />
              </TouchableOpacity>

              {/* Copy */}
              <TouchableOpacity
                onPress={() => handleCopyMessage(item.id, item.text)}
                className="rounded-full p-2 active:bg-slate-100"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons
                  name={isCopied ? "checkmark-circle" : "copy-outline"}
                  size={16}
                  color={isCopied ? "#10b981" : "#64748b"}
                />
              </TouchableOpacity>

              {/* Thumbs Up (Helpful) */}
              <TouchableOpacity
                onPress={() => handleToggleFeedback(item.id, "like")}
                className="rounded-full p-2 active:bg-slate-100"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons
                  name={userFeedback === "like" ? "thumbs-up" : "thumbs-up-outline"}
                  size={15}
                  color={userFeedback === "like" ? "#2563eb" : "#64748b"}
                />
              </TouchableOpacity>

              {/* Thumbs Down */}
              <TouchableOpacity
                onPress={() => handleToggleFeedback(item.id, "dislike")}
                className="rounded-full p-2 active:bg-slate-100"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons
                  name={userFeedback === "dislike" ? "thumbs-down" : "thumbs-down-outline"}
                  size={15}
                  color={userFeedback === "dislike" ? "#e11d48" : "#64748b"}
                />
              </TouchableOpacity>

              {/* Regenerate / Retry Response */}
              <TouchableOpacity
                onPress={() => handleRegenerate(index)}
                className="rounded-full p-2 active:bg-slate-100"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="reload-outline" size={15} color="#64748b" />
              </TouchableOpacity>

              {item.timestamp && (
                <Text className="ml-2 text-[10px] text-slate-400">
                  {formatMessageTime(item.timestamp)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }, [
    copiedId,
    editingMessageId,
    editingText,
    likedIds,
    currentlyPlayingId,
    playbackProgress,
    playbackElapsedSeconds,
    handleCancelEdit,
    handleSaveAndResendEdit,
    handleStartEdit,
    handleCopyMessage,
    handleToggleFeedback,
    handleRegenerate,
    stopSpeaking,
    speak,
    formatMessageTime,
  ]);

  const waveBarColor = status === "listening" ? "#10b981" : "#8b5cf6";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        className="flex-1"
      >
        {/* Top Header with AI Model Switcher & New Chat Button */}
        <AivoraHeader onNewChat={clearHistory} />

        {/* Error Alert Box */}
        {error ? (
          <View className="mx-4 mt-2 flex-row items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <View className="flex-1 flex-row items-center pr-2">
              <Ionicons name="alert-circle" size={18} color="#e11d48" />
              <Text className="ml-2 text-xs font-medium text-rose-800">{error}</Text>
            </View>
            <TouchableOpacity onPress={resetError} className="p-1">
              <Ionicons name="close" size={16} color="#e11d48" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Conversation List & Gemini Welcome Hero */}
        <View className="flex-1 px-4">
          {messages.length === 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 20 }}
            >
              {/* Gemini Hero Greeting */}
              <View className="mb-6">
                <View className="flex-row items-center">
                  <Text className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Hello,
                  </Text>
                  <View className="ml-2 h-2.5 w-2.5 rounded-full bg-blue-600" />
                </View>
                <Text className="mt-1 text-2xl font-bold tracking-tight text-slate-400">
                  How can I help you today?
                </Text>
              </View>

              {/* Gemini Suggestion Cards Grid */}
              <View className="gap-2.5">
                {SUGGESTION_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSendText(prompt.text)}
                    className="flex-row items-center justify-between rounded-2xl bg-[#f0f4f9] p-4 active:bg-slate-200"
                  >
                    <View className="flex-row items-center flex-1 pr-3">
                      <View
                        className={`mr-3 h-9 w-9 items-center justify-center rounded-xl ${prompt.iconBg}`}
                      >
                        <Ionicons name={prompt.icon as any} size={18} color={prompt.iconColor} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-slate-800">{prompt.title}</Text>
                        <Text className="mt-0.5 text-xs text-slate-500">{prompt.desc}</Text>
                      </View>
                    </View>

                    <Ionicons name="arrow-forward" size={15} color="#94a3b8" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessageItem}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ paddingVertical: 12, paddingBottom: 8 }}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={7}
              removeClippedSubviews={Platform.OS === "android"}
              onScroll={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                const contentHeight = e.nativeEvent.contentSize.height;
                const layoutHeight = e.nativeEvent.layoutMeasurement.height;
                setShowScrollBottom(contentHeight - offsetY - layoutHeight > 150);
              }}
              scrollEventThrottle={16}
              ListFooterComponent={
                status === "thinking" ? (
                  <View className="my-3 flex-row items-center">
                    <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-blue-50">
                      <Ionicons name="sparkles" size={14} color="#2563eb" />
                    </View>
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#2563eb" />
                      <Text className="ml-2 text-xs font-semibold text-slate-500">
                        Aivora is thinking...
                      </Text>
                    </View>
                  </View>
                ) : null
              }
            />
          )}
        </View>

        {/* Scroll To Bottom Floating Button */}
        {showScrollBottom && (
          <TouchableOpacity
            onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
            className="absolute bottom-24 right-5 h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg active:bg-slate-100"
          >
            <Ionicons name="arrow-down" size={18} color="#475569" />
          </TouchableOpacity>
        )}

        {/* Floating Voice Waveform Graph Animation */}
        {(status === "listening" || status === "speaking") && (
          <View className="mx-4 mb-2 items-center justify-center py-2">
            <View className="relative w-full flex-row items-center justify-center">
              {/* 8-Bar Waveform Frequency Visualizer */}
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
                  className="absolute right-2 flex-row items-center rounded-full bg-slate-200/90 px-3 py-1 active:bg-slate-300"
                >
                  <Ionicons name="stop-circle" size={14} color="#475569" />
                  <Text className="ml-1 text-xs font-semibold text-slate-700">Stop</Text>
                </TouchableOpacity>
              )}
            </View>

            {transcript && transcript.trim().length > 0 ? (
              <Text className="mt-1 text-center text-xs font-medium italic text-slate-700">
                "{transcript}"
              </Text>
            ) : null}
          </View>
        )}

        {/* Gemini-Style Floating Pill Chatbox Input Bar - STAYS ABOVE KEYBOARD */}
        <View className="px-4 pb-3 pt-1" style={{ marginBottom: Platform.OS === "android" ? 0 : 0 }}>
          <View className="flex-row items-end rounded-[28px] bg-[#f0f4f9] px-4 py-2 shadow-sm">
            {/* Expandable Text Input */}
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Aivora..."
              placeholderTextColor="#94a3b8"
              multiline
              scrollEnabled
              maxLength={2000}
              className="flex-1 text-base leading-5 text-slate-900"
              style={{
                minHeight: 34,
                maxHeight: 120,
                textAlignVertical: "top",
                paddingTop: Platform.OS === "android" ? 6 : 4,
                paddingBottom: Platform.OS === "android" ? 6 : 4,
              }}
            />

            {/* Clear Text Button */}
            {inputText.length > 0 && (
              <TouchableOpacity
                onPress={() => setInputText("")}
                className="mb-1 mr-1 p-1"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}

            {/* Right Action: Send Button (if text entered) OR Mic Button (if empty) */}
            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                onPress={() => handleSendText()}
                className="mb-0.5 ml-1 h-9 w-9 items-center justify-center rounded-full bg-blue-600 shadow-sm active:bg-blue-700"
              >
                <Ionicons name="arrow-up" size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <Animated.View style={{ transform: [{ scale: status === "listening" ? micPulseAnim : 1 }] }}>
                <TouchableOpacity
                  onPress={toggleListening}
                  className={`mb-0.5 ml-1 h-9 w-9 items-center justify-center rounded-full ${
                    status === "listening" ? "bg-emerald-500" : "bg-transparent active:bg-slate-200"
                  }`}
                >
                  <Ionicons
                    name={status === "listening" ? "mic" : "mic-outline"}
                    size={22}
                    color={status === "listening" ? "#ffffff" : "#475569"}
                  />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}