import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { VideoPlayer } from '@/components/video-player';
import { getVideo, getVideoComments, addComment, likeComment, unlikeComment, getCommentReplies, type VideoDetails, type CommentItem } from '@/services/video-details';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { Pfp } from '@/components/pfp';
import { getUser as getUserProfile, followUser, unfollowUser } from '@/services/users';
import { API_BASE_URL } from '@/config';
import { updateVideo } from '@/services/videos';
import { VisibilityChips } from '@/components/visibility-chips';
import { CommentsThread } from '@/components/comments/thread';

export default function VideoScreen() {
  const { id, pending } = useLocalSearchParams<{ id: string; pending?: string }>();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [uploader, setUploader] = useState<{ avatarUrl?: string | null; displayName?: string | null; username?: string; followerCount?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyPages, setReplyPages] = useState<Record<string, number>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [savingEdit, setSavingEdit] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const mutedColor = useThemeColor({}, 'icon');
  const { user } = useAuth();
  const router = useRouter();
  
  const abs = useCallback((u?: string | null) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    return `${API_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
  }, []);

  const normalizeComment = useCallback((node: CommentItem): CommentItem => {
    const user = { ...node.user };
    const replies = node.replies && node.replies.length ? node.replies.map(normalizeComment) : node.replies;
    return { ...node, user, replies };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    Promise.all([getVideo(String(id)), getVideoComments(String(id))])
      .then(([v, cs]) => {
        if (!mounted) return;
        const vu = v.user ? { ...v.user, avatarUrl: abs(v.user.avatarUrl || null) } : v.user;
        setVideo({ ...v, user: vu });
        setComments(cs.comments.map(normalizeComment));
      })
      .catch((e) => mounted && setError(e?.message || 'Failed to load'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, abs, normalizeComment]);

  const loadMoreFor = useCallback(async (nodeId: string) => {
    const page = (replyPages[nodeId] ?? 0) + 1;
    const res = await getCommentReplies(nodeId, page, 10);
    const more = res.replies.map(normalizeComment);
    if (!more.length) return;
    function mergeAppend(list: CommentItem[]): CommentItem[] {
      return list.map((n) => {
        if (n.id === nodeId) {
          const existing = n.replies || [];
          return { ...n, replies: [...existing, ...more] } as any;
        }
        if (n.replies && n.replies.length) return { ...n, replies: mergeAppend(n.replies) };
        return n;
      });
    }
    setComments((prev) => mergeAppend(prev));
    setReplyPages((m) => ({ ...m, [nodeId]: page }));
  }, [replyPages, normalizeComment]);

  useEffect(() => {
    let mounted = true;
    const uname = video?.user?.username;
    const hasAvatar = !!video?.user?.avatarUrl;
    if (!uname) return;
    if (hasAvatar) {
      setUploader({ avatarUrl: abs(video?.user?.avatarUrl || null), displayName: video?.user?.displayName || null, username: uname });
    }
    getUserProfile(uname)
      .then((u) => {
        if (!mounted) return;
        setUploader({ avatarUrl: abs(u.avatarUrl), displayName: u.displayName, username: u.username, followerCount: u.followerCount });
        if (typeof (u as any).isFollowing === 'boolean') setIsFollowing((u as any).isFollowing);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [video?.user?.username, video?.user?.avatarUrl, video?.user?.displayName, abs]);

  const [isFollowing, setIsFollowing] = useState(false);

  async function onToggleFollow() {
    if (!uploader?.username) return;
    const target = uploader.username;
    if (isFollowing) {
      setIsFollowing(false);
      setUploader((u) => (u ? { ...u, followerCount: Math.max(0, (u.followerCount || 0) - 1) } : u));
      try {
        await unfollowUser(target);
      } catch {
        setIsFollowing(true);
        setUploader((u) => (u ? { ...u, followerCount: (u.followerCount || 0) + 1 } : u));
      }
    } else {
      setIsFollowing(true);
      setUploader((u) => (u ? { ...u, followerCount: (u.followerCount || 0) + 1 } : u));
      try {
        await followUser(target);
      } catch {
        setIsFollowing(false);
        setUploader((u) => (u ? { ...u, followerCount: Math.max(0, (u.followerCount || 0) - 1) } : u));
      }
    }
  }

  async function onPost() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!content.trim() || !id) return;
    setPosting(true);
    try {
      const res = await addComment(String(id), content.trim());
      let created = normalizeComment(res.comment);
      if (user && created.user.username === user.username) {
        created = {
          ...created,
          user: {
            ...created.user,
            avatarUrl: created.user.avatarUrl ?? user.avatarUrl ?? null,
            displayName: created.user.displayName ?? user.displayName ?? null,
          },
        };
      }
      if (!created.user.avatarUrl) {
        try {
          const u = await getUserProfile(created.user.username);
          created = { ...created, user: { ...created.user, avatarUrl: u.avatarUrl, displayName: u.displayName } };
        } catch {}
      }
      setComments([created, ...comments]);
      setContent('');
    } catch (e: any) {
      setError(e?.message || 'Failed to comment');
    } finally {
      setPosting(false);
    }
  }

  function toggleLikedState(targetId: string, makeLiked: boolean) {
    function rec(list: CommentItem[]): CommentItem[] {
      return list.map((n) => {
        if (n.id === targetId) {
          const nextCount = Math.max(0, n.likeCount + (makeLiked ? 1 : -1));
          return { ...n, likedByMe: makeLiked, likeCount: nextCount };
        }
        if (n.replies && n.replies.length) return { ...n, replies: rec(n.replies) };
        return n;
      });
    }
    setComments((prev) => rec(prev));
  }

  async function onToggleLike(id: string) {
    if (!user) {
      router.push('/login');
      return;
    }
    let isLiked = false;
    (function find(list: CommentItem[]) {
      for (const n of list) {
        if (n.id === id) { isLiked = !!n.likedByMe; return; }
        if (n.replies && n.replies.length) find(n.replies);
      }
    })(comments);
    try {
      if (isLiked) {
        toggleLikedState(id, false);
        await unlikeComment(id);
      } else {
        toggleLikedState(id, true);
        await likeComment(id);
      }
    } catch {}
  }

  async function onPostReply(parentId: string) {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!replyText.trim() || !id) return;
    try {
      const res = await addComment(String(id), replyText.trim(), parentId);
      let newReply = normalizeComment(res.comment);
      if (user && newReply.user.username === user.username) {
        newReply = {
          ...newReply,
          user: {
            ...newReply.user,
            avatarUrl: newReply.user.avatarUrl ?? user.avatarUrl ?? null,
            displayName: newReply.user.displayName ?? user.displayName ?? null,
          },
        };
      }
      if (!newReply.user.avatarUrl) {
        try {
          const u = await getUserProfile(newReply.user.username);
          newReply = { ...newReply, user: { ...newReply.user, avatarUrl: u.avatarUrl, displayName: u.displayName } };
        } catch {}
      }
      function insert(list: CommentItem[]): CommentItem[] {
        return list.map((n) => {
          if (n.id === parentId) {
            const replies = n.replies ? [newReply, ...n.replies] : [newReply];
            return { ...n, replies };
          }
          if (n.replies && n.replies.length) return { ...n, replies: insert(n.replies) };
          return n;
        });
      }
      setComments((prev) => insert(prev));
      setReplyText('');
      setReplyingTo(null);
    } catch {}
  }

  

  return (
    <>
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: textColor }}>{error}</Text>
      ) : video ? (
        <FlatList
          data={[0]}
          renderItem={() => null}
          contentContainerStyle={styles.commentsList}
          ListHeaderComponent={
            <View>
              <View style={styles.playerContainer}>
                {video.hls?.master ? <VideoPlayer uri={video.hls.master} /> : null}
              </View>
              <View style={styles.header}>
                <ThemedText type="title">{video.title}</ThemedText>
                <Text style={[styles.metrics, { color: textColor }]}>
                  {video.viewCount} views • {video.avgRating.toFixed(1)}★ ({video.ratingsCount})
                </Text>
              </View>
              {user && (user.username === video.user?.username || user.id === (video.user as any)?.id) ? (
                <Pressable
                  style={[styles.editBtn, { borderColor }]}
                  onPress={() => {
                    setEditTitle(video.title);
                    setEditDesc(video.description || '');
                    setEditVisibility('public');
                    setEditOpen(true);
                  }}
                >
                  <Text style={{ color: textColor }}>Edit</Text>
                </Pressable>
              ) : null}
              {pending === '1' ? (
                <View style={[styles.pendingBanner, { borderColor }]}> 
                  <Text style={{ color: textColor }}>
                    This video is pending approval or processing. Only you can see this preview.
                  </Text>
                </View>
              ) : null}
              {video.description ? (
                <Text style={[styles.description, { color: textColor }]}>{video.description}</Text>
              ) : null}
              {video.user ? (
                <View style={styles.uploaderRow}>
                  <Link href={{ pathname: '/user/[username]', params: { username: video.user.username } }} asChild>
                    <Pressable style={styles.uploaderInfo}>
                      <View style={styles.avatarWrap}>
                        <Pfp idOrUsername={video.user.username} size={40} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="defaultSemiBold" numberOfLines={1}>
                          {uploader?.displayName || video.user.displayName || video.user.username}
                        </ThemedText>
                        <Text style={{ color: textColor, opacity: 0.7 }} numberOfLines={1}>
                          @{video.user.username}
                        </Text>
                        {typeof uploader?.followerCount === 'number' ? (
                          <Text style={{ color: textColor, opacity: 0.7 }} numberOfLines={1}>
                            {uploader.followerCount} followers
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  </Link>
                  {user && video.user && user.username !== video.user.username ? (
                    <Pressable style={[styles.primaryBtn, { backgroundColor: isFollowing ? '#1f2937' : '#000' }]} onPress={onToggleFollow}>
                      <Text style={styles.primaryBtnText}>{isFollowing ? 'Following' : 'Follow'}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              <View style={styles.commentsHeader}>
                <ThemedText type="defaultSemiBold">Comments</ThemedText>
              </View>
              <View style={[styles.addRow, { borderColor }]}> 
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder={user ? 'Add a comment' : 'Login to comment'}
                  editable={!!user}
                  style={[styles.input, { color: textColor, borderColor }]}
                  placeholderTextColor={mutedColor}
                />
                <Pressable onPress={onPost} disabled={!user || posting || !content.trim()} style={styles.postBtn}>
                  <Text style={styles.postBtnText}>{posting ? '...' : 'Post'}</Text>
                </Pressable>
              </View>
              <CommentsThread
                comments={comments}
                replyingTo={replyingTo}
                replyText={replyText}
                onChangeReplyText={setReplyText}
                onPostReply={onPostReply}
                onToggleLike={onToggleLike}
                loadMoreReplies={loadMoreFor}
                onSetReplyingTo={setReplyingTo}
              />
            </View>
          }
        />
      ) : null}
    </ThemedView>
    <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { borderColor: borderColor }]}> 
          <ThemedText type="title" style={styles.modalTitleText}>Edit video</ThemedText>
          <TextInput
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Title"
            placeholderTextColor={mutedColor}
            selectionColor={textColor}
            style={[styles.modalInput, { borderColor: borderColor, color: textColor }]}
          />
          <TextInput
            value={editDesc}
            onChangeText={setEditDesc}
            placeholder="Description"
            placeholderTextColor={mutedColor}
            selectionColor={textColor}
            style={[styles.modalTextarea, { borderColor: borderColor, color: textColor }]}
            multiline
          />
          <VisibilityChips value={editVisibility} onChange={setEditVisibility} />
          <View style={styles.modalActions}>
            <Pressable onPress={() => setEditOpen(false)} style={[styles.btn, { borderColor: borderColor }]}> 
              <Text style={{ color: textColor }}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={savingEdit}
              onPress={async () => {
                if (!id) return;
                try {
                  setSavingEdit(true);
                  await updateVideo(String(id), {
                    title: editTitle.trim() || undefined,
                    description: editDesc.trim() || undefined,
                    visibility: editVisibility,
                  });
                  setVideo((prev) => prev ? { ...prev, title: editTitle, description: editDesc, ...(prev as any), visibility: editVisibility } as any : prev);
                  setEditOpen(false);
                } catch {} finally {
                  setSavingEdit(false);
                }
              }}
              style={[styles.btn, { borderColor: borderColor }]}
            >
              <Text style={{ color: textColor }}>{savingEdit ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 12, gap: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  titleText: { fontWeight: '700' },
  metrics: { opacity: 0.7 },
  description: { paddingHorizontal: 12, paddingBottom: 8, opacity: 0.9 },
  playerContainer: { width: '100%', maxWidth: 960, alignSelf: 'center', paddingHorizontal: 12 },
  pageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, paddingHorizontal: 12 },
  pageLeft: { flex: 3, maxWidth: 960 },
  pageRight: { flex: 2, gap: 12, paddingTop: 8 },
  uploaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8, gap: 12 },
  uploaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatarWrap: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: '#e5e5e5' },
  avatar: { width: '100%', height: '100%', borderRadius: 20 },
  actions: { paddingHorizontal: 12, paddingBottom: 8 },
  primaryBtn: { backgroundColor: 'black', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  primaryBtnText: { color: 'white', fontWeight: '600' },
  commentsHeader: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d4d4d4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  postBtn: { backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  postBtnText: { color: 'white', fontWeight: '600' },
  commentsList: { padding: 12, gap: 8 },
  comment: { flexDirection: 'row', gap: 8, padding: 10, borderWidth: 1, borderRadius: 10, marginBottom: 8 },
  commentLeft: { width: 36, alignItems: 'center' },
  commentUser: { fontWeight: '600', marginBottom: 2 },
  commentActions: { marginTop: 6 },
  likeBtn: { paddingVertical: 4, paddingHorizontal: 8, alignSelf: 'flex-start' },
  likeText: { fontSize: 12, opacity: 0.8 },
  replies: { marginTop: 8, gap: 6 },
  replyItem: { flexDirection: 'row', gap: 8, padding: 8, borderWidth: 1, borderRadius: 8 },
  replyInputRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  avatarSm: { width: 32, height: 32, borderRadius: 16 },
  avatarXs: { width: 24, height: 24, borderRadius: 12 },
  pendingBanner: { marginHorizontal: 12, marginBottom: 8, borderWidth: 1, borderRadius: 10, padding: 10 },
  editBtn: { alignSelf: 'flex-end', marginHorizontal: 12, marginBottom: 8, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  editBtnInline: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 520, backgroundColor: '#111', borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
  modalTitleText: { fontWeight: '700' },
  modalInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#000', fontWeight: '600', fontSize: 16 },
  modalTextarea: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, minHeight: 100, backgroundColor: '#000', fontWeight: '500' },
  modalActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
});
