import React, { useState } from 'react';
import { Search, Sparkles, Globe, Menu, X, Plus, Settings, LogOut, UserCheck } from 'lucide-react';
import { Language, BrandingSettings } from '../types';
import type { FirebaseUser } from '../lib/firebase';

interface NavbarProps {
  lang: Language;
  branding?: BrandingSettings;
  currentUser?: FirebaseUser | null;
  onLogoutUser?: () => void;
  onGoogleLogin?: () => void;
  onToggleLang: () => void;
  onOpenSearch: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenSubmitModal?: () => void;
  onGoHome?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  branding,
  currentUser,
  onLogoutUser,
  onGoogleLogin,
  onToggleLang,
  onOpenSearch,
  onOpenAuth,
  onOpenSubmitModal,
  onGoHome,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAr = lang === 'ar';

  const siteName = branding?.siteName || (isAr ? 'سَوّيها' : 'Sawihaa');
  const logoText = branding?.logoText || siteName;
  const slogan = branding?.slogan || (isAr ? 'دليل البرومبتات المتخصص' : 'Curated Prompt Directory');
  const logoImage = branding?.logoImage;

  const navLinks = [
    { href: '#', labelAr: 'الرئيسية', labelEn: 'Home', isHome: true },
    { href: '#categories', labelAr: 'أقسام المنصة', labelEn: 'Hubs', isHome: true },
    { href: '#highlights', labelAr: 'أحدث الإضافات ⭐', labelEn: 'Highlights ⭐' },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
      <nav className="relative flex items-center justify-between px-4 sm:px-6 py-3 rounded-full backdrop-blur-2xl bg-[#090A14]/85 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        
        {/* Left Zone: Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onGoHome?.()}
            className="flex items-center gap-2.5 group cursor-pointer text-left rtl:text-right"
          >
            {/* Logo Spark Indicator / Custom Image */}
            {logoImage ? (
              <img
                src={logoImage}
                alt={logoText}
                className="w-9 h-9 rounded-xl object-contain border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              />
            ) : (
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-transform group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-cairo">
                  {logoText}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline -mt-0.5">
                {slogan}
              </span>
            </div>
          </button>
        </div>

        {/* Center Zone: Nav Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.labelEn}
              href={link.href}
              onClick={(e) => {
                if (link.isHome) {
                  onGoHome?.();
                }
              }}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative py-1 hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] cursor-pointer"
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all text-xs cursor-pointer"
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

          {/* Admin Dashboard Entry Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-200 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.25)]"
              title={isAr ? 'لوحة التحكم والإدارة' : 'Admin CMS Dashboard'}
            >
              <Settings className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">{isAr ? 'الإدارة' : 'Admin'}</span>
            </button>
          )}

          {/* Language Switcher Pill */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? 'EN' : 'العربية'}</span>
          </button>

          {/* Share Prompt Button */}
          {onOpenSubmitModal && (
            <button
              onClick={onOpenSubmitModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-purple-200" />
              <span>{isAr ? 'شارك برومبت' : 'Share Prompt'}</span>
            </button>
          )}

          {/* User Auth Zone: Logged In vs Logged Out */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs text-white"
                title={currentUser.email || ''}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-purple-400"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[100px] sm:max-w-[140px] truncate text-slate-200 font-medium">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogoutUser}
                className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-red-400 bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.08] hover:border-red-500/30 transition-all cursor-pointer"
                title={isAr ? 'تسجيل الخروج من الحساب' : 'Logout'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Direct Google Sign In Button */}
              <button
                onClick={onGoogleLogin}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-100 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-purple-400/50 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                title={isAr ? 'تسجيل الدخول المباشر بحساب Google' : 'Sign in with Google'}
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.28v3.13C3.26 21.31 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.4l4-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.69 1.28 6.6l4 3.13c.95-2.84 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="hidden sm:inline">{isAr ? 'دخول عبر Google' : 'Google Sign In'}</span>
                <span className="sm:hidden">{isAr ? 'Google' : 'Google'}</span>
              </button>

              {/* Email / Sign Up Options */}
              <button
                onClick={() => onOpenAuth('signup')}
                className="hidden sm:inline-flex violet-glow-btn px-4 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white rounded-full tracking-wide shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all cursor-pointer"
              >
                {isAr ? 'حساب جديد' : 'Join'}
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-2xl backdrop-blur-2xl bg-[#090A14]/95 border border-white/10 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
          {currentUser ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-500/20">
              <div className="flex items-center gap-2.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-purple-400"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogoutUser?.();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoogleLogin?.();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.08] text-xs font-semibold text-white border border-white/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.28v3.13C3.26 21.31 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.4l4-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.69 1.28 6.6l4 3.13c.95-2.84 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isAr ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 py-2 text-xs rounded-lg bg-white/[0.04] text-slate-300"
                >
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="flex-1 py-2 text-xs rounded-lg violet-glow-btn text-white font-medium"
                >
                  {isAr ? 'حساب جديد' : 'Sign Up'}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.labelEn}
                href={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (link.isHome) {
                    onGoHome?.();
                  }
                }}
                className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
              >
                {isAr ? link.labelAr : link.labelEn}
              </a>
            ))}

            {onOpenAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-purple-300 hover:text-white hover:bg-purple-950/40 rounded-lg transition-colors text-right rtl:text-right cursor-pointer"
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span>{isAr ? 'لوحة الإدارة والتحكم (Admin)' : 'Admin Dashboard'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
