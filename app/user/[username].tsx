import { useLocalSearchParams, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { VideoGrid } from '@/components/video-grid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { Pfp } from '@/components/pfp';
import { VideoCard } from '@/components/video-card-grid';
import { FollowButton } from '@/components/follow-button';
import { getUser, getUserVideos, type PublicUser, type UserVideoItem } from '@/services/users';
import { useAuth } from '@/context/auth';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [videos, setVideos] = useState<UserVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, 'text');
  const { width } = useWindowDimensions();
  
  const { user: me } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!username) return;
    Promise.all([getUser(String(username)), getUserVideos(String(username), 1, 20)])
      .then(([u, vs]) => {
        if (!mounted) return;
        setUser(u);
        setVideos(vs.videos);
        if (typeof u.isFollowing === 'boolean') setIsFollowing(u.isFollowing);
      })
      .catch((e) => mounted && setError(e?.message || 'Failed to load'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [username]);

  function renderVideo({ item }: { item: UserVideoItem }) {
    const meta = `${new Date(item.createdAt).toLocaleDateString()} • ${item.viewCount} views`;
    return (
      <Link href={{ pathname: '/video/[id]', params: { id: item.id } }} asChild>
        <VideoCard
          thumbnailUrl={item.thumbnailUrl}
          title={item.title}
          meta={meta}
        />
      </Link>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: textColor }}>{error}</Text>
      ) : user ? (
        <>
          <View style={styles.bannerWrap}>
            {user.bannerUrl ? (
              <Image source={{ uri: user.bannerUrl }} style={styles.banner} contentFit="cover" />
            ) : (
              <View style={[styles.banner, { backgroundColor: '#e5e5e5' }]} />
            )}
            <View style={styles.avatarWrap}>
              <Pfp idOrUsername={user.username} size={72} />
            </View>
          </View>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title">{user.displayName || user.username}</ThemedText>
              <Text style={{ color: textColor, opacity: 0.7 }}>@{user.username}</Text>
            </View>
            <View style={styles.counts}>
              <Link href={{ pathname: '/people', params: { u: user.username, type: 'followers' } }}>
                <Text style={{ color: textColor }}>{user.followerCount} Followers</Text>
              </Link>
              <Link href={{ pathname: '/people', params: { u: user.username, type: 'following' } }}>
                <Text style={{ color: textColor }}>{user.followingCount} Following</Text>
              </Link>
              {me && me.username !== user.username ? (
                <FollowButton
                  username={user.username}
                  initialFollowing={isFollowing}
                  onChangeCount={(d) => setUser((u) => (u ? { ...u, followerCount: Math.max(0, (u.followerCount || 0) + d) } : u))}
                />
              ) : null}
            </View>
          </View>
          {user.bio ? (
            <Text style={{ color: textColor, marginHorizontal: 12, marginBottom: 12 }}>{user.bio}</Text>
          ) : null}
          <VideoGrid
            data={videos}
            keyExtractor={(v) => v.id}
            renderItem={(it) => renderVideo({ item: it })}
            width={width}
            contentPadding={12}
            gap={16}
            contentEdgeOnWeb
          />
        </>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerWrap: { width: '100%', height: 140, backgroundColor: '#e5e5e5' },
  banner: { width: '100%', height: '100%' },
  avatarWrap: { position: 'absolute', left: 16, bottom: -28, width: 72, height: 72, borderRadius: 36, overflow: 'hidden', borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center'},
  avatar: { width: '100%', height: '100%', borderRadius: 36, resizeMode: 'cover' },
  headerRow: { paddingTop: 36, paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-end' },
  counts: { flexDirection: 'row', gap: 12 },
  gridContent: { paddingHorizontal: 12, paddingBottom: 24, gap: 12, maxWidth: 1280, alignSelf: 'center', width: '100%' },
  gridContentEdge: { paddingHorizontal: 0, paddingBottom: 24, gap: 12, width: '100%' },
  gridRow: { gap: 16 },
});
