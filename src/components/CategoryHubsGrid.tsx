import React from 'react';
import { User, Film, Zap, Sparkles, Box, Code, ArrowLeft, ArrowRight, Layers, Palette, Terminal, Camera, Bot, Cpu, Compass } from 'lucide-react';
import { Language, PromptItem, HubCategory } from '../types';
import { getPromptHubId } from '../data/hubsData';

interface CategoryHubsGridProps {
  categories: HubCategory[];
  prompts: PromptItem[];
  lang: Language;
  onSelectHub: (hubId: string) => void;
}

export const CategoryHubsGrid: React.FC<CategoryHubsGridProps> = ({
  categories,
  prompts,
  lang,
  onSelectHub,
}) => {
  const isAr = lang === 'ar';

  const renderIcon = (iconName: string) => {
    // If it's an emoji or multi-char symbol
    if (iconName && /\p{Extended_Pictographic}/u.test(iconName)) {
      return <span className="text-2xl select-none">{iconName}</span>;
    }

    switch (iconName?.toLowerCase()) {
      case 'user':
      case 'portrait':
        return <User className="w-6 h-6 text-purple-400" />;
      case 'film':
      case 'cinematic':
        return <Film className="w-6 h-6 text-indigo-400" />;
      case 'zap':
      case 'cyberpunk':
        return <Zap className="w-6 h-6 text-fuchsia-400" />;
      case 'sparkles':
      case 'anime':
        return <Sparkles className="w-6 h-6 text-pink-400" />;
      case 'box':
      case '3d':
      case '3d-design':
        return <Box className="w-6 h-6 text-violet-400" />;
      case 'code':
      case 'terminal':
      case 'code-dev':
        return <Code className="w-6 h-6 text-cyan-400" />;
      case 'camera':
        return <Camera className="w-6 h-6 text-emerald-400" />;
      case 'palette':
        return <Palette className="w-6 h-6 text-rose-400" />;
      case 'bot':
        return <Bot className="w-6 h-6 text-amber-400" />;
      case 'cpu':
        return <Cpu className="w-6 h-6 text-teal-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-purple-400" />;
    }
  };

  // Convert numbers to Arabic digits when Arabic is active
  const formatCount = (count: number) => {
    if (!isAr) return `${count} ${count === 1 ? 'Prompt' : 'Prompts'}`;
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const arabicNum = String(count)
      .split('')
      .map((d) => arabicDigits[Number(d)] || d)
      .join('');
    return `${arabicNum} برومبت`;
  };

  return (
    <section id="categories" className="py-8 sm:py-12 relative" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'دليل الأقسام المتخصصة' : 'Curated Directory Hubs'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {isAr ? 'أقسام المنصة الرئيسية' : 'Category Explorer Hubs'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              {isAr
                ? 'استكشف البرومبتات مصنفة ومحفوظة داخل أقسامها المتخصصة للوصول السريع والدقيق.'
                : 'Browse verified prompts organized strictly within dedicated, domain-specific directory hubs.'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-purple-400/80 bg-white/[0.02] border border-white/[0.06] px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isAr ? `${categories.length} أقسام رئيسية جاهزة` : `${categories.length} Hubs Ready`}
            </span>
          </div>
        </div>

        {/* Dynamic Category Explorer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((hub) => {
            const count = prompts.filter((p) => getPromptHubId(p, categories) === hub.id).length;
            const gradient = hub.gradient || 'from-purple-900/40 via-violet-950/20 to-transparent';
            const accentBorder = hub.accentBorder || 'group-hover:border-purple-500/50';

            return (
              <div
                key={hub.id}
                onClick={() => onSelectHub(hub.id)}
                className={`group relative rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#0B0C15]/85 border border-white/[0.08] ${accentBorder} transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-2xl overflow-hidden flex flex-col justify-between min-h-[220px]`}
                style={{
                  boxShadow: hub.accentGlow ? `0 0 0 0 ${hub.accentGlow}` : undefined,
                }}
              >
                {/* Radial Glow Overlay on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                {/* Card Top Row: Icon + Prompt Count Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-950/40 transition-all shadow-inner">
                    {renderIcon(hub.iconName)}
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.04] group-hover:bg-purple-900/30 text-purple-200 border border-white/[0.08] group-hover:border-purple-500/40 transition-all">
                    {formatCount(count)}
                  </span>
                </div>

                {/* Card Center: Title & Description */}
                <div className="relative z-10 mt-6 space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-200 transition-colors flex items-center gap-2">
                    <span>{isAr ? hub.titleAr : (hub.titleEn || hub.titleAr)}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed line-clamp-2">
                    {isAr ? hub.descriptionAr : (hub.descriptionEn || hub.descriptionAr)}
                  </p>
                </div>

                {/* Card Bottom: Entry Action Link */}
                <div className="relative z-10 mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-purple-300 transition-colors">
                  <span>{isAr ? 'دخول القسم واستعراض البرومبتات' : 'Explore Category Hub'}</span>
                  <div className="w-7 h-7 rounded-full bg-white/[0.04] group-hover:bg-purple-600/30 flex items-center justify-center transition-all group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
