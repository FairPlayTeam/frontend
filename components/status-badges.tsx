import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, View } from 'react-native';

export function StatusBadges(props: {
  visibility?: string;
  processingStatus?: string;
  moderationStatus?: string;
}) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  const items = [props.visibility, props.processingStatus, props.moderationStatus].filter(Boolean) as string[];
  if (!items.length) return null as any;
  return (
    <View style={styles.badgeRow}>
      {items.map((v) => (
        <Text key={v} style={[styles.badge, { borderColor: border, color: text }]}>{v}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
});
