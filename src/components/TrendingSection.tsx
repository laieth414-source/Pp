import React, { useState } from 'react';
import { Flame, SlidersHorizontal, Sparkles } from 'lucide-react';
import { PromptItem, Language } from '../types';
import { PromptCard } from './PromptCard';

interface TrendingSectionProps {
  prompts: PromptItem[];
  lang: Language;
  onOpenDetail: (prompt: PromptItem) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  prompts,
  lang,
  onOpenDetail,
  onToggleLike,
  onToggleSave,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Midjourney' | 'Flux.1' | 'Kling' | 'video' | 'code'>('all');
  const isAr = lang === 'ar';

  const filterTabs = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All Trending' },
    { id: 'Midjourney', labelAr: 'Midjourney v6.1', labelEn: 'Midjourney' },
    { id: 'Flux.1', labelAr: 'Flux.1 Pro', labelEn: 'Flux.1' },
    { id: 'Kling', labelAr: 'Kling AI (فيديو)', labelEn: 'Kling AI (Video)' },
    { id: 'code', labelAr: 'برمجة ووكلاء AI', labelEn: 'Dev & Agents' },
  ];

  const filteredPrompts = prompts.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'Midjourney') return p.model.includes('Midjourney');
    if (activeFilter === 'Flux.1') return p.model.includes('Flux');
    if (activeFilter === 'Kling') return p.model.includes('Kling');
    if (activeFilter === 'code') return p.category === 'code' || p.category === 'agents';
    return true;
  });

  return (
    <section id="trending" className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-3">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>{isAr ? 'الترند الأكثر طلباً اليوم' : 'Trending Hot Today'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{isAr ? 'برومبتات متصدرة التفاعل' : 'Trending Prompts Grid'}</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              {isAr
                ? 'استكشف أشهر الإبداعات التي حققت ملايين المشاهدات مع الأوامر النصية الأصلية والإعدادات الدقيقة.'
                : 'Browse community favorites with the highest verified replication rates and real prompt configurations.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md overflow-x-auto max-w-full">
            <div className="px-2 py-1 text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {isAr ? tab.labelAr : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              lang={lang}
              onOpenDetail={onOpenDetail}
              onToggleLike={onToggleLike}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
