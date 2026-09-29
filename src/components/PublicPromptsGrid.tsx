import React, { useState } from 'react';
import { Copy, Check, Sparkles, Heart } from 'lucide-react';
import { PromptItem, Language } from '../types';

interface PublicPromptsGridProps {
  prompts: PromptItem[];
  lang: Language;
  activeCategory?: string;
  activeModel?: string;
  onSelectPrompt: (prompt: PromptItem) => void;
  onCopyPrompt: (promptOrText: PromptItem | string) => void;
  onResetFilters?: () => void;
}

export const PublicPromptsGrid: React.FC<PublicPromptsGridProps> = ({
  prompts,
  lang,
  activeCategory,
  activeModel,
  onSelectPrompt,
  onCopyPrompt,
  onResetFilters,
}) => {
  const isAr = lang === 'ar';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedCategory = (activeCategory || 'الكل').trim();
  const selectedModel = (activeModel || 'الكل').trim();

  const displayedPrompts = prompts.filter((p) => {
    // 1. Allow items where status === 'approved' (or legacy items where status is undefined)
    const isApproved = p.status === 'approved' || p.status === undefined;
    if (!isApproved) return false;

    // 2. Match active category
    const promptCat = (p.category || '').trim();
    const catMatch =
      selectedCategory === 'الكل' ||
      selectedCategory === 'all' ||
      promptCat === selectedCategory;
    if (!catMatch) {
      // Backward compatibility matching with hubId or legacy category string
      const hubId = (p.hubId || '').toLowerCase();
      const pCat = promptCat.toLowerCase();
      const legacyMatch =
        (selectedCategory === 'بورتريه ووجوه' && (hubId === 'portrait' || pCat.includes('بورتريه') || pCat.includes('portrait'))) ||
        (selectedCategory === 'سينمائي ودرامي' && (hubId === 'cinematic' || pCat.includes('سينما') || pCat.includes('cinematic'))) ||
        (selectedCategory === 'أنمي وفانتازيا' && (hubId === 'anime' || pCat.includes('أنمي') || pCat.includes('anime'))) ||
        (selectedCategory === 'تصميم تجاري' && (pCat.includes('تجاري') || pCat.includes('commercial'))) ||
        (selectedCategory === 'شخصيات 3D' && (hubId === '3d' || hubId === '3d-design' || pCat.includes('3d') || pCat.includes('ثلاثي'))) ||
        (selectedCategory === 'سايبربانك وخيال علمي' && (hubId === 'cyberpunk' || pCat.includes('سايبر') || pCat.includes('cyber'))) ||
        (selectedCategory === 'برمجة وكود' && (hubId === 'code-dev' || hubId === 'code' || pCat.includes('برمج') || pCat.includes('كود') || pCat.includes('code')));
      if (!legacyMatch) return false;
    }

    // 3. Match active model
    const promptModel = (p.model || '').trim();
    const modelMatch =
      selectedModel === 'الكل' ||
      selectedModel === 'all' ||
      promptModel === selectedModel ||
      promptModel.toLowerCase().includes(selectedModel.toLowerCase());
    if (!modelMatch) return false;

    return true;
  });

  const handleCopy = (e: React.MouseEvent, prompt: PromptItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.promptText);
    setCopiedId(prompt.id);
    onCopyPrompt(prompt);
    setTimeout(() => {
      setCopiedId((current) => (current === prompt.id ? null : current));
    }, 2000);
  };

  if (displayedPrompts.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-12 text-center">
        <div className="p-10 sm:p-14 rounded-2xl bg-[#0e1017] border border-white/10 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">
              {isAr
                ? 'لا توجد برومبتات مضافة حالياً. ابدأ بإضافة أول برومبت الآن!'
                : 'No prompts added yet. Start by adding your first prompt now!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {isAr
                ? 'كن أول من ينشر برومبت ذكاء اصطناعي سينمائي ومميز على المنصة.'
                : 'Be the first to publish a prompt to the community feed.'}
            </p>
          </div>
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all cursor-pointer shadow-md"
            >
              {isAr ? 'عرض كافة البرومبتات' : 'Show All Prompts'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayedPrompts.map((prompt) => {
          const isCopied = copiedId === prompt.id;
          const authorName = prompt.creator?.name || (isAr ? 'صانع محتوى' : 'Creator');
          const authorAvatar = prompt.creator?.avatar;

          return (
            <article
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt)}
              className="group flex flex-col justify-between rounded-2xl bg-[#0e1017] hover:bg-[#13151f] border border-white/5 hover:border-violet-500/40 transition-all duration-200 cursor-pointer p-3 sm:p-3.5 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            >
              {/* Top: High-Res Image Display */}
              <div className="space-y-3">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/50 border border-white/5">
                  {prompt.imageUrl ? (
                    <img
                      src={prompt.imageUrl}
                      alt={prompt.titleAr || prompt.titleEn}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-violet-950/20 text-3xl">
                      🎨
                    </div>
                  )}

                  {/* AI Model Badge Floating on Top */}
                  <div className="absolute top-2.5 right-2.5 rtl:right-2.5 rtl:left-auto left-2.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/80 text-violet-300 border border-violet-500/30 shadow-md">
                      {prompt.model}
                    </span>
                  </div>

                  {/* Likes Count Floating Badge */}
                  {typeof prompt.likes === 'number' && prompt.likes > 0 && (
                    <div className="absolute bottom-2.5 left-2.5 rtl:left-2.5 rtl:right-auto right-2.5">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/70 text-slate-300 border border-white/10">
                        <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                        <span>{prompt.likes}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Title and Short Prompt Preview */}
                <div className="space-y-1.5 px-0.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {isAr ? prompt.titleAr || prompt.titleEn : prompt.titleEn || prompt.titleAr}
                  </h3>

                  <p className="text-xs font-mono text-slate-400 line-clamp-2 bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed break-words">
                    {prompt.promptText}
                  </p>
                </div>
              </div>

              {/* Bottom Row: Author Badge + Quick 1-Click "نسخ البرومبت" Button */}
              <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                {/* Author Info */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {(authorName[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-slate-400 truncate font-medium">
                    {authorName}
                  </span>
                </div>

                {/* 1-Click Copy Button */}
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, prompt)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    isCopied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-violet-600/20 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/30'
                  }`}
                  title={isAr ? 'نسخ البرومبت' : 'Copy prompt text'}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'تم النسخ ✓' : 'Copied ✓'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-violet-300" />
                      <span>{isAr ? 'نسخ البرومبت' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
