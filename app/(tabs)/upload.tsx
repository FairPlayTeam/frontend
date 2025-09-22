import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View, ActionSheetIOS } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { http } from '@/services/http';
import { useAuth } from '@/context/auth';
import { useRouter } from 'expo-router';

export default function UploadTab() {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const pickedFile = useRef<File | { uri: string; name: string; type: string } | null>(null);

  function onPick() {
    if (Platform.OS === 'web') {
      if (!fileRef.current) return;
      fileRef.current.click();
    } else {
      pickNative();
    }
  }

  function onFileChange(e: any) {
    const f: File | undefined = e?.target?.files?.[0];
    if (f) {
      pickedFile.current = f;
      setFileName(f.name);
    }
  }

  async function pickFromFiles() {
    const res = await DocumentPicker.getDocumentAsync({ type: 'video/*', multiple: false, copyToCacheDirectory: true });
    if (res.canceled) return;
    const f = res.assets?.[0];
    if (f) {
      pickedFile.current = { uri: f.uri, name: f.name || 'video.mp4', type: f.mimeType || 'video/mp4' };
      setFileName(f.name || 'video');
    }
  }

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 1 });
    if (res.canceled) return;
    const a = res.assets?.[0];
    if (a) {
      pickedFile.current = { uri: a.uri, name: (a as any).fileName || 'video.mp4', type: a.mimeType || 'video/mp4' };
      setFileName((a as any).fileName || 'video');
    }
  }

  async function pickFromCamera() {
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (!camPerm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 1 });
    if (res.canceled) return;
    const a = res.assets?.[0];
    if (a) {
      pickedFile.current = { uri: a.uri, name: (a as any).fileName || 'video.mp4', type: a.mimeType || 'video/mp4' };
      setFileName((a as any).fileName || 'video');
    }
  }

  function pickNative() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Record video', 'Choose from library', 'Choose from Files'],
          cancelButtonIndex: 0,
        },
        async (i) => {
          if (i === 1) await pickFromCamera();
          else if (i === 2) await pickFromLibrary();
          else if (i === 3) await pickFromFiles();
        }
      );
    } else {
      pickFromFiles();
    }
  }

  async function onSubmit() {
    setError(null);
    setSuccess(null);
    if (!user) {
      router.push('/login');
      return;
    }
    if (!title.trim()) {
      setError('Title required');
      return;
    }
    if (!pickedFile.current) {
      setError('Select a video file');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('title', title.trim());
      if (description.trim()) form.append('description', description.trim());
      if (tags.trim()) form.append('tags', tags.trim());
      if (pickedFile.current) form.append('video', pickedFile.current as any);
      const res = await http.post<{ message: string; video: { id: string; title: string } }>('/upload/video', form);
      setSuccess(res.message || 'Uploaded');
      setTitle('');
      setDescription('');
      setTags('');
      setFileName('');
      pickedFile.current = null;
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Upload</ThemedText>
      <View style={{ height: 8 }} />
      {Platform.OS === 'web' ? (
        <>
          <Pressable onPress={onPick} style={[styles.btn, { borderColor: border }]}> 
            <Text style={{ color: text }}>{fileName || 'Choose file'}</Text>
          </Pressable>
          <input
            ref={fileRef as any}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </>
      ) : (
        <Pressable onPress={onPick} style={[styles.btn, { borderColor: border }]}> 
          <Text style={{ color: text }}>{fileName || 'Choose file'}</Text>
        </Pressable>
      )}
      <View style={{ height: 12 }} />
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={border}
        style={[styles.input, { color: text, borderColor: border }]}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor={border}
        style={[styles.textarea, { color: text, borderColor: border }]}
        multiline
      />
      <TextInput
        value={tags}
        onChangeText={setTags}
        placeholder="Tags (comma-separated)"
        placeholderTextColor={border}
        style={[styles.input, { color: text, borderColor: border }]}
      />
      <View style={{ height: 8 }} />
      <Pressable onPress={onSubmit} disabled={uploading} style={styles.submit}>
        <Text style={styles.submitText}>{uploading ? 'Uploading...' : 'Upload'}</Text>
      </Pressable>
      {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
      {success ? <Text style={{ color: '#10b981' }}>{success}</Text> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  btn: { borderWidth: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10 },
  textarea: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, minHeight: 100 },
  submit: { backgroundColor: '#000', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600' },
});
