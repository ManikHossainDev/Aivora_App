import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AIVORA_MODELS, AivoraModelOption, useModelStore } from "@/stores/modelStore";

interface AivoraHeaderProps {
  subtitle?: string;
}

export function AivoraHeader({ subtitle }: AivoraHeaderProps) {
  const selectedModel = useModelStore((state) => state.selectedModel);
  const setModel = useModelStore((state) => state.setModel);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectModel = (model: AivoraModelOption) => {
    setModel(model);
    setModalVisible(false);
  };

  return (
    <>
      <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow-sm">
        {/* Left: Branding */}
        <View className="flex-row items-center">
          <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <Ionicons name="sparkles" size={18} color="#ffffff" />
          </View>
          <View>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold tracking-tight text-slate-900">Aivora</Text>
              <View className="ml-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            </View>
            <Text className="text-[11px] font-medium text-slate-500">
              {subtitle || selectedModel.displayName}
            </Text>
          </View>
        </View>

        {/* Right: Interactive Model Version Selector Pill */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="h-9 flex-row items-center justify-center rounded-xl border border-blue-200 bg-blue-50/90 px-3 shadow-sm active:bg-blue-100"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="hardware-chip-outline" size={15} color="#2563eb" />
          <Text className="mx-1.5 text-xs font-bold text-blue-700">
            {selectedModel.shortName}
          </Text>
          <Ionicons name="chevron-down" size={13} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Model Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/40 px-5">
            <TouchableWithoutFeedback>
              <View className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                {/* Modal Header */}
                <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                  <View className="flex-row items-center">
                    <View className="mr-2.5 h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                      <Ionicons name="hardware-chip" size={15} color="#2563eb" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-slate-900">Select AI Version</Text>
                      <Text className="text-[10px] text-slate-500">Switch Aivora intelligence engine</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="p-1 rounded-full active:bg-slate-100"
                  >
                    <Ionicons name="close" size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Model Options List */}
                <View className="mt-3 gap-2">
                  {AIVORA_MODELS.map((model) => {
                    const isSelected = selectedModel.id === model.id;
                    return (
                      <TouchableOpacity
                        key={model.id}
                        onPress={() => handleSelectModel(model)}
                        className={`flex-row items-center justify-between rounded-xl border p-3 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60"
                            : "border-slate-200 bg-white active:bg-slate-50"
                        }`}
                      >
                        <View className="flex-1 pr-2">
                          <View className="flex-row items-center mb-0.5">
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? "text-blue-700" : "text-slate-900"
                              }`}
                            >
                              {model.displayName}
                            </Text>
                            <View
                              className={`ml-1.5 rounded-full px-1.5 py-0.5 ${
                                isSelected ? "bg-blue-200/70" : "bg-slate-100"
                              }`}
                            >
                              <Text
                                className={`text-[9px] font-semibold ${
                                  isSelected ? "text-blue-800" : "text-slate-600"
                                }`}
                              >
                                {model.badge}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-[11px] text-slate-500 leading-4">{model.description}</Text>
                        </View>

                        <View
                          className={`h-4 w-4 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Ionicons name="checkmark" size={11} color="#ffffff" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
