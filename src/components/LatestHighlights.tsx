import React from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language, PromptItem, HubCategory } from '../types';
import { PromptCard } from './PromptCard';
import { getPromptHubId } from '../data/hubsData';

interface LatestHighlightsProps {
  categories: HubCategory[];
  prompts: PromptItem[];
  lang: Language;
  onOpenDetail: (prompt: PromptItem) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onCopyPrompt?: (promptText: string) => void;
  onSelectHub: (hubId: string) => void;
}

export const LatestHighlights: React.FC<LatestHighlightsProps> = ({
  categories,
  prompts,
  lang,
  onOpenDetail,
  onToggleLike,
  onToggleSave,
  onCopyPrompt,
  onSelectHub,
}) => {
  const isAr = lang === 'ar';

  // Take top 4 latest highlights strictly (prefer featured first, then rest)
  const sorted = [...prompts].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const highlights = sorted.slice(0, 4);

  return (
    <section className="py-8 sm:py-10 relative" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{isAr ? 'أحدث الإضافات للمنصة' : 'Latest Highlights'}</span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
                  {isAr ? `أبرز ${highlights.length}` : `Top ${highlights.length}`}
                </span>
              </h2>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {isAr ? 'مختارة من كافة الأقسام' : 'Curated across directory hubs'}
          </div>
        </div>

        {/* 4 Clean Prompts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {highlights.map((prompt) => {
            const hubId = getPromptHubId(prompt, categories);
            const hub = categories.find((h) => h.id === hubId);

            return (
              <div key={prompt.id} className="relative group">
                <PromptCard
                  prompt={prompt}
                  lang={lang}
                  onOpenDetail={onOpenDetail}
                  onToggleLike={onToggleLike}
                  onToggleSave={onToggleSave}
                  onCopyPrompt={onCopyPrompt}
                />
                
                {/* Micro Hub Link Indicator */}
                {hub && (
                  <button
                    onClick={() => onSelectHub(hub.id)}
                    className="mt-2 w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] text-[11px] text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    <span className="truncate">
                      {isAr ? `قسم: ${hub.titleAr}` : `Hub: ${hub.titleEn || hub.titleAr}`}
                    </span>
                    <span className="text-purple-400 text-xs">
                      {isAr ? '←' : '→'}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
