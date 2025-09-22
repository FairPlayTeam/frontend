import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export function RoleSelectModal(props: {
  visible: boolean;
  onRequestClose: () => void;
  onSelect: (role: 'user' | 'moderator' | 'admin') => void;
  acting?: boolean;
}) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onRequestClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { borderColor: border }]}> 
          <ThemedText type="title">Set role</ThemedText>
          <View style={styles.actions}>
            <Pressable disabled={props.acting} onPress={() => props.onSelect('user')} style={[styles.btn, { borderColor: border }]}> 
              <Text style={{ color: text }}>User</Text>
            </Pressable>
            <Pressable disabled={props.acting} onPress={() => props.onSelect('moderator')} style={[styles.btn, { borderColor: border }]}> 
              <Text style={{ color: text }}>Moderator</Text>
            </Pressable>
            <Pressable disabled={props.acting} onPress={() => props.onSelect('admin')} style={[styles.btn, { borderColor: border }]}> 
              <Text style={{ color: text }}>Admin</Text>
            </Pressable>
          </View>
          <Pressable onPress={props.onRequestClose} style={[styles.btn, { borderColor: border }]}> 
            <Text style={{ color: text }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#111', borderWidth: 1, borderRadius: 12, padding: 16, gap: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
});
