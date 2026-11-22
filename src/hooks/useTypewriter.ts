import { useEffect, useState } from 'react';

interface UseTypewriterResult {
  displayed: string;
  done: boolean;
}

export function useTypewriter(
  text: string,
  speed = 38,
  startDelay = 600
): UseTypewriterResult {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setCount(0);
    setDone(false);

    if (!text.length) {
      setDone(true);
      return;
    }

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setCount((prev) => {
          const next = prev + 1;
          if (next >= text.length) {
            if (intervalId !== undefined) {
              window.clearInterval(intervalId);
            }
            setDone(true);
            return text.length;
          }
          return next;
        });
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [text, speed, startDelay]);

  return {
    displayed: text.slice(0, count),
    done,
  };
}
