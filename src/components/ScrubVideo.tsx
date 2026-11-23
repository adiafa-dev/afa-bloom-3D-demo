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

  const canScrubVideo = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return false;
    const hasDuration = Number.isFinite(video.duration) && video.duration > 0;
    return hasDuration && video.readyState >= 1;
  }, []);

  const syncReadyState = useCallback(() => {
    const video = videoRef.current;
    if (!canScrubVideo(video)) return;

    if (!isReadyRef.current && video) {
      isReadyRef.current = true;
      targetTimeRef.current = video.currentTime || 0;
    }
  }, [canScrubVideo]);

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

    if (Math.abs(video.currentTime - clamped) > 0.03) {
      video.currentTime = clamped;
      return;
    }

    isSeekingRef.current = false;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState === 0) {
      video.load();
    }
    syncReadyState();

    const stepScrub = () => {
      const vid = videoRef.current;
      if (canScrubVideo(vid) && vid && !isSeekingRef.current) {
        if (!isReadyRef.current) {
          isReadyRef.current = true;
          targetTimeRef.current = vid.currentTime || 0;
        }

        const clampedTarget = Math.min(
          Math.max(targetTimeRef.current, 0),
          Math.max(vid.duration - 0.01, 0)
        );

        if (Math.abs(clampedTarget - vid.currentTime) > 0.01) {
          isSeekingRef.current = true;
          vid.currentTime = clampedTarget;
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

      const vid = videoRef.current;
      if (!canScrubVideo(vid) || !vid) return;

      if (!isReadyRef.current) {
        isReadyRef.current = true;
        targetTimeRef.current = vid.currentTime || 0;
      }

      const timeOffset =
        (delta / Math.max(window.innerWidth, 1)) *
        SENSITIVITY *
        vid.duration;

      targetTimeRef.current = Math.min(
        Math.max(targetTimeRef.current + timeOffset, 0),
        Math.max(vid.duration - 0.01, 0)
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
  }, [canScrubVideo, syncReadyState]);

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