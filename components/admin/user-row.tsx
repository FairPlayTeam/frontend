import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Pfp } from '@/components/pfp';
import type { AdminUser } from '@/services/admin';

export function AdminUserRow(props: {
  item: AdminUser;
  actingId?: string | null;
  onPressUser: (username: string) => void;
  onPressRole: (user: AdminUser) => void;
  onToggleBan: (user: AdminUser) => void;
}) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  const acting = props.actingId === props.item.id;
  return (
    <Pressable onPress={() => props.onPressUser(props.item.username)} style={[styles.row, { borderColor: border }]}> 
      <View style={styles.avatar}> 
        <Pfp idOrUsername={props.item.username} size={44} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>{props.item.displayName || props.item.username}</ThemedText>
        <Text style={{ color: text, opacity: 0.7 }} numberOfLines={1}>@{props.item.username} • {props.item.role}</Text>
        <Text style={{ color: text, opacity: 0.7 }} numberOfLines={1}>{new Date(props.item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable disabled={acting} onPress={() => props.onPressRole(props.item)} style={[styles.btn, { borderColor: border }]}> 
          <Text style={{ color: text }}>{acting ? '...' : `Role: ${props.item.role}`}</Text>
        </Pressable>
        <Pressable disabled={acting} onPress={() => props.onToggleBan(props.item)} style={[styles.btn, { borderColor: border }]}> 
          <Text style={{ color: text }}>{acting ? '...' : props.item.isBanned ? 'Unban' : 'Ban'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
});
