import React from 'react';
import { Image, Video, Code, Bot, PenTool, Music, ArrowUpRight } from 'lucide-react';
import { CATEGORIES_DATA } from '../data/promptsData';
import { Language, CategoryInfo } from '../types';

interface CategoriesSectionProps {
  lang: Language;
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  lang,
  selectedCategory,
  onSelectCategory,
}) => {
  const isAr = lang === 'ar';

  const getIcon = (name: string) => {
    switch (name) {
      case 'Image':
        return <Image className="w-6 h-6 text-purple-400" />;
      case 'Video':
        return <Video className="w-6 h-6 text-fuchsia-400" />;
      case 'Code':
        return <Code className="w-6 h-6 text-indigo-400" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-violet-400" />;
      case 'PenTool':
        return <PenTool className="w-6 h-6 text-pink-400" />;
      case 'Music':
        return <Music className="w-6 h-6 text-rose-400" />;
      default:
        return <Image className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <section id="categories" className="py-8 sm:py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold mb-2">
              <span>{isAr ? 'ركائز المنصة الست' : 'The 6 Core Pillars'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? 'استكشف حسب التصنيف' : 'Explore by Category'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg">
              {isAr
                ? 'مجموعة متكاملة تغطي كافة مجالات الإبداع بالذكاء الاصطناعي مع معايير دقيقة لكل تصنيف.'
                : 'Curated prompt collections across all creative AI disciplines with verified output benchmarks.'}
            </p>
          </div>

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory('all')}
              className="self-start md:self-auto text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4"
            >
              {isAr ? 'إعادة ضبط كل التصنيفات' : 'Reset Category Filter'}
            </button>
          )}
        </div>

        {/* 6 Category Glass Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_DATA.map((cat: CategoryInfo) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative group rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-2xl ${
                  isSelected
                    ? 'bg-purple-950/40 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.35)] scale-[1.02]'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:-translate-y-1'
                }`}
              >
                {/* Background Ambient Flare on Hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/25 transition-all pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 group-hover:border-purple-500/50 transition-all">
                    {getIcon(cat.iconName)}
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-purple-300 transition-colors">
                    <span className="text-xs font-mono font-medium">
                      {cat.count.toLocaleString()} {isAr ? 'برومبت' : 'prompts'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                    {isAr ? cat.titleAr : cat.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {isAr ? cat.subtitleAr : cat.subtitleEn}
                  </p>
                </div>

                {/* Popular Tags */}
                <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-white/[0.06]">
                  {cat.popularTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] font-mono text-slate-400 group-hover:text-purple-300/90 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
