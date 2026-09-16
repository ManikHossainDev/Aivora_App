import { Text, TextInput, TextInputProps, View } from "react-native";

type TextInputFieldProps = TextInputProps & {
  label: string;
  className?: string;
};

export default function TextInputField({ label, className = "", ...props }: TextInputFieldProps) {
  return (
    <View className={className}>
      <Text className="mb-2 text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-base text-slate-950"
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  );
}
