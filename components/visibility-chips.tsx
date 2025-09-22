import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type Visibility = 'public' | 'unlisted' | 'private';

export function VisibilityChips(props: {
  value: Visibility;
  onChange: (v: Visibility) => void;
}) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  return (
    <View style={styles.row}>
      {(['public','unlisted','private'] as const).map((v) => (
        <Pressable
          key={v}
          onPress={() => props.onChange(v)}
          style={[
            styles.chip,
            {
              borderColor: props.value === v ? '#3b82f6' : borderColor,
              backgroundColor: props.value === v ? '#0b1220' : 'transparent',
            },
          ]}
        >
          <Text style={{ color: textColor }}>{v}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
});
