import { VideoCard as BaseVideoCard } from '@/components/video-card';
import type { ViewStyle } from 'react-native';

type Props = {
  thumbnailUrl: string | null;
  title: string;
  displayName?: string | null;
  meta?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export function VideoCard(props: Props) {
  return <BaseVideoCard {...props} variant="grid" />;
}
