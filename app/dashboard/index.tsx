import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMe } from '@/services/account';

export default function AccountScreen() {
  const text = useThemeColor({}, 'text');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    let mounted = true;
    getMe()
      .then((m) => {
        if (!mounted) return;
        setEmail(m.email);
        setUsername(m.username);
        setCreatedAt(m.createdAt);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Account</ThemedText>
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <View style={{ gap: 8 }}>
              <View>
                <ThemedText>Email</ThemedText>
                <Text style={{ color: text }}>{email}</Text>
              </View>
              <View>
                <ThemedText>Username</ThemedText>
                <Text style={{ color: text }}>@{username}</Text>
              </View>
              {createdAt ? (
                <View>
                  <ThemedText>Joined</ThemedText>
                  <Text style={{ color: text }}>{new Date(createdAt).toLocaleDateString()}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, gap: 16 },
  card: { gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, borderColor: '#e5e5e5' },
})
