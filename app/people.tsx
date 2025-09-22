import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getFollowers, getFollowing, type SimpleUser } from '@/services/users';
import { Pfp } from '@/components/pfp';
import { SearchInput } from '@/components/search-input';
import { EmptyState } from '@/components/empty-state';

export default function PeopleModal() {
  const router = useRouter();
  const { u, type } = useLocalSearchParams<{ u: string; type: 'followers' | 'following' }>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SimpleUser[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  useEffect(() => {
    let mounted = true;
    if (!u || !type) return;
    const fn = type === 'followers' ? getFollowers : getFollowing;
    fn(String(u), 1, 50)
      .then((res) => {
        if (!mounted) return;
        setItems((res as any)[type] as SimpleUser[]);
      })
      .catch((e) => mounted && setError(e?.message || 'Failed to load'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [u, type]);

  function renderItem({ item }: { item: SimpleUser }) {
    return (
      <Pressable onPress={() => router.push({ pathname: '/user/[username]', params: { username: item.username } })} style={StyleSheet.flatten([styles.row, { borderColor }])}> 
        <View style={styles.avatarWrap}>
          <Pfp idOrUsername={item.username} size={44} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.displayName || item.username}</ThemedText>
          <Text style={{ color: textColor, opacity: 0.7 }} numberOfLines={1}>@{item.username}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={{ padding: 12 }}>
        <SearchInput value={query} onChangeText={setQuery} placeholder={`Search ${type === 'followers' ? 'followers' : 'following'}`} />
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: textColor }}>{error}</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={items.filter((u) => !query || u.username.toLowerCase().includes(query.toLowerCase()) || (u.displayName || '').toLowerCase().includes(query.toLowerCase()))}
          keyExtractor={(u) => u.id}
          renderItem={renderItem}
          ListEmptyComponent={<EmptyState message={query ? 'No matches found.' : 'No users found.'} />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 10, padding: 10 },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: '#e5e5e5' },
  avatar: { width: '100%', height: '100%' },
});
