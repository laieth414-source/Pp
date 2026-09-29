import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { CyberRobotHero } from './CyberRobotHero';

export type ModelFilter = 'all' | 'Midjourney' | 'FLUX' | 'DALL-E' | 'ChatGPT';

interface ShowcaseHeroProps {
  lang: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedModel: ModelFilter;
  onSelectModel: (model: ModelFilter) => void;
}

export const ShowcaseHero: React.FC<ShowcaseHeroProps> = ({
  lang,
  searchQuery,
  onSearchChange,
  selectedModel,
  onSelectModel,
}) => {
  const isAr = lang === 'ar';

  const models: Array<{ id: ModelFilter; labelAr: string; labelEn: string }> = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'Midjourney', labelAr: 'Midjourney', labelEn: 'Midjourney' },
    { id: 'FLUX', labelAr: 'FLUX', labelEn: 'FLUX' },
    { id: 'DALL-E', labelAr: 'DALL-E', labelEn: 'DALL-E' },
    { id: 'ChatGPT', labelAr: 'ChatGPT', labelEn: 'ChatGPT' },
  ];

  return (
    <section className="relative pt-6 sm:pt-10 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* Text & Search Column */}
        <div
          className={`lg:col-span-7 flex flex-col justify-center ${
            isAr ? 'text-right items-start' : 'text-left items-start'
          } space-y-4 sm:space-y-5 w-full order-2 lg:order-1`}
        >
          {/* Sleek Subtitle Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-500/25 text-violet-300 text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>{isAr ? 'الجيل القادم من هندسة الأوامر ⚡' : 'Next-Gen Prompt Engineering ⚡'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-cairo tracking-tight leading-tight sm:leading-snug max-w-2xl">
            {isAr ? 'مكتبة لأوامر الذكاء الاصطناعي 🚀' : 'AI Prompts Library 🚀'}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
            {isAr
              ? 'اكتشف وانسخ أفضل البرومبتات المعتمدة لتوليد الصور والأفكار بضغطة زر واحدة.'
              : 'Discover, copy, and master battle-tested prompts for world-class AI models in one click.'}
          </p>

          {/* Centered High-Performance Search Bar */}
          <div className="w-full max-w-xl pt-1">
            <div className="relative flex items-center rounded-2xl bg-[#0f111a] border border-white/10 hover:border-violet-500/40 focus-within:border-violet-500 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all">
              <div className="absolute right-4 rtl:right-4 rtl:left-auto left-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-violet-400" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث في آلاف البرومبتات، الأفكار، أو النماذج...'
                    : 'Search thousands of prompts, styles, or models...'
                }
                className="w-full py-3.5 px-12 rounded-2xl bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                dir={isAr ? 'rtl' : 'ltr'}
              />

              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-4 rtl:left-4 rtl:right-auto right-4 p-1 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  title={isAr ? 'مسح البحث' : 'Clear search'}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Model Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-3.5 flex-wrap">
              {models.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectModel(m.id)}
                    className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] border border-violet-400'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
                    }`}
                  >
                    {isAr ? m.labelAr : m.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3D Cyber Robot Column */}
        <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2">
          <CyberRobotHero lang={lang} />
        </div>

      </div>
    </section>
  );
};
