import AuthHeader from "@/components/header/AuthHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import TextInputField from "@/components/ui/inputs/TextInputField";
import { useAuthStore } from "@/stores/authStore";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    login({ email });
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to continue to your app."
        />

        <View className="mt-8 gap-4">
          <TextInputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextInputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
          />
        </View>

        <TouchableOpacity
          className="mt-4 self-end"
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text className="font-medium text-sky-600">Forgot password?</Text>
        </TouchableOpacity>

        <PrimaryButton className="mt-8" title="Log in" onPress={handleSubmit} />

        <View className="mt-8 flex-row justify-center">
          <Text className="text-slate-500">Do not have an account? </Text>
          <Link href="/(auth)/signup">
            <Text className="font-semibold text-slate-950">Create one</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
