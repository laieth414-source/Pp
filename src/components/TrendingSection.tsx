import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, X, RotateCcw, ChevronDown } from 'lucide-react';
import { PromptItem, Language } from '../types';
import { PromptCard } from './PromptCard';

interface TrendingSectionProps {
  prompts: PromptItem[];
  lang: Language;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onOpenDetail: (prompt: PromptItem) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onResetFilters?: () => void;
  onCopyPrompt?: (promptOrText: PromptItem | string) => void;
}

const CATEGORIES = [
  { id: 'الكل', labelAr: 'الكل', labelEn: 'All' },
  { id: 'بورتريه', labelAr: 'بورتريه', labelEn: 'Portrait' },
  { id: 'سينمائي', labelAr: 'سينمائي', labelEn: 'Cinematic' },
  { id: 'سايبربانك', labelAr: 'سايبربانك', labelEn: 'Cyberpunk' },
  { id: 'أنمي', labelAr: 'أنمي', labelEn: 'Anime' },
  { id: 'ثلاثي الأبعاد', labelAr: 'ثلاثي الأبعاد', labelEn: '3D' },
  { id: 'كود وبرمجة', labelAr: 'كود وبرمجة', labelEn: 'Code & Dev' },
];

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  prompts,
  lang,
  searchQuery = '',
  onSearchChange,
  activeCategory = 'الكل',
  onCategoryChange,
  onOpenDetail,
  onToggleLike,
  onToggleSave,
  onResetFilters,
  onCopyPrompt,
}) => {
  const [localCategory, setLocalCategory] = useState<string>('الكل');
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const isAr = lang === 'ar';

  const currentCategory = activeCategory !== undefined ? activeCategory : localCategory;

  // Reset pagination to 8 whenever category or search filter changes
  useEffect(() => {
    setVisibleCount(8);
  }, [currentCategory, searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    } else {
      setLocalCategory(categoryId);
    }
  };

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      handleCategorySelect('الكل');
      if (onSearchChange) {
        onSearchChange('');
      }
    }
  };

  // Real-time filtering by searchQuery AND activeCategory
  const filteredPrompts = prompts.filter((prompt) => {
    // 1. Search Query Filtering
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      const titleAr = (prompt.titleAr || '').toLowerCase();
      const titleEn = (prompt.titleEn || '').toLowerCase();
      const desc = (prompt.promptText || '').toLowerCase();
      const model = (prompt.model || '').toLowerCase();
      const tags = (prompt.tags || []).map((t) => t.toLowerCase());

      const matchesSearch =
        titleAr.includes(q) ||
        titleEn.includes(q) ||
        desc.includes(q) ||
        model.includes(q) ||
        tags.some((t) => t.includes(q));

      if (!matchesSearch) return false;
    }

    // 2. Active Category Filtering
    if (currentCategory === 'الكل' || currentCategory === 'All') {
      return true;
    }

    if (currentCategory === 'بورتريه') {
      return (
        prompt.tags.some((t) => /portrait|بورتريه|face|وجه/i.test(t)) ||
        /portrait|بورتريه|وجه|عجوز|شخص/i.test(prompt.titleAr + ' ' + prompt.titleEn + ' ' + prompt.promptText) ||
        prompt.visualType === 'cinematic_director' ||
        prompt.id === 'p-portrait'
      );
    }

    if (currentCategory === 'سينمائي') {
      return (
        prompt.tags.some((t) => /cinematic|سينمائي/i.test(t)) ||
        /cinematic|سينمائي|film|movie/i.test(prompt.titleAr + ' ' + prompt.titleEn + ' ' + prompt.promptText) ||
        prompt.visualType === 'cinematic_director' ||
        prompt.visualType === 'ancient_futuristic'
      );
    }

    if (currentCategory === 'سايبربانك') {
      return (
        prompt.tags.some((t) => /cyber|سايبر/i.test(t)) ||
        /cyber|سايبر|سايبربانك|mecha/i.test(prompt.titleAr + ' ' + prompt.titleEn + ' ' + prompt.promptText) ||
        prompt.visualType === 'cyber_oasis' ||
        prompt.visualType === 'mecha_warrior'
      );
    }

    if (currentCategory === 'أنمي') {
      return (
        prompt.tags.some((t) => /anime|أنمي|manga|مانجا|dragon|نينجا/i.test(t)) ||
        /anime|أنمي|manga|مانجا|dragon/i.test(prompt.titleAr + ' ' + prompt.titleEn + ' ' + prompt.promptText) ||
        prompt.visualType === 'neon_dragon'
      );
    }

    if (currentCategory === 'ثلاثي الأبعاد') {
      return (
        prompt.tags.some((t) => /3d|ثلاثي|render/i.test(t)) ||
        /3d|ثلاثي الأبعاد|render|octane|blender/i.test(prompt.titleAr + ' ' + prompt.titleEn + ' ' + prompt.promptText) ||
        prompt.visualType === 'luxury_hypercar' ||
        prompt.visualType === 'mecha_warrior'
      );
    }

    if (currentCategory === 'كود وبرمجة') {
      return (
        prompt.category === 'code' ||
        prompt.category === 'agents' ||
        prompt.tags.some((t) => /code|برمجة|agent|dev|react|typescript|python/i.test(t)) ||
        /code|برمجة|agent|react|typescript|python|developer/i.test(prompt.titleAr + ' ' + prompt.titleEn + ' ' + prompt.promptText) ||
        prompt.visualType === 'ai_code_agent'
      );
    }

    return true;
  });

  const displayedPrompts = filteredPrompts.slice(0, visibleCount);

  return (
    <section id="trending" className="py-10 sm:py-14 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-semibold mb-2">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>{isAr ? 'الترند الأكثر طلباً' : 'Trending Hot Today'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{isAr ? 'برومبتات متصدرة التفاعل' : 'Trending Prompts Grid'}</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                ({filteredPrompts.length})
              </span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg">
              {isAr
                ? 'استكشف أشهر الإبداعات التي حققت تفاعلاً عالياً مع الأوامر النصية الأصلية والإعدادات الدقيقة.'
                : 'Browse community favorites with verified replication rates and real prompt configurations.'}
            </p>
          </div>

          {/* Active Search & Filter Indicator */}
          {(searchQuery || currentCategory !== 'الكل') && (
            <div className="flex items-center gap-2 flex-wrap">
              {searchQuery && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs">
                  <span>
                    {isAr ? 'بحث عن:' : 'Search:'} <strong className="text-white font-mono">"{searchQuery}"</strong>
                  </span>
                  {onSearchChange && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="text-purple-400 hover:text-white"
                      title={isAr ? 'إلغاء البحث' : 'Clear search'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Filter Tabs: Horizontal bar directly above the prompts grid */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none select-none">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)] border'
                    : 'backdrop-blur-md bg-white/[0.03] border border-white/10 text-gray-300 hover:border-purple-500/50 hover:text-white'
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Grid Filtering Logic & Empty State */}
        {filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-14 rounded-3xl bg-[#0c0d16] border border-white/[0.08] shadow-2xl text-center space-y-4 my-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
              🔍
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {isAr ? 'عذراً، لم نعثر على برومبت يطابق بحثك' : 'Sorry, no prompts match your search'}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'جرب البحث بكلمات مفتاحية أخرى أو إعادة تعيين الفلاتر لعرض كافة البرومبتات.'
                  : 'Try adjusting your search terms or resetting filters to browse all prompts.'}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer active:scale-95"
            >
              {isAr ? 'إعادة ضبط البحث' : 'Reset filters'}
            </button>
          </div>
        ) : (
          <>
            {/* Displaying 8 well-spaced prompt cards by default */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {displayedPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  lang={lang}
                  onOpenDetail={onOpenDetail}
                  onToggleLike={onToggleLike}
                  onToggleSave={onToggleSave}
                  onCopyPrompt={onCopyPrompt}
                />
              ))}
            </div>

            {/* Load More Button if items exceed visibleCount */}
            {filteredPrompts.length > visibleCount && (
              <div className="flex justify-center mt-8 sm:mt-10">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-purple-200 bg-white/[0.04] hover:bg-purple-600/25 border border-purple-500/30 hover:border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all cursor-pointer active:scale-95 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
                  <span>{isAr ? 'استكشف المزيد من البرومبتات' : 'Load More Prompts'}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    +{filteredPrompts.length - visibleCount}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
};
