import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, profile } from '@/services/auth';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import 'react-native-reanimated';

function AuthHeaderRight() {
  const { user, setUser } = useAuth();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const isDark = (colorScheme ?? 'light') === 'dark';
  useEffect(() => {
    if (!user) {
      profile
        .me()
        .then((u) => setUser(u))
        .catch(() => {});
    }
  }, [user, setUser]);
  async function onLogout() {
    await auth.logout();
    setUser(null);
  }
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingRight: 12 }}>
      {!user ? (
        <>
          <Link
            href="/login"
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: tint,
              color: tint,
              fontWeight: '600',
            }}
          >
            Login
          </Link>
          <Link
            href="/register"
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: isDark ? '#fff' : tint,
              color: isDark ? '#000' : '#fff',
              fontWeight: '600',
            }}
          >
            Register
          </Link>
        </>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text
            style={{
              fontWeight: '600',
              color: Colors[colorScheme ?? 'light'].text,
            }}
          >
            Welcome back, {user.displayName || user.username}
          </Text>
          <Link
            href="/dashboard"
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: tint,
              color: tint,
              fontWeight: '600',
            }}
          >
            Dashboard
          </Link>
          <Pressable
            onPress={onLogout}
            style={{
              backgroundColor: isDark ? '#fff' : '#000',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{ color: isDark ? '#000' : '#fff', fontWeight: '600' }}
            >
              Logout
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: true,
            headerTitle: '',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerRight: () => <AuthHeaderRight />,
              headerBackVisible: false,
            }}
          />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="video/[id]" options={{ headerShown: true }} />
          <Stack.Screen
            name="people"
            options={{ presentation: 'modal', title: 'People' }}
          />
        </Stack>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
