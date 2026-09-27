import React, { useState } from 'react';
import { Clock, Filter, Tag } from 'lucide-react';
import { PromptItem, Language } from '../types';
import { PromptCard } from './PromptCard';

interface LatestStreamProps {
  prompts: PromptItem[];
  lang: Language;
  onOpenDetail: (prompt: PromptItem) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
}

export const LatestStream: React.FC<LatestStreamProps> = ({
  prompts,
  lang,
  onOpenDetail,
  onToggleLike,
  onToggleSave,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const isAr = lang === 'ar';

  const allTags = ['all', 'Realistic', 'Cinematic', '3D', 'Fashion', 'Architecture', 'TypeScript', 'VFX'];

  const filtered = selectedTag === 'all'
    ? prompts
    : prompts.filter((p) => p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

  return (
    <section id="explore" className="py-8 sm:py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold mb-2">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>{isAr ? 'تغذية حية ومستمرة' : 'Live Community Stream'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? 'أحدث البرومبتات المضافة' : 'Latest Prompts Stream'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg">
              {isAr
                ? 'تصفح الإضافات اليومية من مجتمع المبدعين مع إمكانية التصفية السريعة بالوسوم.'
                : 'Real-time feed of prompt releases submitted by verified creators worldwide.'}
            </p>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-xs flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-purple-400" />
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                {tag === 'all' ? (isAr ? 'كل الوسوم' : 'All Tags') : `#${tag}`}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.slice(0, 8).map((prompt) => (
            <PromptCard
              key={`latest-${prompt.id}`}
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
