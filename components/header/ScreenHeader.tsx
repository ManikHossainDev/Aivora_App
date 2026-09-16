import { Text, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View>
      <Text className="text-2xl font-bold text-slate-950">{title}</Text>
      {subtitle ? <Text className="mt-1 text-base text-slate-500">{subtitle}</Text> : null}
    </View>
  );
}
