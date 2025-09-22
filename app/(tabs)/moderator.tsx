import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { listModeratorVideos, updateModeration, type ModVideoItem } from '@/services/moderation';
import { computeItemWidth } from '@/utils/grid';
import { VideoCard } from '@/components/video-card-grid';
import { useRouter } from 'expo-router';
import { VideoGrid } from '@/components/video-grid';
import { StatusBadges } from '@/components/status-badges';

export default function ModeratorTab() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ModVideoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  const router = useRouter();

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    listModeratorVideos({ moderationStatus: 'pending', sort: 'createdAt:desc' })
      .then((res) => active && setItems(res.videos))
      .catch((e) => active && setError(e?.message || 'Failed to load'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cancel = load();
    return cancel;
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    listModeratorVideos({ moderationStatus: 'pending', sort: 'createdAt:desc' })
      .then((res) => setItems(res.videos))
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setRefreshing(false));
  }, []);

  async function act(id: string, action: 'approve' | 'reject') {
    try {
      if (action === 'approve') setApproving(id);
      else setRejecting(id);
      await updateModeration(id, action);
      setItems((prev) => prev.filter((v) => v.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setApproving(null);
      setRejecting(null);
    }
  }

  function renderItem({ item }: { item: ModVideoItem }) {
    const meta = `${item.user.displayName || item.user.username} • ${item.processingStatus}`;
    const { itemWidth } = computeItemWidth(width, 12, 16);
    return (
      <View style={{ width: itemWidth }}>
        <VideoCard
          thumbnailUrl={item.thumbnailUrl}
          title={item.title}
          meta={meta}
          onPress={() => router.push({ pathname: '/video/[id]', params: { id: item.id } })}
        />
        <StatusBadges processingStatus={item.processingStatus} moderationStatus={item.moderationStatus as any} visibility={item.visibility as any} />
        <View style={styles.row}>
          <Pressable disabled={approving === item.id} onPress={() => act(item.id, 'approve')} style={[styles.btn, { borderColor: border }]}>
            <Text style={{ color: text }}>{approving === item.id ? 'Approving...' : 'Approve'}</Text>
          </Pressable>
          <Pressable disabled={rejecting === item.id} onPress={() => act(item.id, 'reject')} style={[styles.btn, { borderColor: border }]}>
            <Text style={{ color: text }}>{rejecting === item.id ? 'Rejecting...' : 'Reject'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Moderator</ThemedText>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: text }}>{error}</Text>
      ) : (
        <VideoGrid
          data={items}
          keyExtractor={(v) => v.id}
          renderItem={(it) => renderItem({ item: it })}
          width={width}
          contentPadding={12}
          gap={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={<Text style={{ color: text }}>No videos are currently available to moderate.</Text>}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  gridContent: { paddingBottom: 24, gap: 16 },
  gridRow: { gap: 16 },
  row: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
});
