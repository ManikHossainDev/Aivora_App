import AuthHeader from "@/components/header/AuthHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import TextInputField from "@/components/ui/inputs/TextInputField";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }

    Alert.alert("Check your inbox", "Password reset flow is ready for your API.");
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
        <AuthHeader title="Reset password" subtitle="Enter your email to continue." />
        <TextInputField
          className="mt-8"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <PrimaryButton className="mt-8" title="Send reset link" onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
