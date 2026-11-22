import { useEffect, useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

export type HeroAction =
  | 'Lets build something'
  | 'Explore our studio'
  | 'Say hello'
  | 'How we work';

const ACTION_PILLS: HeroAction[] = [
  'Lets build something',
  'Explore our studio',
  'Say hello',
  'How we work',
];

const HERO_PROMPT_TEXT = `Have an idea? Let's make it happen!
We turn creative thoughts into digital experiences.`;

interface HeroProps {
  onSelectAction: (action: HeroAction) => void;
}

export function Hero({ onSelectAction }: HeroProps) {
  const { displayed, done } = useTypewriter(HERO_PROMPT_TEXT, 38, 600);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPillsVisible(true);
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@afabloom.com');
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="relative z-[1] h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
      <div className="max-w-xl relative z-10">
        {/* 1. Blurred intro label */}
        <p
          className="pointer-events-none select-none mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            fontWeight: 400,
            color: '#0F172A',
            filter: 'blur(3px)',
          }}
        >
          Hey there, meet Adi or Afa,
          <br />
          Your friendly creative partner, idea explorer, and digital maker.
        </p>

        {/* 2. Typewriter text */}
        <p
          className="text-[#0F172A] mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: '54px',
          }}
        >
          {displayed}
          {!done && (
            <span
              aria-hidden="true"
              className="inline-block w-[2px] h-[1.1em] bg-[#0F172A] align-middle ml-[2px]"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          )}
        </p>

        {/* 3. Action pill buttons */}
        <div
          className="flex flex-wrap gap-y-1"
          style={{
            opacity: pillsVisible ? 1 : 0,
            transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {ACTION_PILLS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelectAction(label)}
              className="inline-flex items-center justify-center bg-[#0F172A] text-white border border-[#0F172A] rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-white hover:text-[#0F172A] transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F172A] focus-visible:outline-offset-2"
            >
              {label}
            </button>
          ))}

          {/* Outline copy email pill */}
          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label={
              copied
                ? 'Copied hello@afabloom.com to clipboard'
                : 'Copy hello@afabloom.com to clipboard'
            }
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-[#0F172A] text-white border border-[#0F172A] rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-white hover:text-[#0F172A] transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F172A] focus-visible:outline-offset-2"
          >
            <span>
              {copied ? 'Copied: ' : 'Reach us: '}
              <span className="underline underline-offset-1">
                hello@afabloom.com
              </span>
            </span>
            {copied ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M2 6.5L4.75 9.25L10 3.25"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <rect
                  x="4"
                  y="4"
                  width="6.5"
                  height="6.5"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M8 4V2.5C8 1.94772 7.55228 1.5 7 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5V7C1.5 7.55228 1.94772 8 2.5 8H4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
