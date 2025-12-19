import { http } from '@/services/http';

export type Me = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  role: string;
  isVerified: boolean;
  followerCount?: number;
  totalViews?: string;
  totalEarnings?: string;
  createdAt: string;
};

export async function getMe() {
  return http.get<Me>('/auth/me');
}

export async function updateMe(body: { displayName?: string; bio?: string }) {
  return http.patch<{ message: string; user: Me }>('/auth/me', body);
}

export type Session = {
  id: string;
  sessionKey: string;
  ipAddress: string;
  deviceInfo: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export async function listSessions() {
  return http.get<{ sessions: Session[]; total: number }>('/auth/sessions');
}

export async function revokeSession(sessionId: string) {
  return http.del<{ message: string }>(`/auth/sessions/${encodeURIComponent(sessionId)}`);
}

export async function logoutAllSessions() {
  return http.del<{ message: string; sessionsLoggedOut: number }>("/auth/sessions/all");
}

export async function logoutOtherSessions() {
  return http.del<{ message: string; sessionsLoggedOut: number }>("/auth/sessions/others/all");
}
async function fileFromUri(file: { uri: string; name: string; type: string }) {
  if (!file.uri.startsWith('blob:')) return file;
  console.log("ca marche 1")
  const res = await fetch(file.uri);
  const blob = await res.blob();

  return {
    uri: file.uri,
    name: file.name,
    type: blob.type || file.type,
    blob,
  };
}

export async function uploadAvatar(file: { uri: string; name: string; type: string }) {
  const f = await fileFromUri(file);
  const form = new FormData();
  if ('blob' in f) {
    form.append('avatar', f.blob, f.name);
  } else {
    form.append('avatar', {
      uri: f.uri,
      name: f.name,
      type: f.type,
    } as any);
  }

  return http.post<{ message: string; storagePath: string; size: number; mimetype: string }>(
    '/upload/avatar',
    form
  );
}

export async function uploadBanner(file: { uri: string; name: string; type: string }) {
  const f = await fileFromUri(file);
  const form = new FormData();
  if ('blob' in f) {
    form.append('banner', f.blob, f.name);
  } else {
    form.append('banner', {
      uri: f.uri,
      name: f.name,
      type: f.type,
    } as any);
  }

  return http.post<{ message: string; storagePath: string; size: number; mimetype: string }>(
    '/upload/banner',
    form
  );
}
