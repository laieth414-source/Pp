import React, { useState } from 'react';
import { Search, ArrowRight, ArrowLeft, Sparkles, HelpCircle, X } from 'lucide-react';
import { Language, HeroSettings, BrandingSettings, HubCategory } from '../types';
import { CyberRobotHero } from './CyberRobotHero';

interface HeroSectionProps {
  lang: Language;
  heroSettings?: HeroSettings;
  branding?: BrandingSettings;
  categories?: HubCategory[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearch: (query: string) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onSelectTag: (tag: string) => void;
  onOpenHowItWorks: () => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  heroSettings,
  branding,
  categories = [],
  searchQuery = '',
  onSearchChange,
  onSearch,
  activeCategory = 'all',
  onCategoryChange,
  onSelectTag,
  onOpenHowItWorks,
  onExploreClick,
}) => {
  const [localInput, setLocalInput] = useState(searchQuery);
  const isAr = lang === 'ar';

  const currentQuery = onSearchChange ? searchQuery : localInput;

  const badgeText = heroSettings?.badge || (isAr ? 'الجيل القادم من الإبداع والذكاء الاصطناعي' : 'The Next-Gen AI Prompt Hub');
  const titleText = heroSettings?.title || (isAr ? 'اكتشف، انسخ، وأبدع بأقوى برومبتات' : 'Discover, Copy, and Master World-Class');
  const titleHighlight = heroSettings?.titleHighlight || (isAr ? 'الذكاء الاصطناعي' : 'AI Prompts');
  const subtitleText = heroSettings?.subtitle || (isAr
    ? 'مكتبتك الشاملة لبرومبتات الذكاء الاصطناعي بدقة سينمائية واحترافية لكافة النماذج العالمية.'
    : 'Thousands of verified, battle-tested prompts for photorealistic imagery, cinematic video, code, and autonomous agents.');
  const searchPlaceholder = heroSettings?.searchPlaceholder || (isAr
    ? 'ابحث عن أي برومبت، أسلوب، أو نموذج...'
    : 'Search prompts, models, styles...');
  const exploreBtnText = heroSettings?.exploreBtnText || (isAr ? 'استكشف الأقسام' : 'Explore Hubs');
  const howItWorksBtnText = heroSettings?.howItWorksBtnText || (isAr ? 'كيف تعمل؟' : 'How It Works?');

  const handleInputChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalInput(value);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      onSearch(currentQuery.trim());
    } else {
      onExploreClick();
    }
  };

  const handleCategoryClick = (catId: string) => {
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

  return (
    <section className="relative py-8 sm:py-12 overflow-hidden">
      {/* Background Ambient Radial Violet Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-purple-900/15 via-violet-600/10 to-transparent blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dual Column Layout with tight vertical gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Column 1: Typography & Unified Control Bar */}
          <div className={`lg:col-span-7 flex flex-col justify-center ${isAr ? 'lg:order-1 text-right' : 'lg:order-1 text-left'} space-y-4 sm:space-y-5 w-full`}>
            
            {/* Dynamic Compact Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full backdrop-blur-md bg-white/[0.04] border border-purple-500/25 text-purple-300 text-[11px] sm:text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              <span>{badgeText}</span>
            </div>

            {/* Main Headline */}
            <div className="w-full max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-black tracking-tight text-white leading-tight sm:leading-[1.2]">
                <span>{titleText}</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 drop-shadow-[0_0_30px_rgba(168,85,247,0.45)]">
                  {titleHighlight}
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-slate-300/90 max-w-xl leading-relaxed">
              {subtitleText}
            </p>

            {/* Unified Tight Responsive Control Bar: Search Bar + Category Pills */}
            <div className="w-full max-w-xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-2 sm:p-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] space-y-2">
              
              {/* Search Form */}
              <form onSubmit={handleFormSubmit} className="relative group">
                <div className="relative flex items-center p-1 sm:p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] group-focus-within:border-purple-500/60 transition-all">
                  <div className="px-2.5 text-slate-400 group-focus-within:text-purple-400 transition-colors">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  
                  <input
                    type="text"
                    value={currentQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-0"
                  />

                  {currentQuery && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('')}
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={isAr ? 'مسح البحث' : 'Clear search'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="submit"
                    className="violet-glow-btn px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold text-white tracking-wide shrink-0 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isAr ? 'بحث' : 'Search'}</span>
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </form>

              {/* Integrated Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none select-none">
                <button
                  onClick={() => handleCategoryClick('all')}
                  className={`px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-purple-600/35 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)] border'
                      : 'bg-white/[0.02] border border-white/[0.06] text-slate-300 hover:border-purple-500/40 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'}
                </button>

                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-purple-600/35 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)] border'
                          : 'bg-white/[0.02] border border-white/[0.06] text-slate-300 hover:border-purple-500/40 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {isAr ? cat.titleAr : cat.titleEn}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Quick Action CTAs & Compact Metrics */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 max-w-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={onExploreClick}
                  className="violet-glow-btn px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white tracking-wide flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{exploreBtnText}</span>
                </button>

                <button
                  onClick={onOpenHowItWorks}
                  className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-slate-300 hover:text-white backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>{howItWorksBtnText}</span>
                </button>
              </div>

              {/* Compact Metrics */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <strong className="text-white">100K+</strong>
                  <span className="text-[10px] text-slate-400">{isAr ? 'برومبت' : 'prompts'}</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-purple-500/50" />
                <span className="flex items-center gap-1">
                  <strong className="text-purple-300">4.9/5</strong>
                  <span className="text-[10px] text-slate-400">{isAr ? 'دقة' : 'fidelity'}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Column 2: 3D Cyber-Robot Hero Element */}
          <div className="lg:col-span-5 flex justify-center items-center lg:order-2">
            <CyberRobotHero lang={lang} />
          </div>

        </div>

      </div>
    </section>
  );
};
