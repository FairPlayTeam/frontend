import { ThemedView } from '@/components/themed-view';
import { VideoCard } from '@/components/video-card-grid';
import { VideoGrid } from '@/components/video-grid';
import { listVideos, type VideoListItem } from '@/services/videos';
import { ListState } from '@/components/list-state';
import { composeMeta, formatViews, formatRating, formatDate } from '@/utils/format';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

export default function HomeTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VideoListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  //const { width } = useWindowDimensions();
  const [width, setwidth] = useState(0)

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    listVideos(1, 20)
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
    listVideos(1, 20)
      .then((res) => setItems(res.videos))
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setRefreshing(false));
  }, []);

  function renderItem({ item }: { item: VideoListItem }) {
    const meta = composeMeta([
      formatViews(item.viewCount),
      formatRating(item.avgRating),
      formatDate(item.createdAt),
    ]);
    return (
      <VideoCard
        thumbnailUrl={item.thumbnailUrl}
        title={item.title}
        displayName={item.user.displayName || item.user.username}
        meta={meta}
        onPress={() => router.push({ pathname: '/video/[id]', params: { id: item.id } })}
      />
    );
  }

  return (
    <ThemedView style={styles.container} onLayout={(event) => {
            setwidth(event.nativeEvent.layout.width)
           }}>
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
        />
      </ListState>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 12 },
  gridContent: { paddingHorizontal: 12, paddingBottom: 24, gap: 16 },
  gridRow: { gap: 16, justifyContent: 'flex-start' },
});
