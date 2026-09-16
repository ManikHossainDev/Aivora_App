import { Pressable, PressableProps, Text } from "react-native";

type PrimaryButtonProps = PressableProps & {
  title: string;
  className?: string;
};

export default function PrimaryButton({ title, className = "", ...props }: PrimaryButtonProps) {
  return (
    <Pressable
      className={`h-12 items-center justify-center rounded-lg bg-sky-600 px-5 active:bg-sky-700 disabled:opacity-60 ${className}`}
      {...props}
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
    </Pressable>
  );
}
