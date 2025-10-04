import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/context/auth';


export default function TabsLayout() {
  const { user } = useAuth();
  return (
    <>
    
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#000' },
      }}
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
    </>
  );
}
