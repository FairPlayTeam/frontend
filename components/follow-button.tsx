import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { followUser, unfollowUser } from '@/services/users';

export function FollowButton(props: {
  username: string;
  initialFollowing?: boolean;
  onChangeCount?: (delta: number) => void;
}) {
  const [following, setFollowing] = useState(!!props.initialFollowing);
  const [acting, setActing] = useState(false);
  async function onPress() {
    if (acting) return;
    setActing(true);
    const target = props.username;
    if (following) {
      setFollowing(false);
      props.onChangeCount?.(-1);
      try {
        await unfollowUser(target);
      } catch {
        setFollowing(true);
        props.onChangeCount?.(1);
      } finally {
        setActing(false);
      }
    } else {
      setFollowing(true);
      props.onChangeCount?.(1);
      try {
        await followUser(target);
      } catch {
        setFollowing(false);
        props.onChangeCount?.(-1);
      } finally {
        setActing(false);
      }
    }
  }
  return (
    <Pressable style={{ backgroundColor: following ? '#1f2937' : '#000', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }} onPress={onPress} disabled={acting}>
      <Text style={{ color: 'white', fontWeight: '600' }}>{following ? 'Following' : 'Follow'}</Text>
    </Pressable>
  );
}
