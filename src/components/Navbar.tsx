import React, { useState } from 'react';
import { Search, Sparkles, Globe, Menu, X } from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenSearch: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onOpenSearch,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAr = lang === 'ar';

  const navLinks = [
    { href: '#explore', labelAr: 'استكشف', labelEn: 'Explore' },
    { href: '#categories', labelAr: 'التصنيفات', labelEn: 'Categories' },
    { href: '#trending', labelAr: 'الترند 🔥', labelEn: 'Trending 🔥' },
    { href: '#featured', labelAr: 'المميّزة ⭐', labelEn: 'Featured' },
    { href: '#creators', labelAr: 'المبدعون', labelEn: 'Creators' },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
      <nav className="relative flex items-center justify-between px-4 sm:px-6 py-3 rounded-full backdrop-blur-2xl bg-[#090A14]/80 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        
        {/* Left Zone: Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            {/* Logo Spark Indicator matching reference */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-cairo">
                  {isAr ? 'سَوّيها' : 'Sawihaa'}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline -mt-0.5">
                {isAr ? 'منصة البرومبتات الأولى' : 'Next-Gen Prompt Hub'}
              </span>
            </div>
          </a>
        </div>

        {/* Center Zone: Nav Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative py-1 hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            >
              {isAr ? link.labelAr : link.labelEn}
            </a>
          ))}
        </div>

        {/* Right Zone: Search + Language Switcher + Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all text-xs"
            title={isAr ? 'بحث سريع (Ctrl+K)' : 'Quick Search (Ctrl+K)'}
          >
            <Search className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline text-xs text-slate-400">
              {isAr ? 'ابحث عن برومبت...' : 'Search prompts...'}
            </span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] rounded bg-white/[0.08] text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Language Switcher Pill */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? 'EN' : 'العربية'}</span>
          </button>

          {/* Login Ghost Button */}
          <button
            onClick={() => onOpenAuth('login')}
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>

          {/* Primary Sign Up Violet Glowing Pill Button */}
          <button
            onClick={() => onOpenAuth('signup')}
            className="violet-glow-btn px-4 py-1.5 sm:px-5 sm:py-2 text-xs font-semibold text-white rounded-full tracking-wide shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all"
          >
            {isAr ? 'إنشاء حساب' : 'Get Started'}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-2xl backdrop-blur-2xl bg-[#090A14]/95 border border-white/[0.1] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                {isAr ? link.labelAr : link.labelEn}
              </a>
            ))}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="text-xs text-slate-300 py-1.5 px-3 hover:text-white"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signup');
                }}
                className="violet-glow-btn text-xs font-semibold text-white py-1.5 px-4 rounded-full"
              >
                {isAr ? 'انضم الآن مجاناً' : 'Join for Free'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
