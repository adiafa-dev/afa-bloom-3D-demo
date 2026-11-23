import { useCallback, useEffect, useRef } from 'react';

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

    const difference = Math.abs(
      targetTimeRef.current - requestedTimeRef.current
    );

    if (difference > SEEK_THRESHOLD) startSeek();
  }, [startSeek]);

  // ✅ Setup ready-state secara robust
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => {
      if (isReadyRef.current) return;
      if (video.readyState < 2 || !Number.isFinite(video.duration)) return;

      isReadyRef.current = true;
      targetTimeRef.current = video.currentTime || 0;
      requestedTimeRef.current = video.currentTime || 0;

      // Prime decoder supaya frame pertama bisa di-seek
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.then(() => video.pause()).catch(() => {
          /* autoplay diblokir, aman diabaikan karena muted */
        });
      } else {
        video.pause();
      }
    };

    // Kalau event sudah terlanjur lewat, cek langsung
    markReady();

    // Pasang listener native (bukan cuma lewat props React)
    video.addEventListener('loadedmetadata', markReady);
    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);
    video.addEventListener('canplaythrough', markReady);
    video.addEventListener('durationchange', markReady);

    // Safety net: polling singkat kalau semua event terlewat
    const interval = window.setInterval(() => {
      markReady();
      if (isReadyRef.current) window.clearInterval(interval);
    }, 200);

    return () => {
      window.clearInterval(interval);
      video.removeEventListener('loadedmetadata', markReady);
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
      video.removeEventListener('canplaythrough', markReady);
      video.removeEventListener('durationchange', markReady);
    };
  }, []);

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

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [startSeek]);

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
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