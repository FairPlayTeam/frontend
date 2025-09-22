import { TextInput, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export function SearchInput(props: {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  returnKeyType?: 'search' | 'done' | 'go' | 'next' | 'send';
}) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder ?? 'Search'}
      placeholderTextColor={border}
      style={[styles.input, { borderColor: border, color: text }]}
      onSubmitEditing={props.onSubmit}
      returnKeyType={props.returnKeyType ?? 'search'}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10 },
});
