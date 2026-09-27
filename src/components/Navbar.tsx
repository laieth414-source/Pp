import React from 'react';
import { Plus, LogOut, User as UserIcon } from 'lucide-react';
import { Language, BrandingSettings } from '../types';
import type { FirebaseUser } from '../lib/firebase';

interface NavbarProps {
  lang: Language;
  branding?: BrandingSettings;
  currentUser?: FirebaseUser | null;
  onLogoutUser?: () => void;
  onGoogleLogin?: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenSubmitModal?: () => void;
  onGoHome?: () => void;
  onToggleLang?: () => void;
  onOpenSearch?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  branding,
  currentUser,
  onLogoutUser,
  onOpenAuth,
  onOpenSubmitModal,
  onGoHome,
}) => {
  const isAr = lang === 'ar';

  const siteName = branding?.siteName || (isAr ? 'سَوّيها' : 'Sawihaa');
  const logoText = branding?.logoText || siteName;
  const logoImage = branding?.logoImage;

  return (
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
      <nav
        className="flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl bg-[#13141c] border border-white/10 shadow-lg"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Right Zone (in RTL): Clean Minimal Logo "سَوّيها" */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onGoHome?.()}
            className="flex items-center gap-2 group cursor-pointer text-start transition-opacity hover:opacity-90"
          >
            {logoImage ? (
              <img
                src={logoImage}
                alt={logoText}
                className="w-8 h-8 rounded-lg object-contain border border-white/10"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 text-white font-bold text-base">
                س
              </div>
            )}

            <span className="text-lg sm:text-xl font-black text-[#f8fafc] font-cairo tracking-tight">
              {logoText}
            </span>
          </button>
        </div>

        {/* Left Zone (in RTL): Sleek "➕ أضف برومبت" + User Login/Avatar Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Sleek "➕ أضف برومبت" Button */}
          {onOpenSubmitModal && (
            <button
              onClick={onOpenSubmitModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:scale-95 rounded-xl border border-violet-500/40 shadow-sm transition-all cursor-pointer min-h-[38px]"
            >
              <Plus className="w-4 h-4 text-violet-200" />
              <span>{isAr ? 'أضف برومبت' : 'Add Prompt'}</span>
            </button>
          )}

          {/* User Login / Avatar Zone */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#f8fafc]"
                title={currentUser.email || ''}
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
                <span className="max-w-[85px] sm:max-w-[120px] truncate font-medium text-[#f8fafc]">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogoutUser}
                className="p-2 rounded-xl text-[#94a3b8] hover:text-rose-400 bg-white/[0.04] hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title={isAr ? 'تسجيل الخروج' : 'Logout'}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold text-[#f8fafc] bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-colors cursor-pointer min-h-[38px]"
            >
              <UserIcon className="w-4 h-4 text-violet-400" />
              <span>{isAr ? 'دخول' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
