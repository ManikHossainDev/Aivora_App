import { Text, View } from "react-native";

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View>
      <Text className="text-3xl font-bold text-slate-950">{title}</Text>
      {subtitle ? (
        <Text className="mt-2 text-base leading-6 text-slate-500">{subtitle}</Text>
      ) : null}
    </View>
  );
}
