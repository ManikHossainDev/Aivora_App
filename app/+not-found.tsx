import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-2xl font-semibold text-slate-950">
          Page not found
        </Text>
        <Text className="mb-8 text-center text-base text-slate-500">
          This screen is not available in the starter template.
        </Text>
        <Link href="/(tabs)/home" asChild>
          <PrimaryButton title="Go home" />
        </Link>
      </View>
    </SafeAreaView>
  );
}
