import React, { useState } from 'react';
import { X, Sparkles, Image, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, PromptItem, HubCategory } from '../types';
import { CREATORS_DATA } from '../data/promptsData';
import { CATEGORY_HUBS } from '../data/hubsData';

interface SubmitPromptModalProps {
  isOpen: boolean;
  lang: Language;
  initialHubId?: string | null;
  categories?: HubCategory[];
  onClose: () => void;
  onSubmitPrompt: (newPrompt: PromptItem) => void;
}

const MODELS = [
  'Midjourney v6.1',
  'FLUX.1 Pro',
  'Niji v6',
  'DALL·E 3',
  'Claude 3.7',
  'GPT-4o',
  'Stable Diffusion XL',
];

export const SubmitPromptModal: React.FC<SubmitPromptModalProps> = ({
  isOpen,
  lang,
  initialHubId,
  categories = CATEGORY_HUBS,
  onClose,
  onSubmitPrompt,
}) => {
  const isAr = lang === 'ar';
  const activeCategories = categories.length > 0 ? categories : CATEGORY_HUBS;

  const [title, setTitle] = useState('');
  const [model, setModel] = useState<string>(MODELS[0]);
  const [category, setCategory] = useState<string>(initialHubId || activeCategories[0]?.id || 'portrait');
  const [imageUrl, setImageUrl] = useState('');
  const [promptText, setPromptText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync category if initialHubId is passed
  React.useEffect(() => {
    if (initialHubId) {
      setCategory(initialHubId);
    } else if (activeCategories.length > 0 && !activeCategories.some((c) => c.id === category)) {
      setCategory(activeCategories[0].id);
    }
  }, [initialHubId, isOpen, activeCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      setValidationError(isAr ? 'يرجى كتابة عنوان للبرومبت' : 'Please enter a prompt title');
      return;
    }
    if (!promptText.trim()) {
      setValidationError(isAr ? 'يرجى كتابة نص البرومبت الكامل' : 'Please enter the prompt text');
      return;
    }
    if (!category) {
      setValidationError(isAr ? 'يرجى تحديد التصنيف' : 'Please select a category');
      return;
    }

    setValidationError('');

    // Prepare tags
    const userTags = tagsInput
      .split(/[,،]/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const activeCatObj = activeCategories.find((c) => c.id === category) || activeCategories[0] || {
      id: 'portrait',
      titleAr: 'بورتريه',
      titleEn: 'Portrait',
    };

    const finalTags = Array.from(
      new Set([activeCatObj.titleAr, model.split(' ')[0], ...userTags])
    );

    // Fallback preview image based on category if none provided
    const fallbackImages: Record<string, string> = {
      'portrait': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'cinematic': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'cyberpunk': 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
      'anime': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      '3d-design': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'code-dev': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    };

    const finalImageUrl = imageUrl.trim() || fallbackImages[category] || fallbackImages['portrait'];

    const newPromptItem: PromptItem = {
      id: `user-p-${Date.now()}`,
      titleAr: title.trim(),
      titleEn: title.trim(),
      promptText: promptText.trim(),
      model,
      category: (activeCatObj as any).pillar || 'image',
      hubId: activeCatObj.id,
      aspectRatio: '1:1',
      likes: 1,
      saves: 0,
      isLiked: true,
      isSaved: false,
      tags: finalTags,
      creator: CREATORS_DATA[0] || {
        id: 'user-me',
        name: isAr ? 'أحمد مصطفى' : 'Ahmed Mustafa',
        handle: '@ahmed_creator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        badge: isAr ? 'مبدع سَوّيها' : 'Sawihaa Creator',
        promptCount: 1,
        followers: 1,
        verified: true,
      },
      visualType: (activeCatObj as any).type || 'cinematic_director',
      featured: true,
      createdAt: isAr ? 'الآن' : 'Just now',
      imageUrl: finalImageUrl,
    };

    onSubmitPrompt(newPromptItem);

    // Reset Form
    setTitle('');
    setModel(MODELS[0]);
    setCategory(activeCategories[0]?.id || 'portrait');
    setImageUrl('');
    setPromptText('');
    setTagsInput('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      {/* Modal Box */}
      <div
        className="bg-[#0c0d14] border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl shadow-purple-950/40 relative my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'مجتمع المبدعين' : 'Creator Community'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white pt-1">
              {isAr ? 'شارك إبداعك - إضافة برومبت جديد' : 'Share Your Craft - Add New Prompt'}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              {isAr
                ? 'انشر أوامرك الأصلية ليتمكن آلاف المصممين والمطورين من استكشافها وتجربتها.'
                : 'Publish your original prompts for thousands of creators to discover and use.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/[0.06] shrink-0"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* عنوان البرومبت (Prompt Title) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {isAr ? 'عنوان البرومبت' : 'Prompt Title'}{' '}
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? 'مثال: بورتريه سينمائي بإضاءة استوديو درامية' : 'e.g. Ultra-realistic cinematic portrait'}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Model & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* النموذج / الأداة (AI Model) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {isAr ? 'النموذج / الأداة' : 'AI Model'}{' '}
                <span className="text-rose-400">*</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141523] border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white transition-colors cursor-pointer"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m} className="bg-[#141523] text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* التصنيف (Category) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {isAr ? 'التصنيف' : 'Category'}{' '}
                <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141523] border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white transition-colors cursor-pointer"
              >
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#141523] text-white">
                    {isAr ? c.titleAr : (c.titleEn || c.titleAr)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* رابط الصورة (Preview Image URL) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>{isAr ? 'رابط الصورة المعاينة (اختياري)' : 'Preview Image URL (Optional)'}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {isAr ? 'أو اتركها فارغة لمعاينة تلقائية' : 'Leave empty for auto placeholder'}
              </span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
                />
              </div>

              {/* Instant preview thumbnail placeholder */}
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/15 bg-white/[0.03] flex items-center justify-center shrink-0">
                {imageUrl.trim() ? (
                  <img
                    src={imageUrl.trim()}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
          </div>

          {/* نص البرومبت الكامل (The Prompt) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {isAr ? 'نص البرومبت الكامل' : 'The Full Prompt Text'}{' '}
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب هنا الأمر النصي الدقيق مع المعاملات مثل --ar 16:9 --v 6.1 --stylize 250...'
                  : 'Enter the exact prompt text including parameters like --ar 16:9 --v 6.1...'
              }
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-500 focus:outline-none text-sm font-mono text-slate-200 placeholder-slate-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* وسوم إضافية (Tags) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {isAr ? 'وسوم إضافية (مفصولة بفاصلة)' : 'Additional Tags (Comma separated)'}
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={isAr ? 'سينمائي, إضاءة_درامية, 8k, واقعي' : 'cinematic, neon, studio, realistic'}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 shadow-[0_0_25px_rgba(168,85,247,0.45)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isAr ? 'نشر البرومبت الآن' : 'Publish Prompt Now'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
