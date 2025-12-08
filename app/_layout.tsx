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
import { useEffect, useState } from 'react';
import { Dimensions, Image, Linking, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import 'react-native-reanimated';
import { changeShowLeftBar } from "./(tabs)/_layout";

function AuthHeaderRight() {
  const { user, setUser } = useAuth();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const isDark = (colorScheme ?? 'light') === 'dark';
  const router = useRouter();
  const [paddingX, setPaddingX] = useState(0);
  const [showWelcome, setshowWelcome] = useState(true)
  const [showName, setshowName] = useState(true)
  const [showSearchBar, setshowSearchBar] = useState(true)
  const [showOtherSearchBar, setshowOtherSearchBar] = useState(false)
  const [showLeftBar, setshowLeftBar]= useState(true)
  
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
        <View style={[styles.header, { backgroundColor: isDark ? '#333' : colors.white}]}  onLayout={(event) => {
            const width = event.nativeEvent.layout.width;
            if (width>1200) setPaddingX(150);
            if (width<1200) setPaddingX(100);
            if (width<1100) setPaddingX(50);
            if (width<1000) setshowWelcome(false);
              else setshowWelcome(true)
            if (width<800) {setshowName(false); setshowLeftBar(false)}
              else {setshowName(true); setshowLeftBar(true)}
            if (width<750) {setshowSearchBar(false); setshowName(true)}
              else setshowSearchBar(true)
            if (width>750) setshowOtherSearchBar(false);
            if (width<550) setshowName(false)
           }}>
          <View style={styles.container}>
            {!showLeftBar && <TouchableOpacity onPress={() => changeShowLeftBar()} style={[ styles.searchButton, { backgroundColor: isDark ? '#777' : colors.lightGray }, {borderRadius: 10, margin:10}]}>
                <FontAwesome name="bars" size={18} color={isDark ? "#fff" : "black"} />
              </TouchableOpacity>}
                <Link href={'/'} asChild>
              <View style={{ flexDirection: "row" }}>
                      <Image
                  source={require("../assets/images/favicon.png")}
                  style={{ width: 40, height: 40, borderRadius: 5 }}
                  />
                {showName && (<Text style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: isDark ? "#fff" : "#333333",
                  paddingLeft: 12,
                }}>FairPlay</Text>)}
              </View>
            </Link>
            </View>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#555' : colors.white }, {maxWidth : showSearchBar ? 650 : 45},{minWidth : showSearchBar ? 320 : 45},]}>
              {showSearchBar && <TextInput
                placeholder="Search Videos"
                style={[styles.searchInput, { color: isDark ? "#fff" : colors.darkGray },{ paddingHorizontal: paddingX }]}
              />}
              <TouchableOpacity style={[styles.searchButton, { backgroundColor: isDark ? '#777' : colors.lightGray }]} onPress={()=>{
                if (!showSearchBar) setshowOtherSearchBar(!showOtherSearchBar)
              }}>
                <FontAwesome name="search" size={18} color={isDark ? "#fff" : "black"} />
              </TouchableOpacity>
            </View>
          
        
          <View style={styles.headerActions}>
            {!user ? (
              <>
                <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginButton}>
                  <Text style={[ { color: isDark ? "#fff" : colors.darkGray , backgroundColor: isDark ? colors.darkGray: colors.white }]}>Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/register")} style={styles.loginButton}>
                  <Text style={[{ color: isDark ? "#fff" : colors.darkGray , backgroundColor: isDark ? colors.darkGray: colors.white }]}>Sign In</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {showWelcome && (<Text
                  style={{
                    fontWeight: '600',
                    color: isDark ? "#fff" : Colors[colorScheme ?? 'light'].text,
                  }}
                >
                  Welcome back, {user.displayName || user.username}
                </Text>)}
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
        {showOtherSearchBar && 
        <View style={{ backgroundColor: isDark ? '#333' : colors.white, borderBottomWidth: 1,borderColor: colors.lightGray, padding: 2}}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#555' : colors.white }]}>
              <TextInput
                placeholder="Rechercher des vidéos"
                style={[styles.searchInput, { color: isDark ? "#fff" : colors.darkGray },{ paddingHorizontal: paddingX }]}
              /> 
              <TouchableOpacity style={[styles.searchButton, { backgroundColor: isDark ? '#777' : colors.lightGray }]}>
                <FontAwesome name="search" size={18} color={isDark ? "#fff" : "black"} />
              </TouchableOpacity>
            </View>
            </View>
            }
      </ThemeProvider>
    </>
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

const screenWidth = Dimensions.get("window").width;
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
    //flexBasis: 520,
    maxWidth: 550,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    //alignSelf:"center",
    overflow: "hidden",
    height: 45,
    //minWidth : 320
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: screenWidth-1200,
    fontSize: 15,
    color: colors.darkGray,
    textAlign: "center",
  
    alignSelf: "stretch",
    justifyContent:"center"
   
  },
  searchButton: {
    backgroundColor: colors.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    //height:"100%",
    alignSelf: "stretch",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "flex-end",

  },
  loginButton: {
    height: 33,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    //marginHorizontal: 5,

  },
  loginText:{
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
    textAlignVertical: "center",
  },

  donateButton: {
    backgroundColor: colors.donatePink,
    height: 33,
    paddingHorizontal: 12,
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

