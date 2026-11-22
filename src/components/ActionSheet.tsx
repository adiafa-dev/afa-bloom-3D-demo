import { useEffect, useState } from 'react';
import type { NavSection } from './Navbar';
import type { HeroAction } from './Hero';

export type ActivePanel = NavSection | HeroAction | null;

interface ActionSheetProps {
  activePanel: ActivePanel;
  onClose: () => void;
}

interface SectionContent {
  title: string;
  subtitle: string;
  items?: { label: string; detail: string }[];
  hasForm?: boolean;
  formPlaceholder?: string;
}

const CONTENT_MAP: Record<Exclude<ActivePanel, null>, SectionContent> = {
  Labs: {
    title: 'Afa Bloom Labs',
    subtitle:
      'A little playground where creativity meets technology. We explore new ideas, experiment with AI, and create unique digital experiences.',
    items: [
      {
        label: 'AI-Powered Web Design',
        detail: 'Exploring new ways to turn ideas into beautiful websites with the help of AI.',
      },
      {
        label: 'Interactive Experiences',
        detail: 'Bringing websites to life with motion, animations, and engaging interactions.',
      },
      {
        label: 'Creative Visuals',
        detail: 'Exploring playful characters, unique visuals, and fresh design directions.',
      },
    ],
  },
  Studio: {
    title: 'A Little Studio for Big Ideas',
    subtitle:
      `We help small businesses and growing brands build a beautiful online presence. From the first idea to the final launch, we're here to make your digital journey easier and more exciting.`,
    items: [
      {
        label: 'Website Design & Development',
        detail: 'Beautiful, responsive websites designed to help your business stand out online.',
      },
      {
        label: 'WordPress Websites',
        detail: 'Easy-to-manage websites built with flexible tools, so you can take control of your online presence.',
      },
      {
        label: 'Creative Digital Experiences',
        detail: 'Thoughtful layouts, engaging visuals, and delightful interactions that make your website memorable.',
      },
    ],
  },
  Openings: {
    title: `Let's Collaborate!`,
    subtitle:
      `Good things happen when creative minds come together.\n\nWe love meeting curious people, creative thinkers, and talented makers. Whether you have a cool idea or want to work on something together, we'd love to hear from you.`,
    items: [
      {
        label: 'Creative Collaborators',
        detail: 'Designers, illustrators, and visual storytellers who love bringing fresh ideas to life.',
      },
      {
        label: 'Web Creators',
        detail: 'WordPress developers, frontend enthusiasts, and digital makers who enjoy building beautiful websites.',
      },
      {
        label: 'Project Partners',
        detail: 'Freelancers, creative studios, and businesses interested in making something great together.',
      },
    ],
    hasForm: true,
    formPlaceholder: 'Tell us a little about yourself or your idea...',
  },
  Shop: {
    title: 'The Bloom Shop',
    subtitle:
      'A collection of digital goodies, creative resources, and practical tools to help you bring your ideas to life. Made for curious minds and anyone who loves creating.',
    items: [
      {
        label: 'Website Templates',
        detail: 'Ready-to-use website designs to help you get your online presence started.',
      },
      {
        label: 'AI Website Guides',
        detail: 'Easy-to-follow tutorials that show you how to build beautiful websites with AI, even without coding.',
      },
      {
        label: 'Creative Resources',
        detail: 'Helpful prompts, design assets, and digital tools to make your creative journey easier.',
      },
    ],
  },
  'Get in touch': {
    title: `Let's create something!`,
    subtitle:
      `Have an idea in mind? Tell us a little about it. We'd love to hear what you're dreaming of and help bring it to life.`,
    hasForm: true,
    formPlaceholder: 'Tell us about your idea or project...',
  },
  'Lets build something': {
    title: `Let's build something!`,
    subtitle:
      `Have a business idea or a project in mind? Tell us what you're looking to create, and let's make it happen together.`,
    hasForm: true,
    formPlaceholder: 'Tell us about your business or project...',
  },
  'Explore our studio': {
    title: `Explore our studio`,
    subtitle:
      `We love meeting creative minds and people who enjoy making things. If you have ideas, skills, or a passion for creating, we'd love to connect.`,
    items: [
      {
        label: 'Web Designers & Developers',
        detail: 'Building beautiful websites and digital experiences together.',
      },
      {
        label: 'Graphic & Visual Designers',
        detail: 'Creating visual identities, illustrations, and unique design concepts.',
      },
      {
        label: 'Creative Collaborators',
        detail: 'Bringing fresh ideas and creative projects to life.',
      },
    ],
    hasForm: true,
    formPlaceholder: 'Share your portfolio and tell us a little about yourself...',
  },
  'Say hello': {
    title: 'Say hello',
    subtitle:
      `Got a question, an idea, or just want to say hi? We're always happy to hear from you. Drop us a message!`,
    hasForm: true,
    formPlaceholder: `What's on your mind?`,
  },
  'How we work': {
    title: 'How we work',
    subtitle:
      'Every great website starts with an idea. We work closely with you to turn that idea into a beautiful website your business can be proud of.',
    items: [
      {
        label: `01. Let's Get to Know You`,
        detail: 'We learn about your business, your goals, and the kind of website you have in mind.',
      },
      {
        label: '02. Design & Create',
        detail: 'We bring your ideas to life with thoughtful design and a website that feels just right for your brand.',
      },
      {
        label: '03. Launch & Grow',
        detail: 'We make sure everything works smoothly, then help you get your website ready to meet the world.',
      },
    ],
  },
};

export function ActionSheet({ activePanel, onClose }: ActionSheetProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setError('');
    setSubmitted(false);
  }, [activePanel]);

  useEffect(() => {
    if (!activePanel) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePanel, onClose]);

  if (!activePanel) return null;

  const content = CONTENT_MAP[activePanel];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!trimmedMessage) {
      setError('Please include a short note before sending.');
      return;
    }

    setError('');
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-sheet-title"
      className="fixed inset-0 z-20 flex items-center justify-center p-5 sm:p-8 bg-[#0F172A]/25 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white/95 border border-[#0F172A]/15 rounded-2xl p-6 sm:p-8 text-[#0F172A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2
            id="action-sheet-title"
            className="text-2xl sm:text-[26px] font-medium tracking-tight text-[#0F172A]"
          >
            {content.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0F172A] text-white border border-[#0F172A] hover:bg-white hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 2L12 12M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="text-[15px] leading-relaxed text-[#0F172A]/75 mb-6 whitespace-pre-line">
          {content.subtitle}
        </p>

        {content.items && (
          <ul className="divide-y divide-[#0F172A]/10 mb-6">
            {content.items.map((item) => (
              <li key={item.label} className="py-3 first:pt-0 last:pb-0">
                <div className="text-[15px] text-[#0F172A]">{item.label}</div>
                <div className="text-[13px] text-[#0F172A]/60 mt-0.5">
                  {item.detail}
                </div>
              </li>
            ))}
          </ul>
        )}

        {content.hasForm && (
          submitted ? (
            <div className="border border-[#0F172A]/15 rounded-xl p-5 bg-[#0F172A]/[0.04]">
              <p className="text-[16px] text-[#0F172A] mb-1">Note received.</p>
              <p className="text-[14px] text-[#0F172A]/70 mb-4">
                Thanks for reaching out—our studio team reviews every note directly and responds within one business day.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center bg-[#0F172A] text-white border border-[#0F172A] rounded-full text-[14px] px-5 py-2 hover:bg-white hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  aria-label="Your name"
                  className="w-full bg-[#0F172A]/[0.04] border border-[#0F172A]/15 rounded-xl px-4 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#0F172A]/45 focus:outline-none focus:border-[#0F172A]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-label="Email address"
                  required
                  className="w-full bg-[#0F172A]/[0.04] border border-[#0F172A]/15 rounded-xl px-4 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#0F172A]/45 focus:outline-none focus:border-[#0F172A]"
                />
              </div>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={content.formPlaceholder}
                aria-label="Message"
                required
                className="w-full bg-[#0F172A]/[0.04] border border-[#0F172A]/15 rounded-xl px-4 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#0F172A]/45 focus:outline-none focus:border-[#0F172A] resize-none"
              />
              {error && (
                <p role="alert" className="text-[13px] text-red-600">
                  {error}
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[13px] text-[#0F172A]/60">
                  Direct: hello@afabloom.com
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-[#0F172A] text-white rounded-full text-[14px] px-5 py-2 hover:bg-white hover:text-[#0F172A] border border-[#0F172A] transition-colors duration-200 cursor-pointer"
                >
                  Send note
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
