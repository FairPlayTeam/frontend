import React from 'react';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  AntDesign,
  Entypo,
  Octicons,
  SimpleLineIcons,
} from '@expo/vector-icons';

const packs = {
  ion: Ionicons,
  mdi: MaterialCommunityIcons,
  mat: MaterialIcons,
  fe: Feather,
  fa: FontAwesome,
  fa5: FontAwesome5,
  fa6: FontAwesome6,
  antd: AntDesign,
  ent: Entypo,
  oct: Octicons,
  sl: SimpleLineIcons,
} as const;

type PackKey = keyof typeof packs;

type Props = {
  name: string;
  size?: number;
  color?: string;
};

export function Icon({ name, size = 20, color }: Props) {
  const [maybePack, iconName] = name.includes(':') ? (name.split(':') as [string, string]) : (['ion', name] as [string, string]);
  const key = (maybePack as PackKey) in packs ? (maybePack as PackKey) : 'ion';
  const Cmp = packs[key];
  return <Cmp name={iconName as any} size={size} color={color} />;
}

export const iconPacks = Object.keys(packs) as PackKey[];
