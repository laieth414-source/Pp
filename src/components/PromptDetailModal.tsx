import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Heart,
  Bookmark,
  Share2,
  Maximize2,
  Users,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PromptItem, Language } from '../types';

interface PromptDetailModalProps {
  prompt: PromptItem | null;
  allPrompts?: PromptItem[];
  lang: Language;
  onClose: () => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectPrompt?: (prompt: PromptItem) => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onCopyPrompt?: (promptOrText: PromptItem | string) => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  prompt,
  allPrompts = [],
  lang,
  onClose,
  onToggleLike,
  onToggleSave,
  onSelectPrompt,
  onOpenAuth,
  onCopyPrompt,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isAr = lang === 'ar';

  if (!prompt) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
    if (onCopyPrompt) {
      onCopyPrompt(prompt);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: isAr ? prompt.titleAr : prompt.titleEn,
        text: prompt.promptText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Filter or prepare related prompts for the bottom carousel
  const relatedPrompts = allPrompts.length > 0
    ? allPrompts.filter((p) => p.id !== prompt.id).slice(0, 6)
    : [];

  const mainImageUrl = prompt.imageUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Dark Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
      />

      {/* Main Solid Opaque Modal Box */}
      <div className="relative w-full max-w-6xl rounded-2xl bg-[#0e0f17] border border-white/10 shadow-xl overflow-hidden z-10 my-4 sm:my-8 text-[#f8fafc] transition-all">
        
        {/* Top Bar matching Mockup */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/10 bg-[#13141c]">
          {/* Right in RTL: Sawihaa Logo with sparkle */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#f8fafc] flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-violet-600 text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </span>
              <span>سَوّيها</span>
            </span>
          </div>

          {/* Left in RTL: CTA "إنشاء حساب" & Close Button */}
          <div className="flex items-center gap-3">
            {onOpenAuth && (
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-sm active:scale-95"
              >
                {isAr ? 'إنشاء حساب' : 'Sign Up'}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/10"
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Core Two-Column Body */}
        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column in RTL / Visual Showcase Card */}
            <div className="lg:col-span-6 w-full flex flex-col items-center">
              <div className="relative w-full aspect-[4/5] sm:aspect-square max-h-[520px] rounded-2xl p-2.5 bg-[#13141c] border border-white/10 group overflow-hidden transition-all duration-200">
                
                {/* Ambient Internal Glow */}
                <div className="absolute inset-0 bg-radial from-purple-600/10 to-transparent pointer-events-none" />

                {/* Main High-Definition AI Generation Image */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/60">
                  <img
                    src={mainImageUrl}
                    alt={isAr ? prompt.titleAr : prompt.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dark Vignette Bottom Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Bottom Corner Expand / Lightbox Button */}
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-all shadow-lg active:scale-95 group/btn"
                    title={isAr ? 'تكبير وعرض كامل' : 'Expand Image'}
                  >
                    <Maximize2 className="w-4 h-4 text-purple-200 group-hover/btn:text-white transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column in RTL / Prompt Data & Actions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              {/* Header Title & Top Cards */}
              <div className="space-y-4">
                {/* Arabic Main Headline */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                  {isAr ? 'اكتشف، انسخ، وأبدع' : 'Discover, Copy & Create'}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-400 via-violet-300 to-white">
                    {isAr ? 'بأقوى برومبتات' : 'With Top AI Prompts'}
                  </span>
                </h2>

                {/* Top Profile & Model Row */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  
                  {/* Creator Profile Card */}
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-purple-500/30 transition-all">
                    <img
                      src={prompt.creator.avatar}
                      alt={prompt.creator.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/60 p-0.5"
                    />
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {prompt.creator.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {prompt.creator.roleAr || 'خبير تصميم واجهات مستخدم'}
                      </div>
                    </div>
                  </div>

                  {/* Secondary User Badge Card */}
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-300 text-xs">
                    <Users className="w-4 h-4 text-purple-400" />
                    <div className="text-right leading-tight">
                      <div className="text-[11px] text-slate-400">{isAr ? 'المستخدم' : 'Role'}</div>
                      <div className="text-xs font-semibold text-slate-200">
                        {isAr ? 'خبير تصميم واجهات مستخدم' : 'UI/UX AI Expert'}
                      </div>
                    </div>
                  </div>

                  {/* Engine Model Tag Badge */}
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono font-medium text-slate-200">
                    {/* Midjourney Sailboat SVG Logo */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                      <path d="M12 2L1 21h22L12 2zm0 3.8l7.5 13.2H4.5L12 5.8z" />
                    </svg>
                    <span>{prompt.model || 'Midjourney v6'}</span>
                  </div>

                </div>
              </div>

              {/* Keywords / Tags Section */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-white tracking-wide">
                  {isAr ? 'الكلمات المفتاحية' : 'Keywords & Tags'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags && prompt.tags.length > 0 ? (
                    prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#24133C]/70 text-purple-200 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/50 transition-all cursor-pointer select-none"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#24133C]/70 text-purple-200 border border-purple-500/30">
                        #تصوير_سينمائي
                      </span>
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#24133C]/70 text-purple-200 border border-purple-500/30">
                        #بورتريه_واقعي
                      </span>
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#24133C]/70 text-purple-200 border border-purple-500/30">
                        #إضاءة_درامية
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* The Prompt Box with Glowing Purple Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                {/* Elevated Prompt Text Box */}
                <div className="flex-1 p-4 sm:p-5 rounded-2xl bg-[#131522] border border-white/[0.08] text-xs sm:text-[13px] font-mono text-slate-200 leading-relaxed max-h-36 overflow-y-auto select-all shadow-inner">
                  {prompt.promptText}
                </div>

                {/* Glowing Purple/Pink Action Button: "نسخ البرومبت" */}
                <button
                  onClick={handleCopyPrompt}
                  className={`w-full sm:w-44 min-h-[90px] flex flex-col items-center justify-center gap-2 rounded-2xl font-bold transition-all shadow-[0_0_35px_rgba(168,85,247,0.5)] active:scale-95 p-4 select-none ${
                    copiedPrompt
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/40'
                      : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 text-white'
                  }`}
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-6 h-6 animate-bounce" />
                      <span className="text-sm font-black">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-6 h-6" />
                      <span className="text-sm font-black tracking-wide">
                        {isAr ? 'نسخ البرومبت' : 'Copy Prompt'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Bar: Like, Save, Share */}
              <div className="flex items-center gap-3 pt-2">
                {/* Heart / Like Counter */}
                <button
                  onClick={(e) => onToggleLike(prompt.id, e)}
                  className={`flex-1 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    prompt.isLiked ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-slate-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${prompt.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>
                    {isAr ? 'إعجاب' : 'Like'} {prompt.likes >= 1000 ? `${(prompt.likes / 1000).toFixed(1)}k` : prompt.likes}
                  </span>
                </button>

                {/* Save Bookmark */}
                <button
                  onClick={(e) => onToggleSave(prompt.id, e)}
                  className={`flex-1 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    prompt.isSaved ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' : 'text-slate-300'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${prompt.isSaved ? 'fill-purple-400 text-purple-400' : ''}`} />
                  <span>{prompt.isSaved ? (isAr ? 'تم الحفظ' : 'Saved') : (isAr ? 'حفظ' : 'Save')}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-all"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>{isAr ? 'مشاركة' : 'Share'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* Bottom Section: "Related Prompts" Carousel matching Mockup */}
          {relatedPrompts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isAr ? 'برومبتات مشابهة' : 'Related Prompts'}</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {isAr ? 'اضغط لعرض التفاصيل' : 'Click to inspect'}
                </span>
              </div>

              {/* Horizontal Scrollable / Grid Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-2">
                {relatedPrompts.map((item, index) => {
                  const thumbImg = item.imageUrl || `https://images.unsplash.com/photo-${
                    ['1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e', '1492562080023-ab3db95bfbce', '1519085360753-af0119f7cbe7', '1534528741775-53994a69daeb', '1506794778202-cad84cf45f1d'][index % 6]
                  }?auto=format&fit=crop&w=300&q=80`;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectPrompt && onSelectPrompt(item)}
                      className="group cursor-pointer rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/40 p-2.5 transition-all flex flex-col items-center gap-2"
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/50">
                        <img
                          src={thumbImg}
                          alt={item.titleAr}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="w-full text-center">
                        <div className="text-[10px] font-mono text-slate-400 font-semibold truncate group-hover:text-purple-300 transition-colors">
                          STYLE & AESTHETIC:
                        </div>
                        <div className="text-[11px] font-medium text-slate-200 truncate">
                          {isAr ? item.titleAr : item.titleEn}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Floating Help Circle Button in Bottom Right Corner */}
        <div className="fixed bottom-6 right-6 z-20 pointer-events-auto">
          <button
            onClick={() => alert(isAr ? 'منصة سَوّيها: دليلك لأقوى أوامر وبرومبتات الذكاء الاصطناعي لتوليد الصور والفيديوهات الاحترافية.' : 'Sawihaa: Your premier AI prompt engine.')}
            className="w-10 h-10 rounded-full bg-[#121320] border border-white/[0.12] hover:border-purple-400 text-slate-400 hover:text-white flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-90"
            title={isAr ? 'مساعدة' : 'Help'}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Lightbox / Fullscreen Image Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={mainImageUrl}
            alt={isAr ? prompt.titleAr : prompt.titleEn}
            referrerPolicy="no-referrer"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
