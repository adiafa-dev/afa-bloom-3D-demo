import { useCallback, useEffect, useRef, useState } from 'react';

const VIDEO_URL =
  '/assets/aistudio/kling_20261120_VIDEO_Tolong_bua_4205_0_f0492195.mp4';

const SENSITIVITY = 0.8;
const SEEK_THRESHOLD = 0.04;

export function ScrubVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);

  const targetTimeRef = useRef(0);
  const requestedTimeRef = useRef(0);

  const isReadyRef = useRef(false);
  const isSeekingRef = useRef(false);

  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // 1) Download full video -> blob URL
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    (async () => {
      try {
        const res = await fetch(VIDEO_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('[VIDEO] gagal download:', err);
        }
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const startSeek = useCallback(() => {
    const video = videoRef.current;
    if (
      !video ||
      !isReadyRef.current ||
      isSeekingRef.current ||
      video.readyState < 2 ||
      !Number.isFinite(video.duration)
    ) {
      return;
    }

    const target = Math.max(
      0,
      Math.min(targetTimeRef.current, video.duration - 0.05)
    );
    if (Math.abs(target - video.currentTime) < SEEK_THRESHOLD) return;

    isSeekingRef.current = true;
    requestedTimeRef.current = target;
    video.currentTime = target;
  }, []);

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;
    if (
      Math.abs(targetTimeRef.current - requestedTimeRef.current) >
      SEEK_THRESHOLD
    ) {
      startSeek();
    }
  }, [startSeek]);

  // 2) Ready detection, jalan setelah blobUrl terpasang
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !blobUrl) return;

    isReadyRef.current = false;

    const markReady = () => {
      if (isReadyRef.current) return;
      if (video.readyState < 2 || !Number.isFinite(video.duration)) return;

      isReadyRef.current = true;
      targetTimeRef.current = video.currentTime || 0;
      requestedTimeRef.current = video.currentTime || 0;

      // prime decoder
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.then(() => video.pause()).catch(() => {});
      } else {
        video.pause();
      }
    };

    markReady();
    video.addEventListener('loadedmetadata', markReady);
    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);

    const interval = window.setInterval(() => {
      markReady();
      if (isReadyRef.current) window.clearInterval(interval);
    }, 200);

    return () => {
      window.clearInterval(interval);
      video.removeEventListener('loadedmetadata', markReady);
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
    };
  }, [blobUrl]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const video = videoRef.current;

      if (prevXRef.current === null) {
        prevXRef.current = event.clientX;
        return;
      }

      const delta = event.clientX - prevXRef.current;
      prevXRef.current = event.clientX;

      if (
        !video ||
        !isReadyRef.current ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0 ||
        delta === 0
      ) {
        return;
      }

      const offset =
        (delta / Math.max(window.innerWidth, 1)) *
        SENSITIVITY *
        video.duration;

      targetTimeRef.current = Math.max(
        0,
        Math.min(targetTimeRef.current + offset, video.duration - 0.05)
      );

      startSeek();
    };

    const handleLeave = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [startSeek]);

  return (
    <video
      ref={videoRef}
      src={blobUrl ?? undefined}
      muted
      playsInline
      preload="auto"
      onSeeked={handleSeeked}
      aria-hidden="true"
      className="fixed inset-0 z-0 w-full h-full object-cover pointer-events-none brightness-[1.04] translate-x-[8%] sm:translate-x-[0%] md:translate-x-[18%] lg:translate-x-[22%]"
      style={{
        objectPosition: 'center center',
        maskImage: 'linear-gradient(to right, transparent 0%, black 12%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%)',
      }}
    />
  );
}