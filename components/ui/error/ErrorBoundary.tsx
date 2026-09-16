import React from "react";
import { Text, View } from "react-native";

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-center text-lg font-semibold text-slate-950">
            Something went wrong.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
