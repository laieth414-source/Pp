import React from 'react';
import { Sparkles, Megaphone } from 'lucide-react';
import { Language } from '../types';

interface AnnouncementBarProps {
  text: string;
  isEnabled: boolean;
  lang: Language;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ text, isEnabled, lang }) => {
  if (!isEnabled || !text.trim()) return null;

  const isAr = lang === 'ar';

  return (
    <div
      className="relative z-40 bg-gradient-to-r from-purple-950/80 via-violet-900/60 to-purple-950/80 border-b border-purple-500/25 px-4 py-2 text-center text-xs sm:text-sm text-purple-100 flex items-center justify-center gap-2 backdrop-blur-md transition-all shadow-[0_2px_15px_rgba(168,85,247,0.15)]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2 font-medium">
        <span className="p-1 rounded-full bg-purple-500/20 text-purple-300">
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
        </span>
        <span className="tracking-wide">{text}</span>
      </div>
    </div>
  );
};
