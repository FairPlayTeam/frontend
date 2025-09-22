import { useThemeColor } from '@/hooks/use-theme-color';
import { getCachedToken } from '@/services/token';
import { getUser } from '@/services/users';
import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { API_BASE_URL } from '@/config';

type Props = {
  idOrUsername: string;
  size?: number;
  style?: ViewStyle | ViewStyle[];
  avatarUrl?: string | null;
};

export const Pfp = memo(function PfpBase({ idOrUsername, size = 44, style, avatarUrl }: Props) {
  const [url, setUrl] = useState<string | null>(avatarUrl ?? null);
  const [uname, setUname] = useState<string>('');
  const bg = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');

  useEffect(() => {
    let mounted = true;
    if (!idOrUsername) return;
    
    if (avatarUrl !== undefined) {
      setUrl(avatarUrl);
      setUname(String(idOrUsername));
      return;
    }
    
    getUser(String(idOrUsername))
      .then((u) => {
        if (!mounted) return;
        setUrl(u.avatarUrl || null);
        setUname(u.username || '');
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [idOrUsername, avatarUrl]);

  const dim = { width: size, height: size, borderRadius: size / 2 } as const;
  
  const getImageUri = (avatarUrl: string | null) => {
    if (!avatarUrl) return null;
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
    return `${API_BASE_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
  };

  if (url) {
    const imageUri = getImageUri(url);
    if (imageUri) {
      return (
        <View style={[styles.base, dim, style]}>
          <Image
            source={{
              uri: imageUri,
              headers: getCachedToken()
                ? { Authorization: `Bearer ${getCachedToken()}` }
                : undefined,
            }}
            style={styles.fill}
          />
        </View>
      );
    }
  }
  return (
    <View
      style={[styles.base, styles.center, dim, { backgroundColor: bg }, style]}
    >
      <Text
        style={{
          color: text,
          fontWeight: '600',
          fontSize: Math.round(size * 0.45),
          lineHeight: size,
        }}
      >
        {uname?.[0]?.toUpperCase() || '?'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  fill: { width: '100%', height: '100%' },
});
