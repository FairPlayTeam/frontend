import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { listSessions, revokeSession, logoutAllSessions, logoutOtherSessions, type Session } from '@/services/account';

export default function SessionsScreen() {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Session[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await listSessions();
      setItems(res.sessions);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function revoke(id: string) {
    setBusy(true);
    try {
      await revokeSession(id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onLogoutAll() {
    setBusy(true);
    try {
      await logoutAllSessions();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onLogoutOthers() {
    setBusy(true);
    try {
      await logoutOtherSessions();
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Sessions</ThemedText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={styles.primaryBtn} onPress={onLogoutAll} disabled={busy}>
            <Text style={styles.primaryBtnText}>{busy ? 'Working...' : 'Logout all'}</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={onLogoutOthers} disabled={busy}>
            <Text style={styles.primaryBtnText}>{busy ? 'Working...' : 'Logout others'}</Text>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={{ gap: 12 }}>
            {items.length === 0 ? (
              <Text style={{ color: text, opacity: 0.8 }}>No sessions yet.</Text>
            ) : (
              items.map((s) => (
                <View key={s.id} style={[styles.card, { borderColor: border }]}> 
                  <View style={{ flex: 1 }}>
                    <ThemedText>{s.deviceInfo}</ThemedText>
                    <Text style={{ color: text, opacity: 0.7 }}>Created {new Date(s.createdAt).toLocaleString()}</Text>
                    <Text style={{ color: text, opacity: 0.7 }}>Last used {new Date(s.lastUsedAt).toLocaleString()}</Text>
                    {s.isCurrent ? <Text style={{ color: text }}>Current</Text> : null}
                  </View>
                  {!s.isCurrent ? (
                    <Pressable style={styles.primaryBtn} onPress={() => revoke(s.id)} disabled={busy}>
                      <Text style={styles.primaryBtnText}>Revoke</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, gap: 16 },
  card: { gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
  primaryBtn: { backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
});
