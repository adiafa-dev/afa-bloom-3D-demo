import { Fragment, useEffect } from 'react';

export type NavSection =
  | 'Labs'
  | 'Studio'
  | 'Openings'
  | 'Shop'
  | 'Get in touch';

const NAV_LINKS: NavSection[] = ['Labs', 'Studio', 'Openings', 'Shop'];

interface NavbarProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  onSelectItem: (item: NavSection) => void;
}

export function Navbar({
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  onSelectItem,
}: NavbarProps) {
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, onCloseMobileMenu]);

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: NavSection
  ) => {
    event.preventDefault();
    onCloseMobileMenu();
    onSelectItem(item);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10 w-full px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center">
        {/* Logo (left) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onCloseMobileMenu();
          }}
          className="flex flex-row items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0F172A] focus-visible:outline-offset-4"
        >
          <span
            className="text-[21px] sm:text-[48px] tracking-tight text-[#0F172A]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Afa Bloom®
          </span>
          <span
            aria-hidden="true"
            className="text-[25px] sm:text-[30px] text-[#0F172A] select-none leading-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </a>

        {/* Desktop nav links (center, hidden below md) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex flex-row items-center text-[23px] text-[#0F172A]"
        >
          {NAV_LINKS.map((label, index) => (
            <Fragment key={label}>
              <a
                href={`#${label.toLowerCase()}`}
                onClick={(e) => handleLinkClick(e, label)}
                className="hover:opacity-60 transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0F172A] focus-visible:outline-offset-4"
              >
                {label}
              </a>
              {index < NAV_LINKS.length - 1 && (
                <span aria-hidden="true" className="select-none">
                  ,&nbsp;
                </span>
              )}
            </Fragment>
          ))}
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <a
          href="#contact"
          onClick={(e) => handleLinkClick(e, 'Get in touch')}
          className="hidden inline-flex items-center justify-center bg-[#0F172A] text-white border border-[#0F172A] rounded-full text-[18px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] whitespace-nowrap hover:bg-white hover:text-[#0F172A] transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F172A] focus-visible:outline-offset-2"
        >
          Get in touch
        </a>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] min-w-[44px] min-h-[44px] -mr-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F172A]"
        >
          <span
            className={`block w-6 h-[2px] bg-[#0F172A] transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-[#0F172A] transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-[#0F172A] transition-all duration-300 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile overlay (z-index: 9, hidden on md+) */}
      <div
        aria-hidden={!mobileMenuOpen}
        className="md:hidden fixed inset-0 z-[9] bg-white/95 backdrop-blur-md flex flex-col justify-center items-start px-8 gap-8 transition-opacity duration-300"
        style={{
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
      >
        {NAV_LINKS.map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            tabIndex={mobileMenuOpen ? 0 : -1}
            onClick={(e) => handleLinkClick(e, label)}
            className="text-[32px] font-medium text-[#0F172A] hover:opacity-60 transition-opacity"
          >
            {label}
          </a>
        ))}
        <a
          href="#contact"
          tabIndex={mobileMenuOpen ? 0 : -1}
          onClick={(e) => handleLinkClick(e, 'Get in touch')}
          className="text-[32px] font-medium text-[#0F172A] underline underline-offset-4 hover:opacity-60 transition-opacity"
        >
          Get in touch
        </a>
      </div>
    </>
  );
}
