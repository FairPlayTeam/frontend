import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export function EmptyState(props: { message: string }) {
  const text = useThemeColor({}, 'text');
  return (
    <View style={styles.wrap}>
      <Text style={[styles.msg, { color: text }]}>{props.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 24, alignItems: 'center', justifyContent: 'center' },
  msg: { opacity: 0.8 },
});
