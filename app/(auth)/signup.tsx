import AuthHeader from "@/components/header/AuthHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import TextInputField from "@/components/ui/inputs/TextInputField";
import { useAuthStore } from "@/stores/authStore";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!name || !email || !password) {
      Alert.alert("Missing fields", "Please complete the form.");
      return;
    }

    login({ name, email });
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
        <AuthHeader title="Create account" subtitle="Start with a clean template." />

        <View className="mt-8 gap-4">
          <TextInputField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
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
            placeholder="Create password"
          />
        </View>

        <PrimaryButton className="mt-8" title="Sign up" onPress={handleSubmit} />

        <View className="mt-8 flex-row justify-center">
          <Text className="text-slate-500">Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="font-semibold text-slate-950">Log in</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
