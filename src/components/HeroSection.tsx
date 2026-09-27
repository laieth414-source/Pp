import React, { useState } from 'react';
import { Search, ArrowRight, ArrowLeft, Sparkles, HelpCircle, Layers, Cpu, Zap } from 'lucide-react';
import { Language } from '../types';
import { CyberRobotHero } from './CyberRobotHero';

interface HeroSectionProps {
  lang: Language;
  onSearch: (query: string) => void;
  onSelectTag: (tag: string) => void;
  onOpenHowItWorks: () => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  onSearch,
  onSelectTag,
  onOpenHowItWorks,
  onExploreClick,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const isAr = lang === 'ar';

  const quickTags = [
    { label: 'Midjourney', query: 'Midjourney' },
    { label: 'Flux.1', query: 'Flux.1' },
    { label: 'Kling AI', query: 'Kling AI' },
    { label: isAr ? 'سينمائي' : 'Cinematic', query: 'Cinematic' },
    { label: isAr ? 'واقعي' : 'Realistic', query: 'Realistic' },
    { label: isAr ? 'ثلاثي الأبعاد' : '3D', query: '3D' },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const aiPartners = [
    { name: 'Midjourney', symbol: 'MJ' },
    { name: 'Flux.1', symbol: 'FLUX' },
    { name: 'OpenAI', symbol: 'GPT-4o' },
    { name: 'Runway', symbol: 'GEN-3' },
    { name: 'Kling AI', symbol: 'KLING' },
    { name: 'Anthropic', symbol: 'CLAUDE' },
    { name: 'ElevenLabs', symbol: '11LABS' },
    { name: 'Suno AI', symbol: 'SUNO' },
  ];

  return (
    <section className="relative pt-6 pb-16 lg:py-20 overflow-hidden">
      {/* Background Ambient Radial Violet Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-purple-900/15 via-violet-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dual Column Layout:
            - In RTL: Typography on right, Robot on left (desktop: flex-row-reverse or natural order)
            - In LTR: Typography on left, Robot on right
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Column 1: Typography & Search Controls (Expanded width for clean line wrapping) */}
          <div className={`lg:col-span-7 flex flex-col justify-center ${isAr ? 'lg:order-1 text-right' : 'lg:order-1 text-left'} space-y-6 sm:space-y-8 w-full`}>
            
            {/* Dynamic Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/[0.04] border border-purple-500/25 text-purple-300 text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              <span>
                {isAr
                  ? 'المنصة الأولى للبرومبتات والذكاء الاصطناعي في الشرق الأوسط'
                  : 'The Next-Gen AI Prompt Hub & Marketplace'}
              </span>
            </div>

            {/* Main Headline: Perfectly structured into two balanced, impactful lines with no jagged wrapping */}
            <div className="w-full max-w-3xl">
              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-snug sm:leading-[1.25]">
                {isAr ? (
                  <>
                    <span className="block text-white font-extrabold whitespace-normal sm:whitespace-nowrap">
                      اكتشف، انسخ، وأبدع
                    </span>
                    <span className="block mt-1 sm:mt-2 text-white font-extrabold">
                      بأقوى برومبتات{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]">
                        الذكاء الاصطناعي
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block text-white font-extrabold whitespace-normal sm:whitespace-nowrap">
                      Discover, Copy, and Master
                    </span>
                    <span className="block mt-1 sm:mt-2 text-white font-extrabold">
                      World-Class{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]">
                        AI Prompts
                      </span>
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl leading-relaxed">
              {isAr
                ? 'آلاف البرومبتات الحقيقية المجرّبة والموثوقة للصور، الفيديو، الصوت، والبرمجة مع النتائج الأصلية والإعدادات الدقيقة لكافة النماذج العالمية.'
                : 'Thousands of verified, battle-tested prompts for photorealistic imagery, cinematic video, code, and autonomous agents with exact model parameters.'}
            </p>

            {/* Central Command Search Bar */}
            <div className="w-full max-w-xl">
              <form onSubmit={handleFormSubmit} className="relative group">
                <div className="relative flex items-center p-1.5 sm:p-2 rounded-2xl backdrop-blur-2xl bg-white/[0.04] border border-white/[0.1] group-focus-within:border-purple-500/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all">
                  <div className="px-3 text-slate-400 group-focus-within:text-purple-400 transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={
                      isAr
                        ? 'ابحث عن برومبت (مثال: محارب سايبر، سيارة مستقبلية، كود ريأكت)...'
                        : 'Search prompts (e.g., cyber warrior, hypercar, React agent)...'
                    }
                    className="w-full bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-0"
                  />

                  <button
                    type="submit"
                    className="violet-glow-btn px-5 py-2.5 rounded-xl text-xs font-semibold text-white tracking-wide shrink-0 transition-all flex items-center gap-1.5"
                  >
                    <span>{isAr ? 'بحث' : 'Search'}</span>
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </form>

              {/* Quick Filter Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">
                  {isAr ? 'الأكثر بحثاً:' : 'Quick tags:'}
                </span>
                {quickTags.map((tag) => (
                  <button
                    key={tag.query}
                    onClick={() => onSelectTag(tag.query)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-purple-900/40 border border-white/[0.06] hover:border-purple-500/40 text-slate-300 hover:text-white transition-all cursor-pointer text-[11px]"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="violet-glow-btn px-6 py-3 rounded-full text-sm font-semibold text-white tracking-wide flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(147,51,234,0.5)]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'استكشف البرومبتات' : 'Explore Prompts'}</span>
              </button>

              <button
                onClick={onOpenHowItWorks}
                className="px-6 py-3 rounded-full text-sm font-semibold text-slate-200 hover:text-white backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-purple-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>{isAr ? 'كيف تعمل المنصة؟' : 'How It Works?'}</span>
              </button>
            </div>

            {/* Key Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06] max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">100K+</div>
                <div className="text-xs text-slate-400">{isAr ? 'برومبت تم التحقق منه' : 'Verified Prompts'}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-purple-300 font-mono">50K+</div>
                <div className="text-xs text-slate-400">{isAr ? 'صانع محتوى ذكاء اصطناعي' : 'AI Prompt Creators'}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">4.9/5</div>
                <div className="text-xs text-slate-400">{isAr ? 'تقييم دقة النتائج' : 'Output Fidelity'}</div>
              </div>
            </div>

          </div>

          {/* Column 2: 3D Cyber-Robot Hero Element with Orbiting Status Pills */}
          <div className="lg:col-span-5 flex justify-center items-center lg:order-2">
            <CyberRobotHero lang={lang} />
          </div>

        </div>

        {/* AI Partners & Supported Models Strip (Matching reference footer logo strip) */}
        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <p className="text-center text-xs uppercase tracking-widest text-slate-400 font-mono mb-6">
            {isAr
              ? 'متوافق بالكامل مع أقوى نماذج الذكاء الاصطناعي العالمية'
              : 'Seamlessly Optimized for Next-Gen AI Model Frameworks'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            {aiPartners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] font-mono text-purple-300 group-hover:border-purple-500/50 group-hover:bg-purple-900/20">
                  {partner.symbol}
                </div>
                <span className="text-sm font-semibold tracking-wide font-sans">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
