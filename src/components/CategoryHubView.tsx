import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Search, X, Sparkles, Filter, RotateCcw, User, Film, Zap, Box, Code, Camera, Palette, Bot, Cpu } from 'lucide-react';
import { Language, PromptItem, HubCategory } from '../types';
import { getPromptHubId } from '../data/hubsData';
import { PromptCard } from './PromptCard';

interface CategoryHubViewProps {
  hubId: string;
  categories: HubCategory[];
  prompts: PromptItem[];
  lang: Language;
  onBackToDirectory: () => void;
  onOpenDetail: (prompt: PromptItem) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onCopyPrompt?: (promptText: string) => void;
  onOpenSubmitModal?: () => void;
}

export const CategoryHubView: React.FC<CategoryHubViewProps> = ({
  hubId,
  categories,
  prompts,
  lang,
  onBackToDirectory,
  onOpenDetail,
  onToggleLike,
  onToggleSave,
  onCopyPrompt,
  onOpenSubmitModal,
}) => {
  const isAr = lang === 'ar';
  const [scopedSearch, setScopedSearch] = useState('');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');

  const currentHub = categories.find((h) => h.id === hubId) || categories[0] || {
    id: hubId,
    titleAr: 'القسم المختار',
    titleEn: 'Selected Hub',
    descriptionAr: '',
    descriptionEn: '',
    iconName: 'Sparkles',
  };

  // Filter prompts strictly belonging to this category hub
  const hubPrompts = prompts.filter((p) => getPromptHubId(p, categories) === currentHub.id);

  // Apply scoped search and model filter within this category
  const filteredPrompts = hubPrompts.filter((prompt) => {
    // 1. Scoped search filter
    const query = scopedSearch.trim().toLowerCase();
    if (query) {
      const titleAr = (prompt.titleAr || '').toLowerCase();
      const titleEn = (prompt.titleEn || '').toLowerCase();
      const text = (prompt.promptText || '').toLowerCase();
      const model = (prompt.model || '').toLowerCase();
      const tags = (prompt.tags || []).map((t) => t.toLowerCase());

      const matches =
        titleAr.includes(query) ||
        titleEn.includes(query) ||
        text.includes(query) ||
        model.includes(query) ||
        tags.some((t) => t.includes(query));

      if (!matches) return false;
    }

    // 2. Model filter
    if (selectedModelFilter !== 'all') {
      if (!prompt.model.toLowerCase().includes(selectedModelFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const renderIcon = (iconName: string) => {
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

  const availableModels = Array.from(
    new Set(hubPrompts.map((p) => p.model?.split(' ')[0] || p.model))
  ).filter(Boolean);

  return (
    <div className="py-6 sm:py-10 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Hub Header Box */}
        <div className="relative rounded-2xl p-6 sm:p-8 bg-[#13141c] border border-white/10 shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: Back button + Title + Tagline */}
            <div className="space-y-4 max-w-2xl">
              
              {/* Back to Categories Button */}
              <button
                onClick={onBackToDirectory}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer group"
              >
                {isAr ? <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />}
                <span>{isAr ? 'العودة للأقسام' : 'Back to Categories'}</span>
              </button>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center shadow-lg">
                  {renderIcon(currentHub.iconName)}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <span>{isAr ? currentHub.titleAr : (currentHub.titleEn || currentHub.titleAr)}</span>
                    <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {hubPrompts.length} {isAr ? 'برومبت' : 'Prompts'}
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {isAr ? currentHub.descriptionAr : (currentHub.descriptionEn || currentHub.descriptionAr)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick Add Button for this category */}
            {onOpenSubmitModal && (
              <div className="self-start md:self-center shrink-0">
                <button
                  onClick={onOpenSubmitModal}
                  className="bg-violet-600 hover:bg-violet-500 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white tracking-wide flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-colors min-h-[40px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'شارك برومبت في هذا القسم' : 'Add Prompt to this Hub'}</span>
                </button>
              </div>
            )}

          </div>

          {/* Scoped Controls Bar inside this Category */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Scoped Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="relative flex items-center rounded-xl bg-white/[0.03] border border-white/10 focus-within:border-violet-500/60 transition-all px-3 py-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={scopedSearch}
                  onChange={(e) => setScopedSearch(e.target.value)}
                  placeholder={
                    isAr
                      ? `ابحث فقط داخل قسم ${currentHub.titleAr}...`
                      : `Search inside ${currentHub.titleEn || currentHub.titleAr}...`
                  }
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-0 px-2"
                />
                {scopedSearch && (
                  <button
                    onClick={() => setScopedSearch('')}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Model Filter Pills */}
            {availableModels.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none select-none">
                <span className="text-[11px] text-[#94a3b8] hidden lg:inline flex items-center gap-1 font-mono">
                  <Filter className="w-3 h-3" />
                  <span>{isAr ? 'المحرك:' : 'Model:'}</span>
                </span>

                <button
                  onClick={() => setSelectedModelFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    selectedModelFilter === 'all'
                      ? 'bg-violet-600 text-white border border-violet-500'
                      : 'bg-white/[0.03] border border-white/10 text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'}
                </button>

                {availableModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModelFilter(model)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                      selectedModelFilter === model
                        ? 'bg-violet-600 text-white border border-violet-500'
                        : 'bg-white/[0.03] border border-white/10 text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Section Cards Grid */}
        {filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-3xl bg-[#0B0C15]/80 border border-white/[0.08] text-center space-y-4 my-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
              🔍
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {isAr
                  ? 'لم يتم العثور على برومبتات في هذا القسم'
                  : 'No prompts found in this hub'}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                {isAr
                  ? 'جرب البحث بكلمة مختلفة أو قم بإلغاء التصفية لعرض كافة برومبتات القسم.'
                  : 'Try modifying your search term or reset filters to display all hub items.'}
              </p>
            </div>
            <button
              onClick={() => {
                setScopedSearch('');
                setSelectedModelFilter('all');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600/40 border border-purple-500/40 hover:bg-purple-600/60 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط البحث' : 'Reset Hub Search'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPrompts.map((prompt) => (
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
        )}

      </div>
    </div>
  );
};
