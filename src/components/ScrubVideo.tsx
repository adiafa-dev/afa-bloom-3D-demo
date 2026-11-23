
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

  const isSeekingRef = useRef(false);
  const isReadyRef = useRef(false);

  const requestSeek = useCallback((time: number) => {
    const video = videoRef.current;

    if (
      !video ||
      !isReadyRef.current ||
      video.readyState < 2 ||
      !Number.isFinite(video.duration)
    ) {
      return;
    }

    const nextTime = Math.max(
      0,
      Math.min(time, video.duration - 0.05)
    );

    if (isSeekingRef.current) return;

    if (Math.abs(video.currentTime - nextTime) < SEEK_THRESHOLD) {
      return;
    }

    isSeekingRef.current = true;
    requestedTimeRef.current = nextTime;

    video.currentTime = nextTime;
  }, []);

  const handleReady = useCallback(() => {
    const video = videoRef.current;

    if (!video || video.readyState < 2) return;

    if (!isReadyRef.current) {
      targetTimeRef.current = video.currentTime || 0;
      requestedTimeRef.current = video.currentTime || 0;
      isReadyRef.current = true;
    }
  }, []);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    isSeekingRef.current = false;

    const difference = Math.abs(
      targetTimeRef.current - requestedTimeRef.current
    );

    if (difference > SEEK_THRESHOLD) {
      requestSeek(targetTimeRef.current);
    }
  }, [requestSeek]);

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

      const timeOffset =
        (delta / Math.max(window.innerWidth, 1)) *
        SENSITIVITY *
        video.duration;

      targetTimeRef.current = Math.max(
        0,
        Math.min(
          targetTimeRef.current + timeOffset,
          video.duration - 0.05
        )
      );

      requestSeek(targetTimeRef.current);
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
  }, [requestSeek]);

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
