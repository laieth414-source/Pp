import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { PromptItem, Language } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: PromptItem[];
  lang: Language;
  onSelectPrompt: (prompt: PromptItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  prompts,
  lang,
  onSelectPrompt,
}) => {
  const [query, setQuery] = useState('');
  const isAr = lang === 'ar';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? prompts.filter(
        (p) =>
          p.titleAr.toLowerCase().includes(query.toLowerCase()) ||
          p.titleEn.toLowerCase().includes(query.toLowerCase()) ||
          p.promptText.toLowerCase().includes(query.toLowerCase()) ||
          p.model.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : prompts.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl backdrop-blur-2xl bg-[#090A14]/95 border border-purple-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder={
              isAr
                ? 'ابحث في البرومبتات، النماذج، الوسوم، أو المبدعين...'
                : 'Search prompts, models, tags, or creators...'
            }
            className="w-full bg-transparent border-none px-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-0"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>{query ? (isAr ? 'نتائج البحث:' : 'Search Results:') : (isAr ? 'برومبتات مقترحة:' : 'Suggestions:')}</span>
            <span>{results.length} {isAr ? 'عنصر' : 'items'}</span>
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {isAr ? 'لم يتم العثور على برومبتات مطابقة لبحثك' : 'No matching prompts found.'}
            </div>
          ) : (
            results.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => {
                  onSelectPrompt(prompt);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-purple-500/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {isAr ? prompt.titleAr : prompt.titleEn}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                      <span>{prompt.model}</span>
                      <span>·</span>
                      <span>{prompt.creator.name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-purple-300">
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{isAr ? 'اضغط ESC للإغلاق' : 'Press ESC to close'}</span>
          <span>{isAr ? 'منصة سَوّيها AI' : 'Sawihaa Prompt Engine'}</span>
        </div>

      </div>
    </div>
  );
};
