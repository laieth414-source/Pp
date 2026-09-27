import React, { useState } from 'react';
import { Sparkles, Copy, Check, Sliders, ExternalLink, Cpu, ShieldCheck } from 'lucide-react';
import { PromptItem, Language } from '../types';
import { PromptArtwork } from './PromptArtwork';

interface FeaturedSpotlightProps {
  prompts: PromptItem[];
  lang: Language;
  onOpenDetail: (prompt: PromptItem) => void;
  onCopyPrompt?: (promptText: string) => void;
}

export const FeaturedSpotlight: React.FC<FeaturedSpotlightProps> = ({
  prompts,
  lang,
  onOpenDetail,
  onCopyPrompt,
}) => {
  const featuredPrompts = prompts.filter((p) => p.featured);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const isAr = lang === 'ar';

  const current = featuredPrompts[selectedIdx] || prompts[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopyPrompt) {
      onCopyPrompt(current.promptText);
    }
  };

  return (
    <section id="featured" className="py-8 sm:py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>{isAr ? 'مختارات النخبة' : 'Curated Elite Spotlight'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? 'البرومبتات المميزة فائقة التعقيد' : 'Featured Multi-Parameter Prompts'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg">
              {isAr
                ? 'أعمال منتقاة بعناية تم اختبارها بمئات التكرارات للوصول إلى أعلى درجات الإتقان البصري والهندسي.'
                : 'Hand-picked masterpieces engineered through hundreds of iterations for maximum output precision.'}
            </p>
          </div>

          {/* Quick Selector Pills */}
          <div className="flex items-center gap-2">
            {featuredPrompts.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedIdx === idx
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                0{idx + 1}. {isAr ? p.titleAr.split(' ')[0] : p.titleEn.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Showcase Box with Glowing Violet Glass Framing */}
        <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur-2xl bg-[#090A14]/90 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden">
          
          {/* Subtle Ambient Violet Backlight */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual Preview Left/Right depending on language */}
            <div className="lg:col-span-6 relative aspect-video rounded-2xl overflow-hidden border border-purple-500/25 shadow-2xl group cursor-pointer" onClick={() => onOpenDetail(current)}>
              <PromptArtwork prompt={current} className="w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg backdrop-blur-md bg-black/60 border border-white/[0.1] text-xs font-mono text-purple-300 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض التفاصيل الكاملة' : 'View Full Details'}</span>
              </div>
            </div>

            {/* Prompt Details & Parameters */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {current.model}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {current.createdAt}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isAr ? current.titleAr : current.titleEn}
                </h3>
              </div>

              {/* Verified Creator Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <img
                  src={current.creator.avatar}
                  alt={current.creator.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{current.creator.name}</span>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-xs text-purple-300/80">
                    {isAr ? current.creator.roleAr : current.creator.roleEn}
                  </span>
                </div>
              </div>

              {/* Exact Prompt Box with Copy Button */}
              <div className="relative rounded-xl p-4 bg-black/50 border border-white/[0.08] group">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2 pb-1 border-b border-white/[0.06]">
                  <span>{isAr ? 'نص البرومبت الدقيق' : 'PROMPT SCRIPT'}</span>
                  <span className="text-purple-400">STATUS: VERIFIED</span>
                </div>

                <p className="text-xs sm:text-sm font-mono text-slate-200 leading-relaxed max-h-32 overflow-y-auto pr-1">
                  {current.promptText}
                </p>

                <div className="mt-3 pt-2 flex items-center justify-between border-t border-white/[0.06]">
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                    <span>--ar {current.aspectRatio}</span>
                    {current.stylize && <span>--stylize {current.stylize}</span>}
                    {current.chaos && <span>--chaos {current.chaos}</span>}
                    <span>--seed {current.seed}</span>
                  </div>

                  <button
                    onClick={handleCopy}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'violet-glow-btn text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ البرومبت' : 'Copy Prompt')}</span>
                  </button>
                </div>
              </div>

              {/* Negative Prompt preview if exists */}
              {current.negativePrompt && (
                <div className="text-xs text-slate-400 p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 font-mono">
                  <span className="text-rose-400 font-semibold">{isAr ? 'برومبت سلبي (Negative): ' : 'Negative Prompt: '}</span>
                  <span className="opacity-80">{current.negativePrompt}</span>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
