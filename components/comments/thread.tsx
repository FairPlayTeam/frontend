import { memo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Pfp } from '@/components/pfp';
import type { CommentItem } from '@/services/video-details';
import { useThemeColor } from '@/hooks/use-theme-color';

const CommentNode = memo(function CommentNode({ n, depth, props }: { n: CommentItem; depth: number; props: any }) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const mutedColor = useThemeColor({}, 'icon');
  const isTop = depth === 0;
  return (
    <View style={[isTop ? styles.comment : styles.replyItem, { borderColor: borderColor }]}> 
      <View style={styles.commentLeft}>
        <Pfp idOrUsername={n.user.username} size={isTop ? 32 : 24} avatarUrl={n.user.avatarUrl} />
      </View>
      <View style={{ flex: 1 }}>
        <Link href={{ pathname: '/user/[username]', params: { username: n.user.username } }} asChild>
          <Pressable>
            <Text style={[styles.commentUser, { color: textColor }]} numberOfLines={1}>
              {n.user.displayName || n.user.username} • @{n.user.username}
            </Text>
          </Pressable>
        </Link>
        <Text style={{ color: textColor }}>{n.content}</Text>
        <Text style={{ color: textColor, opacity: 0.6, fontSize: 12, marginTop: 2 }}>{new Date(n.createdAt).toLocaleString()}</Text>
        <View style={styles.commentActions}>
          <Pressable onPress={() => props.onToggleLike(n.id)} style={styles.likeBtn}>
            <Text style={[styles.likeText, { color: textColor }]}>{n.likedByMe ? '♥' : '♡'} {n.likeCount}</Text>
          </Pressable>
          <Pressable onPress={() => props.onSetReplyingTo(n.id)} style={styles.likeBtn}>
            <Text style={[styles.likeText, { color: textColor }]}>Reply</Text>
          </Pressable>
        </View>
        {props.replyingTo === n.id ? (
          <View style={styles.replyInputRow}>
            <TextInput
              value={props.replyText}
              onChangeText={props.onChangeReplyText}
              placeholder="Reply"
              placeholderTextColor={mutedColor}
              style={[styles.input, { color: textColor, borderColor: borderColor }]}
            />
            <Pressable onPress={() => props.onPostReply(n.id)} disabled={!props.replyText.trim()} style={styles.postBtn}>
              <Text style={styles.postBtnText}>Post</Text>
            </Pressable>
          </View>
        ) : null}
        {n.replies && n.replies.length ? (
          <View style={styles.replies}>
            {n.replies.map((child) => (
              <CommentNode key={child.id} n={child} depth={depth + 1} props={props} />
            ))}
          </View>
        ) : null}
        {typeof n._count?.replies === 'number' && (n.replies?.length || 0) < n._count.replies ? (
          <Pressable onPress={() => props.loadMoreReplies(n.id)} style={styles.likeBtn}>
            <Text style={[styles.likeText, { color: textColor }]}>Load more replies</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

export function CommentsThread(props: {
  comments: CommentItem[];
  replyingTo: string | null;
  replyText: string;
  onChangeReplyText: (v: string) => void;
  onPostReply: (parentId: string) => void;
  onToggleLike: (id: string) => void;
  loadMoreReplies: (id: string) => void;
  onSetReplyingTo: (id: string | null) => void;
}) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const mutedColor = useThemeColor({}, 'icon');

  function Node({ n, depth }: { n: CommentItem; depth: number }) {
    const isTop = depth === 0;
    return (
      <View style={[isTop ? styles.comment : styles.replyItem, { borderColor: borderColor }]}> 
        <View style={styles.commentLeft}>
          <Pfp idOrUsername={n.user.username} size={isTop ? 32 : 24} />
        </View>
        <View style={{ flex: 1 }}>
          <Link href={{ pathname: '/user/[username]', params: { username: n.user.username } }} asChild>
            <Pressable>
              <Text style={[styles.commentUser, { color: textColor }]} numberOfLines={1}>
                {n.user.displayName || n.user.username} • @{n.user.username}
              </Text>
            </Pressable>
          </Link>
          <Text style={{ color: textColor }}>{n.content}</Text>
          <Text style={{ color: textColor, opacity: 0.6, fontSize: 12, marginTop: 2 }}>{new Date(n.createdAt).toLocaleString()}</Text>
          <View style={styles.commentActions}>
            <Pressable onPress={() => props.onToggleLike(n.id)} style={styles.likeBtn}>
              <Text style={[styles.likeText, { color: textColor }]}>{n.likedByMe ? '♥' : '♡'} {n.likeCount}</Text>
            </Pressable>
            <Pressable onPress={() => props.onSetReplyingTo(n.id)} style={styles.likeBtn}>
              <Text style={[styles.likeText, { color: textColor }]}>Reply</Text>
            </Pressable>
          </View>
          {props.replyingTo === n.id ? (
            <View style={styles.replyInputRow}>
              <TextInput
                value={props.replyText}
                onChangeText={props.onChangeReplyText}
                placeholder="Reply"
                placeholderTextColor={mutedColor}
                style={[styles.input, { color: textColor, borderColor: borderColor }]}
              />
              <Pressable onPress={() => props.onPostReply(n.id)} disabled={!props.replyText.trim()} style={styles.postBtn}>
                <Text style={styles.postBtnText}>Post</Text>
              </Pressable>
            </View>
          ) : null}
          {n.replies && n.replies.length ? (
            <View style={styles.replies}>
              {n.replies.map((child) => (
                <Node key={child.id} n={child} depth={depth + 1} />
              ))}
            </View>
          ) : null}
          {typeof n._count?.replies === 'number' && (n.replies?.length || 0) < n._count.replies ? (
            <Pressable onPress={() => props.loadMoreReplies(n.id)} style={styles.likeBtn}>
              <Text style={[styles.likeText, { color: textColor }]}>Load more replies</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {props.comments.map((c) => (
        <CommentNode key={c.id} n={c} depth={0} props={props} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingTop: 0, gap: 8 },
  comment: { flexDirection: 'row', gap: 8, padding: 10, borderWidth: 1, borderRadius: 10 },
  replyItem: { flexDirection: 'row', gap: 8, padding: 8, borderWidth: 1, borderRadius: 8, marginTop: 6 },
  commentLeft: { width: 36, alignItems: 'center' },
  commentUser: { fontWeight: '600', marginBottom: 2 },
  commentActions: { marginTop: 6 },
  likeBtn: { paddingVertical: 4, paddingHorizontal: 8, alignSelf: 'flex-start' },
  likeText: { fontSize: 12, opacity: 0.8 },
  replies: { marginTop: 8, gap: 6 },
  replyInputRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  postBtn: { backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  postBtnText: { color: 'white', fontWeight: '600' },
});
