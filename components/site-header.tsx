'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Brand from '@/components/brand';
import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import NavLinks from '@/components/nav-links';
import EmailDataButton from '@/components/email-data-button';
import { useLanguage } from '@/components/language-provider';

export default function SiteHeader({ authenticated }: { authenticated: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="topbar">
      <div className="container nav-wrap">
        <Brand />
        
        <div className="header-actions">
          {/* Always visible toggles */}
          <LanguageToggle />
          <ThemeToggle />
          
          {/* Desktop Links */}
          <div className="desktop-only">
            <NavLinks authenticated={authenticated} />
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="mobile-only mobile-menu-wrapper">
            <button 
              className="hamburger-btn" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <>
                <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
                <div className="mobile-menu-dropdown">
                  <NavLinks authenticated={authenticated} />
                  
                  {authenticated && (
                    <div className="mobile-menu-extra-actions">
                      <a href="/Japanese/api/export" className="button secondary wide" onClick={() => setIsMenuOpen(false)}>{t.downloadCsv}</a>
                      <div className="wide">
                        <EmailDataButton email="" />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
