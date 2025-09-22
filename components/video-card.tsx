import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCachedToken } from '@/services/token';
import { API_BASE_URL } from '@/config';

type Props = {
  thumbnailUrl: string | null;
  title: string;
  displayName?: string | null;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'grid' | 'list';
};

export function VideoCard({ thumbnailUrl, title, displayName, subtitle, meta, onPress, style, variant = 'grid' }: Props) {
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const isGrid = variant === 'grid';
  const token = getCachedToken();
  const isApiUrl = !!thumbnailUrl && thumbnailUrl.startsWith(API_BASE_URL);
  const isSigned = !!thumbnailUrl && /[?&](X-Amz-|Signature=)/.test(thumbnailUrl);
  const headers = isApiUrl && token && !isSigned ? { Authorization: `Bearer ${token}` } : undefined;
  if (isGrid) {
    return (
      <Pressable onPress={onPress} style={[styles.colCard, { borderColor }, style]}> 
        <View style={styles.thumbRatio}>
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl, headers }} style={styles.thumbFill} contentFit="cover" />
          ) : (
            <View style={[styles.thumbFill, { backgroundColor: '#d4d4d4' }]} />
          )}
        </View>
        <ThemedText numberOfLines={2} style={styles.colTitle}>{title}</ThemedText>
        {displayName ? (
          <Text style={[styles.nameLine, { color: textColor }]} numberOfLines={1}>{displayName}</Text>
        ) : null}
        {meta ? (
          <Text style={[styles.metaLine, { color: textColor }]} numberOfLines={1}>{meta}</Text>
        ) : null}
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={[styles.rowCard, { borderColor }, style]}> 
      <View style={styles.rowThumb}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl, headers }} style={styles.thumbFill} contentFit="cover" />
        ) : (
          <View style={[styles.thumbFill, { backgroundColor: '#d4d4d4' }]} />
        )}
      </View>
      <View style={styles.rowMeta}>
        <ThemedText type="defaultSemiBold" numberOfLines={2}>{title}</ThemedText>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={1}>{subtitle}</Text>
        ) : null}
        {meta ? (
          <Text style={[styles.metaLine, { color: textColor }]} numberOfLines={1}>{meta}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  colCard: { gap: 6, borderWidth: 1, borderRadius: 10, padding: 8 },
  thumbRatio: { width: '100%', aspectRatio: 16 / 9, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e5e5e5' },
  thumbFill: { width: '100%', height: '100%' },
  colTitle: { fontWeight: '600', fontSize: 16 },
  nameLine: { opacity: 0.85, fontSize: 12, fontWeight: '500' },
  metaLine: { opacity: 0.7, fontSize: 12 },
  rowCard: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 10, padding: 10 },
  rowThumb: { width: 140, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e5e5e5' },
  rowMeta: { flex: 1, justifyContent: 'center', gap: 4 },
  subtitle: { opacity: 0.8 },
});
