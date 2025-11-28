import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { colors } from "@/components/ui/colors";
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, profile } from '@/services/auth';
import { FontAwesome } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import 'react-native-reanimated';

function Header() {
  const { user, setUser } = useAuth();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const isDark = (colorScheme ?? 'light') === 'dark';
  const router = useRouter();

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
    <>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={[styles.header, { backgroundColor: isDark ? '#333' : colors.white}]}>
          <View style={styles.container}>
                <Link href={'/'} asChild>
              <View style={{ flexDirection: "row" }}>
                      <Image
                  source={require("@/assets/images/favicon.png")}
                  style={{ width: 40, height: 40, borderRadius: 5 }}
                  />
                <Text style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: isDark ? "#fff" : "#333333",
                  paddingLeft: 12,
                }}>FairPlay</Text>
              </View>
            </Link>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#555' : colors.white }]}>
              <TextInput
                placeholder="Rechercher des vidéos"
                style={[styles.searchInput, { color: isDark ? "#fff" : colors.darkGray }]}
              />
              <TouchableOpacity style={[styles.searchButton, { backgroundColor: isDark ? '#777' : colors.lightGray }]}>
                <FontAwesome name="search" size={18} color={isDark ? "#fff" : "black"} />
              </TouchableOpacity>
            </View>
          </View>
        
          <View style={styles.headerActions}>
            {!user ? (
              <>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={[styles.loginButton, { color: isDark ? "#fff" : colors.darkGray }]}>Se Connecter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/login?register=true")}>
                  <Text style={[styles.loginButton, { color: isDark ? "#fff" : colors.darkGray }]}>S'Inscrire</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text
                  style={{
                    fontWeight: '600',
                    color: isDark ? "#fff" : Colors[colorScheme ?? 'light'].text,
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
                  My Account
                </Link>
                <Pressable
                  onPress={onLogout}
                  style={{
                    backgroundColor: isDark ? '#fff' : '#000',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    marginRight: 10,
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

            <TouchableOpacity
              style={styles.donateButton}
              onPress={() => Linking.openURL("https://ko-fi.com/fairplay_")}
            >
              <Text style={styles.donateText}>Donate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemeProvider>
    </>
  );
}

export default function TabsLayout() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  return (
    <>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <Tabs
      screenOptions={colorScheme === 'dark' ? {
        headerShown: false,
        tabBarActiveTintColor: '#1d60caff',
        tabBarInactiveTintColor: '#dbdee4ff',
        tabBarActiveBackgroundColor:'#000000',
        tabBarPosition:"left",
      }:{
        headerShown: false,
        tabBarActiveTintColor: '#1d60caff',
        tabBarInactiveTintColor: '#292828ff',
        tabBarActiveBackgroundColor:'#9ca3af',
        tabBarPosition:"left",
        
    
        
      }
    }
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="ion:home" color={color} size={size} />,
        }}
      />
      {user ? (
        <Tabs.Screen
          name="upload"
          options={{
            title: 'Upload',
            tabBarIcon: ({ color, size }) => <Icon name="ion:cloud-upload" color={color} size={size} />,
          }}
        />
      ) : (
        <Tabs.Screen name="upload" options={{ href: null }} />
      )}
      {user ? (
        <Tabs.Screen
          name="my-videos"
          options={{
            title: 'My Videos',
            tabBarIcon: ({ color, size }) => <Icon name="ion:film" color={color} size={size} />,
          }}
        />
      ) : (
        <Tabs.Screen name="my-videos" options={{ href: null }} />
      )}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Icon name="ion:grid" color={color} size={size} />,
        }}
      />
      {user && (user.role === 'moderator' || user.role === 'admin') ? (
        <Tabs.Screen
          name="moderator"
          options={{
            title: 'Moderator',
            tabBarIcon: ({ color, size }) => <Icon name="ion:shield-checkmark" color={color} size={size} />,
          }}
        />
      ) : (
        <Tabs.Screen name="moderator" options={{ href: null }} />
      )}
      {user && user.role === 'admin' ? (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, size }) => <Icon name="ion:settings" color={color} size={size} />,
          }}
        />
      ) : (
        <Tabs.Screen name="admin" options={{ href: null }} />
      )}
    </Tabs>
    </ThemeProvider>
    </>
  );
}
export const styles = StyleSheet.create({
  header: {
    
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
    paddingVertical: 10,
    paddingRight: 5,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 8,
    justifyContent: "space-between",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkGray,
    paddingLeft: 20,
  },
  searchBar: {
    flex:1,
    flexDirection: "row",
    
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 520,
    maxWidth: 720,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    overflow: "hidden",
    minWidth: 100,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 200,
    fontSize: 15,
    color: colors.darkGray,
    textAlign: "left",
  },
  searchButton: {
    backgroundColor: colors.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  loginButton: {
    height: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    color: colors.darkGray,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  donateButton: {
    backgroundColor: colors.donatePink,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  donateText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});