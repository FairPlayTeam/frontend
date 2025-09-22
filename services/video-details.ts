import { http } from '@/services/http';

export type HlsInfo = {
  master: string | null;
  variants?: Record<string, string | null>;
  available?: string[];
  preferred?: string;
};

export type VideoDetails = {
  id: string;
  title: string;
  hls: HlsInfo;
  thumbnailUrl: string | null;
  viewCount: string;
  avgRating: number;
  ratingsCount: number;
  description?: string | null;
  user?: { username: string; displayName: string | null; avatarUrl?: string | null; id?: string };
};

export async function getVideo(id: string) {
  return http.get<VideoDetails>(`/videos/${encodeURIComponent(id)}`);
}

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByMe?: boolean;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  _count?: { replies: number };
  replies?: CommentItem[];
};

export type CommentsResponse = {
  comments: CommentItem[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number; itemsReturned: number };
};

export async function getVideoComments(videoId: string, params?: { page?: number; limit?: number; repliesLimit?: number; childRepliesLimit?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.repliesLimit) q.set('repliesLimit', String(params.repliesLimit));
  if (params?.childRepliesLimit) q.set('childRepliesLimit', String(params.childRepliesLimit));
  const qs = q.toString();
  return http.get<CommentsResponse>(`/videos/${encodeURIComponent(videoId)}/comments${qs ? `?${qs}` : ''}`);
}

export async function addComment(videoId: string, content: string, parentId?: string) {
  return http.post<{ message: string; comment: CommentItem }>(`/videos/${encodeURIComponent(videoId)}/comments`, { content, parentId });
}

export async function rateVideo(videoId: string, score: number) {
  return http.post(`/videos/${encodeURIComponent(videoId)}/rating`, { score });
}

export async function likeComment(commentId: string) {
  return http.post<{ message: string; likeCount: number }>(`/comments/${encodeURIComponent(commentId)}/like`);
}

export async function unlikeComment(commentId: string) {
  return http.del<{ message: string; likeCount: number }>(`/comments/${encodeURIComponent(commentId)}/like`);
}

export async function getCommentReplies(commentId: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return http.get<{ replies: CommentItem[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number; itemsReturned: number } }>(
    `/comments/${encodeURIComponent(commentId)}/replies?${qs}`
  );
}
