import React, { useState } from 'react';
import { Copy, Check, Heart, Bookmark, ExternalLink } from 'lucide-react';
import { PromptItem, Language } from '../types';
import { PromptArtwork } from './PromptArtwork';

interface PromptCardProps {
  prompt: PromptItem;
  lang: Language;
  onOpenDetail: (prompt: PromptItem) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onCopyPrompt?: (promptOrText: PromptItem | string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  lang,
  onOpenDetail,
  onToggleLike,
  onToggleSave,
  onCopyPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const isAr = lang === 'ar';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopyPrompt) {
      onCopyPrompt(prompt);
    }
  };

  const getAspectRatioClass = () => {
    switch (prompt.aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '4:5':
        return 'aspect-[4/5]';
      case '1:1':
        return 'aspect-square';
      default:
        return 'aspect-[4/3]';
    }
  };

  return (
    <div
      onClick={() => onOpenDetail(prompt)}
      className="group relative rounded-2xl overflow-hidden bg-[#13141c] border border-white/10 hover:border-violet-500/40 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Visual Canvas Area */}
      <div className={`relative w-full ${getAspectRatioClass()} overflow-hidden bg-[#090a0f]`}>
        <PromptArtwork prompt={prompt} className="w-full h-full transform group-hover:scale-105 transition-transform duration-300 ease-out" />

        {/* Model Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/80 text-violet-300 border border-violet-500/30 shadow-sm">
            {prompt.model}
          </span>
        </div>

        {/* Aspect Ratio Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300 bg-black/70 border border-white/10">
            {prompt.aspectRatio}
          </span>
        </div>

        {/* Quick Action Floating Copy Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(prompt);
              }}
              className="p-1.5 rounded-lg bg-white/[0.1] hover:bg-white/[0.2] border border-white/20 text-white transition-colors cursor-pointer"
              title={isAr ? 'عرض التفاصيل' : 'View Details'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body & Footer */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-[#13141c]">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#f8fafc] group-hover:text-violet-300 transition-colors line-clamp-1 leading-snug">
            {isAr ? prompt.titleAr : prompt.titleEn}
          </h4>
          
          <p className="text-[11px] text-[#94a3b8] mt-1 font-mono line-clamp-2 leading-relaxed opacity-85">
            {prompt.promptText}
          </p>
        </div>

        {/* Micro Profile & Social Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          {/* Creator Micro Profile */}
          <div className="flex items-center gap-1.5">
            <img
              src={prompt.creator.avatar}
              alt={prompt.creator.name}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover border border-violet-500/30"
            />
            <span className="text-[11px] font-medium text-slate-300 group-hover:text-white transition-colors truncate max-w-[90px]">
              {prompt.creator.name}
            </span>
          </div>

          {/* Likes & Saves Counters */}
          <div className="flex items-center gap-2.5 text-[#94a3b8]">
            <button
              onClick={(e) => onToggleLike(prompt.id, e)}
              className={`flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${
                prompt.isLiked ? 'text-rose-500' : ''
              }`}
              title={isAr ? 'إعجاب' : 'Like'}
            >
              <Heart className={`w-3 h-3 ${prompt.isLiked ? 'fill-rose-500' : ''}`} />
              <span className="font-mono text-[10px]">{prompt.likes}</span>
            </button>

            <button
              onClick={(e) => onToggleSave(prompt.id, e)}
              className={`flex items-center gap-1 hover:text-violet-400 transition-colors cursor-pointer ${
                prompt.isSaved ? 'text-violet-400' : ''
              }`}
              title={isAr ? 'حفظ' : 'Save'}
            >
              <Bookmark className={`w-3 h-3 ${prompt.isSaved ? 'fill-violet-400' : ''}`} />
              <span className="font-mono text-[10px]">{prompt.saves}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
