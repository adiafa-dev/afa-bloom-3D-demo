
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
    if (!video || !Number.isFinite(video.duration)) return;

    isReadyRef.current = true;
    targetTimeRef.current = video.currentTime || 0;
  }, []);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      isSeekingRef.current = false;
      return;
    }

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.03) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  }, []);

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

      targetTimeRef.current = Math.min(
        Math.max(targetTimeRef.current + timeOffset, 0),
        video.duration - 0.01
      );

      if (!isSeekingRef.current && video.readyState >= 2) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
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
  }, []);

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={handleReady}
      onLoadedData={handleReady}
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
