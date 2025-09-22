import { useEffect, useRef } from 'react';
import HlsJS from 'hls.js';
import { getCachedToken } from '@/services/token';

type Props = { uri: string };

export function VideoPlayer({ uri }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !uri) return;
    let hls: HlsJS | null = null;
    const canUseHls = typeof (HlsJS as any).isSupported === 'function' ? (HlsJS as any).isSupported() : false;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      try { (video as any).crossOrigin = 'use-credentials'; } catch {}
      video.src = uri;
    } else if (canUseHls) {
      const token = getCachedToken();
      hls = new HlsJS({
        enableWorker: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        },
      });
      hls.loadSource(uri);
      hls.attachMedia(video);
    } else {
      video.src = uri;
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [uri]);

  return (
    <video ref={ref} controls style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }} />
  );
}
