
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

    if (Math.abs(target - video.currentTime) < SEEK_THRESHOLD) {
      return;
    }

    isSeekingRef.current = true;
    requestedTimeRef.current = target;
    video.currentTime = target;
  }, []);

  const handleReady = useCallback(() => {
    const video = videoRef.current;

    if (!video || video.readyState < 2) return;

    if (!isReadyRef.current) {
      isReadyRef.current = true;
      targetTimeRef.current = video.currentTime || 0;
      requestedTimeRef.current = video.currentTime || 0;

      console.log('[VIDEO] Ready - scrubbing initialized');
    }
  }, []);

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;

    const difference = Math.abs(
      targetTimeRef.current - requestedTimeRef.current
    );

    if (difference > SEEK_THRESHOLD) {
      startSeek();
    }
  }, [startSeek]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const video = videoRef.current;

      if (
        !video ||
        !isReadyRef.current ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        prevXRef.current = event.clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = event.clientX;
        return;
      }

      const delta = event.clientX - prevXRef.current;
      prevXRef.current = event.clientX;

      if (delta === 0) return;

      const offset =
        (delta / Math.max(window.innerWidth, 1)) *
        SENSITIVITY *
        video.duration;

      targetTimeRef.current = Math.max(
        0,
        Math.min(
          targetTimeRef.current + offset,
          video.duration - 0.05
        )
      );

      startSeek();
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove, {
      passive: true,
    });

    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [startSeek]);

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      muted
      playsInline
      preload="auto"
      onLoadedData={handleReady}
      onCanPlay={handleReady}
      onSeeked={handleSeeked}
      aria-hidden="true"
      className="fixed inset-0 z-0 w-full h-full object-cover pointer-events-none brightness-[1.04] translate-x-[8%] sm:translate-x-[0%] md:translate-x-[18%] lg:translate-x-[22%]"
      style={{
        objectPosition: 'center center',
        maskImage: 'linear-gradient(to right, transparent 0%, black 12%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 12%)',
      }}
    />
  );
}
