import React, { useState } from 'react';
import { X, Copy, Check, Heart, Bookmark, Share2, Sliders, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { PromptItem, Language } from '../types';
import { PromptArtwork } from './PromptArtwork';

interface PromptDetailModalProps {
  prompt: PromptItem | null;
  lang: Language;
  onClose: () => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  prompt,
  lang,
  onClose,
  onToggleLike,
  onToggleSave,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const isAr = lang === 'ar';

  if (!prompt) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyAll = () => {
    const fullText = `${prompt.promptText} ${prompt.negativePrompt ? `\n--no ${prompt.negativePrompt}` : ''} --ar ${prompt.aspectRatio} --seed ${prompt.seed}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl rounded-3xl backdrop-blur-2xl bg-[#0B0C16]/95 border border-purple-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden z-10 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {prompt.model}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              ID: #{prompt.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleLike(prompt.id, e)}
              className={`p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-rose-400 transition-colors ${
                prompt.isLiked ? 'text-rose-500' : ''
              }`}
              title={isAr ? 'إعجاب' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${prompt.isLiked ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={(e) => onToggleSave(prompt.id, e)}
              className={`p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-purple-400 transition-colors ${
                prompt.isSaved ? 'text-purple-400' : ''
              }`}
              title={isAr ? 'حفظ في المفضلة' : 'Save'}
            >
              <Bookmark className={`w-4 h-4 ${prompt.isSaved ? 'fill-purple-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto">
          
          {/* Left Column: Visual Artwork */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl">
              <PromptArtwork prompt={prompt} className="w-full h-full" showOverlay={false} />
            </div>

            {/* Creator Micro Profile */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <img
                  src={prompt.creator.avatar}
                  alt={prompt.creator.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-white">{prompt.creator.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{prompt.creator.handle}</span>
                </div>
              </div>

              <span className="text-xs text-purple-300/80 font-mono">
                {prompt.creator.followers.toLocaleString()} {isAr ? 'متابع' : 'followers'}
              </span>
            </div>
          </div>

          {/* Right Column: Prompt Details & Parameters */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {isAr ? prompt.titleAr : prompt.titleEn}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-mono text-[11px] border border-purple-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Prompt Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="font-semibold text-purple-300">{isAr ? 'الأمر النصي الكامل (Prompt):' : 'Full Prompt:'}</span>
                <span className="text-[11px]">{prompt.promptText.length} characters</span>
              </div>
              <div className="relative p-4 rounded-xl bg-black/60 border border-white/[0.1] font-mono text-xs sm:text-sm text-slate-200 leading-relaxed max-h-40 overflow-y-auto">
                {prompt.promptText}
              </div>
            </div>

            {/* Negative Prompt */}
            {prompt.negativePrompt && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-rose-400 font-mono">
                  {isAr ? 'البرومبت السلبي (Negative Prompt):' : 'Negative Prompt:'}
                </span>
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 font-mono text-xs text-rose-200">
                  {prompt.negativePrompt}
                </div>
              </div>
            )}

            {/* Generation Parameters Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 font-mono">
                {isAr ? 'إعدادات النموذج (Parameters):' : 'Generation Parameters:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-slate-400 text-[10px]">Aspect Ratio</div>
                  <div className="text-white font-bold">{prompt.aspectRatio}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-slate-400 text-[10px]">Seed</div>
                  <div className="text-white font-bold">{prompt.seed}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-slate-400 text-[10px]">Stylize</div>
                  <div className="text-white font-bold">{prompt.stylize || 'Default'}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-slate-400 text-[10px]">Steps</div>
                  <div className="text-white font-bold">{prompt.steps || '50'}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyPrompt}
                className={`flex-1 py-3 px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  copiedPrompt
                    ? 'bg-emerald-600 text-white'
                    : 'violet-glow-btn text-white'
                }`}
              >
                {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPrompt ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ البرومبت فقط' : 'Copy Prompt Only')}</span>
              </button>

              <button
                onClick={handleCopyAll}
                className={`py-3 px-5 rounded-xl text-xs font-semibold backdrop-blur-md bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white flex items-center justify-center gap-2 transition-all ${
                  copiedAll ? 'text-emerald-400 border-emerald-500/50' : ''
                }`}
              >
                {copiedAll ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
                <span>{copiedAll ? (isAr ? 'تم نسخ الكل!' : 'All Copied!') : (isAr ? 'نسخ كل الإعدادات' : 'Copy All Parameters')}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
