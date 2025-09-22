import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '@/services/auth';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const mutedText = useThemeColor({}, 'icon');

  async function onSubmit() {
    if (!email || !username || !password) {
      setError('Fill all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await auth.register({ email, username, password });
      router.replace('/');
    } catch (e: any) {
      setError(e?.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>Create account</ThemedText>
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        <View style={styles.fields}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { backgroundColor, color: textColor, borderColor }]}
          />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor, color: textColor, borderColor }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={[styles.input, { backgroundColor, color: textColor, borderColor }]}
          />
        </View>
        <Pressable onPress={onSubmit} disabled={loading} style={styles.primaryBtn}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.primaryBtnText}>Continue</Text>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/login')} style={styles.linkBtn}>
          <Text style={[styles.linkText, { color: mutedText }]}>Already have an account? Login</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 12,
  },
  fields: {
    gap: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryBtn: {
    backgroundColor: 'black',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
