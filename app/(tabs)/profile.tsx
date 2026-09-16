import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/authStore";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5 py-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold tracking-tight text-slate-900">My Profile</Text>
          <Text className="mt-0.5 text-xs text-slate-500">Manage account information</Text>
        </View>

        {/* User Card */}
        <View className="mb-6 items-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-blue-600 shadow-md">
            <Ionicons name="person" size={36} color="#ffffff" />
          </View>
          <Text className="text-lg font-bold text-slate-900">
            {user?.name || "Aivora User"}
          </Text>
          <Text className="text-xs text-slate-500">{user?.email || "user@example.com"}</Text>

          <View className="mt-4 flex-row items-center rounded-full bg-emerald-50 px-3 py-1">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            <Text className="text-xs font-medium text-emerald-700">Account Active</Text>
          </View>
        </View>

        {/* Account Details */}
        <View className="mb-6">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account Details
          </Text>
          <View className="rounded-2xl border border-slate-200 bg-white p-4">
            <View className="flex-row items-center justify-between border-b border-slate-100 pb-3">
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={16} color="#64748b" />
                <Text className="ml-2 text-xs text-slate-500">Email Address</Text>
              </View>
              <Text className="text-xs font-semibold text-slate-800">
                {user?.email || "user@example.com"}
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-b border-slate-100 py-3">
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark-outline" size={16} color="#64748b" />
                <Text className="ml-2 text-xs text-slate-500">History Privacy</Text>
              </View>
              <Text className="text-xs font-semibold text-slate-800">Local Only (24h)</Text>
            </View>

            <View className="flex-row items-center justify-between pt-3">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text className="ml-2 text-xs text-slate-500">Member Since</Text>
              </View>
              <Text className="text-xs font-semibold text-slate-800">2026</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
