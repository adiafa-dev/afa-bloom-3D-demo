import { useCallback, useEffect, useRef } from 'react';

const VIDEO_URL =
  '/assets/aistudio/kling_20261120_VIDEO_Tolong_bua_4205_0_f0492195.mp4';

const SENSITIVITY = 0.8;

export function ScrubVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const isReadyRef = useRef(false);

  const handleReady = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0 &&
      video.readyState >= 1 &&
      !isReadyRef.current
    ) {
      isReadyRef.current = true;
      targetTimeRef.current = video.currentTime || 0;
    }
  }, []);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      isSeekingRef.current = false;
      return;
    }

    const clamped = Math.min(
      Math.max(targetTimeRef.current, 0),
      Math.max(video.duration - 0.01, 0)
    );

    if (Math.abs(video.currentTime - clamped) > 0.04) {
      video.currentTime = clamped;
      return;
    }

    isSeekingRef.current = false;
  }, []);

  useEffect(() => {
    handleReady();

    const handleMouseMove = (event: MouseEvent) => {
      if (prevXRef.current === null) {
        prevXRef.current = event.clientX;
        return;
      }

      const delta = event.clientX - prevXRef.current;
      prevXRef.current = event.clientX;

      if (delta === 0) return;

      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      if (!isReadyRef.current && video.readyState >= 1) {
        isReadyRef.current = true;
        targetTimeRef.current = video.currentTime || 0;
      }

      if (!isReadyRef.current) return;

      const timeOffset =
        (delta / Math.max(window.innerWidth, 1)) *
        SENSITIVITY *
        video.duration;

      const nextTarget = Math.min(
        Math.max(targetTimeRef.current + timeOffset, 0),
        Math.max(video.duration - 0.01, 0)
      );

      if (Math.abs(nextTarget - targetTimeRef.current) < 0.002) return;
      targetTimeRef.current = nextTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleReady]);

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={handleReady}
      onLoadedData={handleReady}
      onCanPlay={handleReady}
      onCanPlayThrough={handleReady}
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