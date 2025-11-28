import { ReactElement } from 'react';
import { FlatList, Platform, StyleProp, View, ViewStyle } from 'react-native';
import { computeItemWidth } from '@/utils/grid';
import { contentPadding as defaultPadding, gridGap as defaultGap } from '@/constants/layout';

export function VideoGrid<T>(props: {
  data: T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T) => string;
  contentPadding?: number;
  gap?: number;
  contentEdgeOnWeb?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: ReactElement | null;
  extraContentHeader?: ReactElement | null;
  width: number;
}) {
  const padding = props.contentPadding ?? defaultPadding;
  const gap = props.gap ?? defaultGap;
  const { cols, itemWidth } = computeItemWidth(props.width, padding, gap);
  const basePad = Platform.OS === 'web' && props.contentEdgeOnWeb ? { paddingHorizontal: 0 } : { paddingHorizontal: padding };
  const contentStyle: StyleProp<ViewStyle> = [basePad, { paddingBottom: 24, gap, width: '100%' }];
  return (
    <FlatList
      key={`grid-${cols}`}
      contentContainerStyle={contentStyle}
      data={props.data}
      keyExtractor={props.keyExtractor}
      renderItem={({ item }) => <View style={{ width: itemWidth }}>{props.renderItem(item)}</View>}
      numColumns={cols}
      columnWrapperStyle={{ gap }}
      refreshing={props.refreshing}
      onRefresh={props.onRefresh}
      ListEmptyComponent={props.ListEmptyComponent ?? null}
      ListHeaderComponent={props.extraContentHeader ?? null}
    />
  );
}
