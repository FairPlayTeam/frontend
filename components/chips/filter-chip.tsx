import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export function FilterChip(props: {
  label: string;
  selected?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  return (
    <Pressable onPress={props.onPress} style={[styles.chip, { borderColor: border, backgroundColor: props.selected ? '#111' : 'transparent' }, props.style]}> 
      <Text style={{ color: text }}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
});
