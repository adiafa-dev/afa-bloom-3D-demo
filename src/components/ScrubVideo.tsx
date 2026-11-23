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
  const rafIdRef = useRef<number | null>(null);

  const syncReadyState = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0 &&
      video.readyState >= 2
    ) {
      if (!isReadyRef.current) {
        isReadyRef.current = true;
        targetTimeRef.current = video.currentTime || 0;
      }
    }
  }, []);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      isSeekingRef.current = false;
      return;
    }

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.03) {
      const clamped = Math.min(
        Math.max(targetTimeRef.current, 0),
        Math.max(video.duration - 0.01, 0)
      );
      if (Math.abs(clamped - video.currentTime) > 0.005) {
        video.currentTime = clamped;
        return;
      }
    }

    isSeekingRef.current = false;
  }, []);

  useEffect(() => {
    // Antisipasi jika video sudah siap sebelum listener terpasang
    syncReadyState();

    const stepScrub = () => {
      const video = videoRef.current;
      if (
        video &&
        isReadyRef.current &&
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.readyState >= 2 &&
        !isSeekingRef.current
      ) {
        const clampedTarget = Math.min(
          Math.max(targetTimeRef.current, 0),
          Math.max(video.duration - 0.01, 0)
        );

        if (Math.abs(clampedTarget - video.currentTime) > 0.01) {
          isSeekingRef.current = true;
          video.currentTime = clampedTarget;
        }
      }

      rafIdRef.current = window.requestAnimationFrame(stepScrub);
    };

    rafIdRef.current = window.requestAnimationFrame(stepScrub);

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

      const timeOffset =
        (delta / Math.max(window.innerWidth, 1)) *
        SENSITIVITY *
        video.duration;

      targetTimeRef.current = Math.min(
        Math.max(targetTimeRef.current + timeOffset, 0),
        Math.max(video.duration - 0.01, 0)
      );
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [syncReadyState]);

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={syncReadyState}
      onLoadedData={syncReadyState}
      onCanPlay={syncReadyState}
      onCanPlayThrough={syncReadyState}
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