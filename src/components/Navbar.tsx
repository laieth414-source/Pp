import React from 'react';
import { LogOut } from 'lucide-react';
import { Language, BrandingSettings } from '../types';
import type { FirebaseUser } from '../lib/firebase';

interface NavbarProps {
  lang: Language;
  branding?: BrandingSettings;
  currentUser?: FirebaseUser | null;
  currentView?: 'public' | 'user_dashboard';
  onLogoutUser?: () => void;
  onGoogleLogin?: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenSubmitModal?: () => void;
  onGoHome?: () => void;
  onToggleLang?: () => void;
  onOpenSearch?: () => void;
  onOpenAdmin?: () => void;
  onOpenUserWorkspace?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  branding,
  currentUser,
  currentView = 'public',
  onLogoutUser,
  onGoogleLogin,
  onOpenAuth,
  onGoHome,
  onOpenUserWorkspace,
}) => {
  const isAr = lang === 'ar';
  const siteName = branding?.siteName || (isAr ? 'سَوّيها' : 'Sawihaa');
  const logoText = branding?.logoText || siteName;
  const logoImage = branding?.logoImage;

  return (
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
      <nav
        className="flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl bg-[#0e1017]/95 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Right Zone: Minimalist "سَوّيها" Logo with Subtle Violet Glow */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onGoHome?.()}
            className="flex items-center gap-2.5 group cursor-pointer text-start transition-opacity hover:opacity-90"
          >
            {logoImage ? (
              <img
                src={logoImage}
                alt={logoText}
                className="w-8 h-8 rounded-xl object-contain border border-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 font-black text-base shadow-[0_0_14px_rgba(139,92,246,0.3)]">
                س
              </div>
            )}

            <span className="text-xl sm:text-2xl font-black text-white font-cairo tracking-tight drop-shadow-[0_0_14px_rgba(139,92,246,0.4)]">
              {logoText}
            </span>
          </button>
        </div>

        {/* Left Zone: Sleek Obsidian Auth Button OR Avatar + "💼 لوحة حسابي" */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenUserWorkspace}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/40 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer shadow-[0_0_14px_rgba(139,92,246,0.25)] active:scale-95 min-h-[38px]"
                title={isAr ? 'فتح مساحة العمل الشخصية' : 'Open User Workspace'}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-violet-400"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span>{isAr ? '💼 لوحة حسابي' : '💼 Workspace'}</span>
              </button>

              <button
                onClick={onLogoutUser}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title={isAr ? 'تسجيل الخروج' : 'Logout'}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-white/[0.05] hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 min-h-[38px]"
            >
              <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
