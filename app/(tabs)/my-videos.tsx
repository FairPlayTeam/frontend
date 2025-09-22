import { ThemedView } from '@/components/themed-view';
import { VideoCard } from '@/components/video-card-grid';
import { VideoGrid } from '@/components/video-grid';
import { StatusBadges } from '@/components/status-badges';
import { useThemeColor } from '@/hooks/use-theme-color';
import { listMyVideos, type MyVideoItem } from '@/services/videos';
import { ListState } from '@/components/list-state';
import { composeMeta, formatViews, formatRating, formatDate } from '@/utils/format';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';

export default function MyVideosTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MyVideoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const textColor = useThemeColor({}, 'text');

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    listMyVideos(1, 20)
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
    listMyVideos(1, 20)
      .then((res) => setItems(res.videos))
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setRefreshing(false));
  }, []);

  function renderItem({ item }: { item: MyVideoItem }) {
    const meta = composeMeta([
      formatViews(item.viewCount),
      formatRating(item.avgRating),
      formatDate((item as any).createdAt),
    ]);
    const needsFlag = item.moderationStatus !== 'approved' || item.processingStatus !== 'done' || item.visibility !== 'public';
    const href = needsFlag ? { pathname: '/video/[id]', params: { id: item.id, pending: '1' } } : { pathname: '/video/[id]', params: { id: item.id } };
    return (
      <>
        <VideoCard
          thumbnailUrl={item.thumbnailUrl}
          title={item.title}
          meta={meta}
          onPress={() => router.push(href as any)}
        />
        <StatusBadges visibility={item.visibility} processingStatus={item.processingStatus} moderationStatus={item.moderationStatus} />
      </>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ListState loading={loading} error={error}>
        <VideoGrid
          data={items}
          keyExtractor={(v) => v.id}
          renderItem={(it) => renderItem({ item: it })}
          width={width}
          contentPadding={12}
          gap={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={<Text style={{ color: textColor }}>You haven’t uploaded any videos yet.</Text>}
        />
      </ListState>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 12 },
  gridContent: { paddingHorizontal: 12, paddingBottom: 24, gap: 16 },
  gridRow: { gap: 16, justifyContent: 'flex-start' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12 },
});
