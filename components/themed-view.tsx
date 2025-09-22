import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const flat = StyleSheet.flatten(style) || {};
  const merged = { ...flat, backgroundColor } as any;
  return <View style={merged} {...otherProps} />;
}
