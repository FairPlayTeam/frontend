import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/auth';
import { getMe, updateMe, uploadAvatar, uploadBanner, type Me } from '@/services/account';

export default function ProfileScreen() {
  const { user } = useAuth();
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ avatar: boolean; banner: boolean }>({ avatar: false, banner: false });

  useEffect(() => {
    let mounted = true;
    getMe().then((m: Me) => {
      if (!mounted) return;
      setDisplayName(m.displayName || '');
      setBio(m.bio || '');
      setAvatarUrl(m.avatarUrl || '');
      setBannerUrl(m.bannerUrl || '');
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function onSave() {
    setSaving(true);
    try {
      await updateMe({ displayName: displayName || undefined, bio: bio || undefined });
      Alert.alert('Saved', 'Profile updated');
    } catch {
      Alert.alert('Error', 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (res.canceled || !res.assets?.length) return null;
    const a = res.assets[0];
    const uri = a.uri;
    const name = uri.split('/').pop() || 'image.jpg';
    const type = (a as any).mimeType || 'image/jpeg';
    return { uri, name, type };
  }

  async function onUploadAvatar() {
    const file = await pickImage();
    if (!file) return;
    setUploading((s) => ({ ...s, avatar: true }));
    try {
      await uploadAvatar(file);
      const m = await getMe();
      setAvatarUrl(m.avatarUrl || '');
    } finally {
      setUploading((s) => ({ ...s, avatar: false }));
    }
  }

  async function onUploadBanner() {
    const file = await pickImage();
    if (!file) return;
    setUploading((s) => ({ ...s, banner: true }));
    try {
      await uploadBanner(file);
      const m = await getMe();
      setBannerUrl(m.bannerUrl || '');
    } finally {
      setUploading((s) => ({ ...s, banner: false }));
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Profile</ThemedText>
        <View style={styles.card}>
          <ThemedText>Avatar</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatarWrap}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#d4d4d4' }]} />
              )}
            </View>
            <Pressable style={styles.secondaryBtn} onPress={onUploadAvatar} disabled={uploading.avatar}>
              <Text style={styles.secondaryBtnText}>{uploading.avatar ? 'Uploading...' : 'Upload photo'}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.card}>
          <ThemedText>Banner</ThemedText>
          <View style={styles.bannerWrap}>
            {bannerUrl ? (
              <Image source={{ uri: bannerUrl }} style={styles.banner} />
            ) : (
              <View style={[styles.banner, { backgroundColor: '#e5e5e5' }]} />
            )}
          </View>
          <Pressable style={styles.secondaryBtn} onPress={onUploadBanner} disabled={uploading.banner}>
            <Text style={styles.secondaryBtnText}>{uploading.banner ? 'Uploading...' : 'Upload photo'}</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <ThemedText>Display name</ThemedText>
          <TextInput value={displayName} onChangeText={setDisplayName} style={[styles.input, { color: text, borderColor: border }]} placeholderTextColor={border} />
          <ThemedText>Bio</ThemedText>
          <TextInput value={bio} onChangeText={setBio} multiline style={[styles.input, { color: text, borderColor: border, minHeight: 80 }]} placeholderTextColor={border} />
          <Pressable style={styles.primaryBtn} onPress={onSave} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, gap: 16 },
  card: { gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, borderColor: '#e5e5e5' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  primaryBtn: { backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  avatarWrap: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%', borderRadius: 28 },
  bannerWrap: { width: '100%', height: 120, borderRadius: 8, overflow: 'hidden' },
  banner: { width: '100%', height: '100%' },
  secondaryBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff', borderColor: '#fff' },
  secondaryBtnText: { fontWeight: '600', color: '#000' },
})
