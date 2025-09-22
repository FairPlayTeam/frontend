import { Link } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, Text } from 'react-native';

export default function NotFound() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">404</ThemedText>
      <Text style={styles.sub}>Page not found</Text>
      <Link href="/" replace style={styles.link}>Go home</Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  sub: { opacity: 0.7 },
  link: { marginTop: 8, fontWeight: '600' },
});
