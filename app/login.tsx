import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, profile } from '@/services/auth';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const mutedText = useThemeColor({}, 'icon');

  useEffect(() => {
    let mounted = true;
    profile
      .me()
      .then(() => mounted && router.replace('/'))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [router]);

  async function onSubmit() {
    if (!emailOrUsername || !password) {
      setError('Fill all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await auth.login({ emailOrUsername, password });
      setUser(res.user);
      router.replace('/');
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>Login</ThemedText>
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        <View style={styles.fields}>
          <TextInput
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            placeholder="Email or username"
            autoCapitalize="none"
            keyboardType="email-address"
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
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
        </Pressable>
        <Pressable onPress={() => router.push('/register')} style={styles.linkBtn}>
          <Text style={[styles.linkText, { color: mutedText }]}>Create account</Text>
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
