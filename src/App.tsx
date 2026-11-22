/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ActionSheet, type ActivePanel } from './components/ActionSheet';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { ScrubVideo } from './components/ScrubVideo';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  return (
    <div id="top" className="relative min-h-screen w-full bg-white text-[#0F172A]">
      <ScrubVideo />

      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onSelectItem={(item) => setActivePanel(item)}
      />

      <Hero onSelectAction={(action) => setActivePanel(action)} />

      <ActionSheet
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
}
