import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { useState } from 'react';
import 'react-native-reanimated';
import { View, TouchableOpacity } from 'react-native';
import { colors } from "@/components/ui/colors";
import { FontAwesome } from "@expo/vector-icons";



export default function TabsLayout() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showLeftBar, setshowLeftBar]= useState(false)
  return (
    <>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme} >
      <View style={{height: "100%", width: "100%"}}
        onLayout={(event) => {
            const width = event.nativeEvent.layout.width
            if (width < 800) setshowLeftBar(false)
              else setshowLeftBar(true)
           }}>
             
    <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: "permanent",
          swipeEnabled: showLeftBar,
          
          drawerStyle: {
            width: "auto",
            minWidth:250,
            display: showLeftBar ?"flex" : "none",
          },
          
          drawerActiveTintColor: "#1d60ca",
          drawerInactiveTintColor: isDark ? "#dbdee4" : "#292828",
        }}
      >
        
        <Drawer.Screen
          name="home"
          options={{
            title: "Home",
            drawerIcon: ({ color, size }) => (
              <Icon name="ion:home" color={color} size={size} />
            ),
          }}
        />


        {user ? (
          <Drawer.Screen
            name="upload"
            options={{
              title: "Upload",
              drawerIcon: ({ color, size }) => (
                <Icon name="ion:cloud-upload" color={color} size={size} />
              ),
            }}
          />
        ) : (
          <Drawer.Screen name="upload" options={{ drawerItemStyle: { display: "none" } }} />
        )}


        {user ? (
          <Drawer.Screen
            name="my-videos"
            options={{
              title: "My Videos",
              drawerIcon: ({ color, size }) => (
                <Icon name="ion:film" color={color} size={size} />
              ),
            }}
          />
        ) : (
          <Drawer.Screen name="my-videos" options={{ drawerItemStyle: { display: "none" } }} />
        )}


        <Drawer.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            drawerIcon: ({ color, size }) => (
              <Icon name="ion:grid" color={color} size={size} />
            ),
          }}
        />


        {user && (user.role === "moderator" || user.role === "admin") ? (
          <Drawer.Screen
            name="moderator"
            options={{
              title: "Moderator",
              drawerIcon: ({ color, size }) => (
                <Icon
                  name="ion:shield-checkmark"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        ) : (
          <Drawer.Screen
            name="moderator"
            options={{ drawerItemStyle: { display: "none" } }}
          />
        )}


        {user && user.role === "admin" ? (
          <Drawer.Screen
            name="admin"
            options={{
              title: "Admin",
              drawerIcon: ({ color, size }) => (
                <Icon name="ion:settings" color={color} size={size} />
              ),
            }}
          />
        ) : (
          <Drawer.Screen name="admin" options={{ drawerItemStyle: { display: "none" } }} />
        )}
      </Drawer>
     
      </View>
    </ThemeProvider>
    </>
  );
}
