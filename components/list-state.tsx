import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export function LoadingState() {
  return (
    <View style={styles.center}> 
      <ActivityIndicator />
    </View>
  );
}

export function ErrorState(props: { message?: string; onRetry?: () => void }) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  return (
    <View style={styles.center}>
      <Text style={{ color: text }}>{props.message || 'Something went wrong'}</Text>
      {props.onRetry ? (
        <Pressable onPress={props.onRetry} style={[styles.btn, { borderColor: border }]}> 
          <Text style={{ color: text }}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ListState(props: { loading?: boolean; error?: string | null; onRetry?: () => void; children: any }) {
  if (props.loading) return <LoadingState />;
  if (props.error) return <ErrorState message={props.error} onRetry={props.onRetry} />;
  return props.children;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  btn: { marginTop: 8, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
});
