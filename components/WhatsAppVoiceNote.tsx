import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChatMessage } from "@/types";
import { formatDuration } from "@/hooks/useVoiceAssistant";

// Natural speech waveform heights (28 sample frequencies)
const WAVEFORM_HEIGHTS = [
  10, 16, 8, 22, 28, 14, 10, 24, 18, 26, 20, 12, 24, 30, 22, 14, 20, 12, 28,
  18, 14, 22, 16, 12, 20, 10, 16, 8,
];

interface WhatsAppVoiceNoteProps {
  item: ChatMessage;
  index: number;
  isPlaying: boolean;
  playbackProgress?: number; // optional external or internal
  playbackElapsedSeconds?: number;
  onPlayPause: () => void;
  onCopy: (text: string) => void;
  isCopied?: boolean;
  onStartEdit?: (item: ChatMessage) => void;
  onReply?: (item: ChatMessage) => void;
  onToggleFeedback?: (id: string, type: "like" | "dislike") => void;
  userFeedback?: "like" | "dislike";
  onRegenerate?: (index: number) => void;
}

export const WhatsAppVoiceNote: React.FC<WhatsAppVoiceNoteProps> = React.memo(({
  item,
  index,
  isPlaying,
  playbackProgress: externalProgress,
  playbackElapsedSeconds: externalElapsed,
  onPlayPause,
  onCopy,
  isCopied,
  onStartEdit,
  onToggleFeedback,
  userFeedback,
  onRegenerate,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [localElapsed, setLocalElapsed] = useState(0);
  const isUser = item.role === "user";

  // Isolate high-frequency timer locally inside the active voice note
  useEffect(() => {
    if (!isPlaying) {
      setLocalProgress(0);
      setLocalElapsed(0);
      return;
    }

    const totalDur = item.audioDurationSeconds || 5;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setLocalElapsed(Math.min(elapsed, totalDur));
      setLocalProgress(Math.min(1, elapsed / totalDur));
    }, 100);

    return () => clearInterval(timer);
  }, [isPlaying, item.audioDurationSeconds]);

  const activeProgress = externalProgress !== undefined && externalProgress > 0 ? externalProgress : localProgress;
  const activeElapsed = externalElapsed !== undefined && externalElapsed > 0 ? externalElapsed : localElapsed;

  const totalBars = WAVEFORM_HEIGHTS.length;
  const activeBarIndex = isPlaying
    ? Math.floor(activeProgress * totalBars)
    : 0;

  // Display timer: during playback show elapsed, otherwise show total duration
  const displayTimer = isPlaying
    ? formatDuration(Math.floor(activeElapsed))
    : item.audioDuration || "0:05";

  const formatMessageTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isUser) {
    // -------------------------------------------------------------
    // USER WHATSAPP VOICE NOTE (Right Aligned, WhatsApp Soft Green)
    // -------------------------------------------------------------
    return (
      <View className="my-2.5 max-w-[88%] self-end">
        {/* WhatsApp Voice Note Capsule */}
        <View className="rounded-2xl rounded-tr-sm border border-[#c3ebb0] bg-[#d9fdd3] px-3.5 py-3 shadow-sm">
          {/* Main Voice Note Player Row */}
          <View className="flex-row items-center">
            {/* WhatsApp Green Play/Pause Button */}
            <TouchableOpacity
              onPress={onPlayPause}
              activeOpacity={0.8}
              className="h-11 w-11 items-center justify-center rounded-full bg-[#00a884] shadow-sm"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={22}
                color="#ffffff"
                style={{ marginLeft: isPlaying ? 0 : 2 }}
              />
            </TouchableOpacity>

            {/* Waveform Visualizer & Duration */}
            <View className="ml-3 flex-1">
              {/* Waveform Frequency Bars */}
              <View className="flex-row items-center justify-between h-8">
                {WAVEFORM_HEIGHTS.map((height, barIdx) => {
                  const isBarPlayed = isPlaying && barIdx <= activeBarIndex;
                  const barColor = isBarPlayed ? "#00a884" : "#8696a0";

                  return (
                    <View
                      key={barIdx}
                      style={{
                        height,
                        width: 3,
                        borderRadius: 2,
                        backgroundColor: barColor,
                        marginHorizontal: 1,
                      }}
                    />
                  );
                })}
              </View>

              {/* Duration Timer & Mic Meta Row */}
              <View className="mt-1 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-slate-600">
                  {displayTimer}
                </Text>

                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[10px] font-medium text-slate-500">
                    {formatMessageTime(item.timestamp)}
                  </Text>
                  {/* WhatsApp Blue Double Checkmark */}
                  <Ionicons name="checkmark-done" size={15} color="#34b7f1" />
                </View>
              </View>
            </View>

            {/* Mic Badge */}
            <View className="ml-2.5 h-8 w-8 items-center justify-center rounded-full bg-[#00a884]/15">
              <Ionicons name="mic" size={17} color="#00a884" />
            </View>
          </View>

          {/* Transcript Toggle Header */}
          <TouchableOpacity
            onPress={() => setShowTranscript((prev) => !prev)}
            activeOpacity={0.7}
            className="mt-2.5 flex-row items-center justify-between border-t border-[#bbf0a7] pt-2"
          >
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={13} color="#475569" />
              <Text className="ml-1 text-[11px] font-bold text-slate-700">
                {showTranscript ? "Hide Transcript" : "View Transcript"}
              </Text>
            </View>

            <Ionicons
              name={showTranscript ? "chevron-up" : "chevron-down"}
              size={14}
              color="#475569"
            />
          </TouchableOpacity>

          {/* Expanded Transcript Box */}
          {showTranscript && (
            <View className="mt-2 rounded-xl bg-white/70 p-2.5">
              <Text
                selectable
                className="text-sm leading-5 text-slate-900"
              >
                {item.text}
              </Text>

              {/* Action Buttons */}
              <View className="mt-2 flex-row items-center justify-end gap-2">
                {onStartEdit && (
                  <TouchableOpacity
                    onPress={() => onStartEdit(item)}
                    className="flex-row items-center rounded-full bg-slate-200/80 px-2.5 py-1 active:bg-slate-300"
                  >
                    <Ionicons name="create-outline" size={12} color="#475569" />
                    <Text className="ml-1 text-[10px] font-semibold text-slate-700">
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => onCopy(item.text)}
                  className="flex-row items-center rounded-full bg-slate-200/80 px-2.5 py-1 active:bg-slate-300"
                >
                  <Ionicons
                    name={isCopied ? "checkmark" : "copy-outline"}
                    size={12}
                    color={isCopied ? "#10b981" : "#475569"}
                  />
                  <Text className="ml-1 text-[10px] font-semibold text-slate-700">
                    {isCopied ? "Copied" : "Copy"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // AI WHATSAPP VOICE NOTE (Left Aligned, Modern Slate/White Bubble)
  // -------------------------------------------------------------
  return (
    <View className="my-2.5 max-w-[90%] self-start">
      {/* WhatsApp Received Voice Note Bubble */}
      <View className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
        {/* Main Voice Note Player Row */}
        <View className="flex-row items-center">
          {/* AI Voice Play/Pause Button */}
          <TouchableOpacity
            onPress={onPlayPause}
            activeOpacity={0.8}
            className="h-11 w-11 items-center justify-center rounded-full bg-blue-600 shadow-sm"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={22}
              color="#ffffff"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          </TouchableOpacity>

          {/* Waveform Visualizer & Duration */}
          <View className="ml-3 flex-1">
            {/* Waveform Frequency Bars */}
            <View className="flex-row items-center justify-between h-8">
              {WAVEFORM_HEIGHTS.map((height, barIdx) => {
                const isBarPlayed = isPlaying && barIdx <= activeBarIndex;
                const barColor = isBarPlayed ? "#2563eb" : "#94a3b8";

                return (
                  <View
                    key={barIdx}
                    style={{
                      height,
                      width: 3,
                      borderRadius: 2,
                      backgroundColor: barColor,
                      marginHorizontal: 1,
                    }}
                  />
                );
              })}
            </View>

            {/* Duration Timer & Timestamp Meta Row */}
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-slate-600">
                {displayTimer}
              </Text>

              <Text className="text-[10px] font-medium text-slate-400">
                {formatMessageTime(item.timestamp)}
              </Text>
            </View>
          </View>

          {/* Aivora AI Voice Sparkle Badge */}
          <View className="ml-2.5 h-8 w-8 items-center justify-center rounded-full bg-blue-50">
            <Ionicons name="sparkles" size={16} color="#2563eb" />
          </View>
        </View>

        {/* Transcript Toggle Header */}
        <TouchableOpacity
          onPress={() => setShowTranscript((prev) => !prev)}
          activeOpacity={0.7}
          className="mt-2.5 flex-row items-center justify-between border-t border-slate-100 pt-2"
        >
          <View className="flex-row items-center">
            <Ionicons name="document-text-outline" size={13} color="#2563eb" />
            <Text className="ml-1 text-[11px] font-bold text-blue-600">
              {showTranscript ? "Hide Transcript" : "View Transcript"}
            </Text>
          </View>

          <Ionicons
            name={showTranscript ? "chevron-up" : "chevron-down"}
            size={14}
            color="#64748b"
          />
        </TouchableOpacity>

        {/* Expanded Transcript Box */}
        {showTranscript && (
          <View className="mt-2 rounded-xl bg-slate-50 p-2.5">
            <Text
              selectable
              className="text-sm leading-6 text-slate-800"
            >
              {item.text}
            </Text>

            {/* AI Action Tool Buttons */}
            <View className="mt-2.5 flex-row items-center justify-between border-t border-slate-200/60 pt-2">
              <View className="flex-row items-center gap-1">
                {/* Copy */}
                <TouchableOpacity
                  onPress={() => onCopy(item.text)}
                  className="rounded-full p-1.5 active:bg-slate-200"
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons
                    name={isCopied ? "checkmark-circle" : "copy-outline"}
                    size={15}
                    color={isCopied ? "#10b981" : "#64748b"}
                  />
                </TouchableOpacity>

                {/* Thumbs Up */}
                {onToggleFeedback && (
                  <TouchableOpacity
                    onPress={() => onToggleFeedback(item.id, "like")}
                    className="rounded-full p-1.5 active:bg-slate-200"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons
                      name={userFeedback === "like" ? "thumbs-up" : "thumbs-up-outline"}
                      size={15}
                      color={userFeedback === "like" ? "#2563eb" : "#64748b"}
                    />
                  </TouchableOpacity>
                )}

                {/* Thumbs Down */}
                {onToggleFeedback && (
                  <TouchableOpacity
                    onPress={() => onToggleFeedback(item.id, "dislike")}
                    className="rounded-full p-1.5 active:bg-slate-200"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons
                      name={userFeedback === "dislike" ? "thumbs-down" : "thumbs-down-outline"}
                      size={15}
                      color={userFeedback === "dislike" ? "#e11d48" : "#64748b"}
                    />
                  </TouchableOpacity>
                )}

                {/* Regenerate */}
                {onRegenerate && (
                  <TouchableOpacity
                    onPress={() => onRegenerate(index)}
                    className="rounded-full p-1.5 active:bg-slate-200"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="reload-outline" size={14} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>

              {isCopied && (
                <Text className="text-[10px] font-semibold text-emerald-600">
                  ✓ Copied
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
});
