import React from 'react';
import { Twitter, Github, Disc as Discord } from 'lucide-react';
import { Language, BrandingSettings, FooterSettings } from '../types';

interface FooterProps {
  lang: Language;
  branding?: BrandingSettings;
  footerSettings?: FooterSettings;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  branding,
  footerSettings,
  onOpenAdmin,
}) => {
  const isAr = lang === 'ar';

  const siteName = branding?.siteName || (isAr ? 'سَوّيها' : 'Sawihaa');
  const slogan = branding?.slogan || (isAr ? 'المنصة الأولى للبرومبتات' : 'Next-Gen Prompt Hub');
  const logoImage = branding?.logoImage;
  const copyright = footerSettings?.copyright || (isAr ? '© 2026 سَوّيها - جميع الحقوق محفوظة' : '© 2026 Sawihaa - All rights reserved');
  const aboutText = footerSettings?.aboutText;

  const engines = [
    { name: 'Midjourney', version: 'v6.1' },
    { name: 'ChatGPT', version: 'GPT-4o' },
    { name: 'FLUX.1', version: 'Pro' },
    { name: 'Claude', version: '3.7' },
    { name: 'Stable Diffusion', version: 'XL' },
  ];

  return (
    <footer
      className="relative py-6 border-t border-white/5 bg-[#090a0f] text-[#94a3b8] text-xs overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Right/Left: Brand logo with a tiny tagline */}
          <div className="flex items-center gap-2.5">
            {logoImage ? (
              <img
                src={logoImage}
                alt={siteName}
                className="w-7 h-7 rounded-lg object-contain border border-white/10"
              />
            ) : (
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-600 text-white font-bold text-xs">
                س
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[#f8fafc] font-cairo tracking-tight">
                {siteName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono border-l border-white/10 pl-2 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-2">
                {slogan}
              </span>
            </div>
          </div>

          {/* Center: Supported engine badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {engines.map((eng) => (
              <span
                key={eng.name}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-400 cursor-default"
              >
                <span className="w-1 h-1 rounded-full bg-violet-400" />
                <span>{eng.name}</span>
              </span>
            ))}
          </div>

          {/* End: Copyright & social links & subtle admin portal link */}
          <div className="flex items-center gap-3.5 text-[11px] text-[#94a3b8]">
            <span>{copyright}</span>

            {/* Subtle unobtrusive admin entry */}
            <a
              href="#admin"
              onClick={(e) => {
                e.preventDefault();
                onOpenAdmin?.();
              }}
              className="text-slate-600 hover:text-slate-400 text-[10px] transition-colors cursor-pointer"
              title={isAr ? 'بوابة المشرفين' : 'Admin Portal'}
            >
              {isAr ? 'الإدارة' : 'Portal'}
            </a>

            <div className="flex items-center gap-2 text-slate-500 border-l border-white/10 pl-3 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-3">
              <a href="#" className="hover:text-[#f8fafc] transition-colors" aria-label="Twitter">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="hover:text-[#f8fafc] transition-colors" aria-label="Discord">
                <Discord className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="hover:text-[#f8fafc] transition-colors" aria-label="Github">
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {aboutText && (
          <p className="text-center text-[11px] text-slate-500 max-w-2xl mx-auto pt-2 border-t border-white/[0.03]">
            {aboutText}
          </p>
        )}

      </div>
    </footer>
  );
};
