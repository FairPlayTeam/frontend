import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getToken, getCachedToken } from '@/services/token';

type Props = {
  uri: string;
};

export function VideoPlayer({ uri }: Props) {
  const [authHeader, setAuthHeader] = useState<Record<string, string> | undefined>(undefined);
  useEffect(() => {
    const t = getCachedToken();
    if (t) setAuthHeader({ Authorization: `Bearer ${t}` });
    else getToken().then((v) => v && setAuthHeader({ Authorization: `Bearer ${v}` }));
  }, []);

  const source = useMemo(() => ({ uri, headers: authHeader }), [uri, authHeader]);
  const player = useVideoPlayer(source);
  return (
    <View style={styles.wrap}>
      <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
});
