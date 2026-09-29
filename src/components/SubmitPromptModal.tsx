import React, { useState, useRef } from 'react';
import { X, Sparkles, Image, Send, CheckCircle2, AlertCircle, Upload, Camera, Trash2, Link, Globe, Lock, Layers } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [model, setModel] = useState<string>(MODELS[0]);
  const [category, setCategory] = useState<string>('بورتريه ووجوه');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submissionTarget, setSubmissionTarget] = useState<'public' | 'private' | 'both'>('public');
  const [validationError, setValidationError] = useState('');

  // Sync category if initialHubId is passed
  React.useEffect(() => {
    if (initialHubId) {
      if (initialHubId === 'portrait') setCategory('بورتريه ووجوه');
      else if (initialHubId === 'cinematic') setCategory('سينمائي ودرامي');
      else if (initialHubId === 'anime') setCategory('أنمي وفانتازيا');
      else if (initialHubId === 'commercial') setCategory('تصميم تجاري');
      else if (initialHubId === '3d' || initialHubId === '3d-design') setCategory('شخصيات 3D');
      else if (initialHubId === 'cyberpunk') setCategory('سايبربانك وخيال علمي');
      else if (initialHubId === 'code' || initialHubId === 'code-dev') setCategory('برمجة وكود');
      else setCategory(initialHubId);
    }
  }, [initialHubId, isOpen]);

  if (!isOpen) return null;

  // Handle direct file selection and compression
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError(isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawData = event.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setUploadedImageBase64(compressedBase64);
        setImageUrl('');
        setValidationError('');
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImageBase64('');
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

    const categoryToHubMap: Record<string, string> = {
      'بورتريه ووجوه': 'portrait',
      'سينمائي ودرامي': 'cinematic',
      'أنمي وفانتازيا': 'anime',
      'تصميم تجاري': '3d-design',
      'شخصيات 3D': '3d-design',
      'سايبربانك وخيال علمي': 'cyberpunk',
      'برمجة وكود': 'code-dev',
    };

    const derivedHubId = categoryToHubMap[category] || 'portrait';

    const finalTags = Array.from(
      new Set([category, model.split(' ')[0], ...userTags])
    );

    // Fallback preview image based on category if none provided
    const fallbackImages: Record<string, string> = {
      'بورتريه ووجوه': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'سينمائي ودرامي': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'سايبربانك وخيال علمي': 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
      'أنمي وفانتازيا': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      'شخصيات 3D': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'تصميم تجاري': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'برمجة وكود': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    };

    const finalImageUrl = uploadedImageBase64 || imageUrl.trim() || fallbackImages[category] || fallbackImages['بورتريه ووجوه'];
    const determinedStatus: 'pending' | 'private' = submissionTarget === 'private' ? 'private' : 'pending';

    const newPromptItem: PromptItem = {
      id: `user-p-${Date.now()}`,
      titleAr: title.trim(),
      titleEn: title.trim(),
      promptText: promptText.trim(),
      model,
      category: category.trim(),
      hubId: derivedHubId,
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
      visualType: 'cinematic_director',
      featured: false,
      isFeatured: false,
      createdAt: isAr ? 'الآن' : 'Just now',
      imageUrl: finalImageUrl,
      status: determinedStatus,
      submissionTarget,
    };

    onSubmitPrompt(newPromptItem);

    // Reset Form
    setTitle('');
    setModel(MODELS[0]);
    setCategory('بورتريه ووجوه');
    setImageUrl('');
    setUploadedImageBase64('');
    setPromptText('');
    setTagsInput('');
    setSubmissionTarget('public');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      {/* Modal Box */}
      <div
        className="bg-[#13141c] border border-white/10 rounded-2xl p-5 sm:p-7 max-w-xl w-full shadow-2xl relative my-8 text-[#f8fafc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>{isAr ? 'مجتمع المبدعين' : 'Creator Community'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white pt-1">
              {isAr ? 'شارك إبداعك - إضافة برومبت جديد' : 'Share Your Craft - Add New Prompt'}
            </h3>
            <p className="text-[#94a3b8] text-xs sm:text-sm">
              {isAr
                ? 'انشر أوامرك الأصلية ليتمكن آلاف المصممين والمطورين من استكشافها وتجربتها.'
                : 'Publish your original prompts for thousands of creators to discover and use.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/10 shrink-0"
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
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
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
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-violet-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
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
                className="w-full px-4 py-2.5 rounded-xl bg-[#141523] border border-white/10 focus:border-violet-500 focus:outline-none text-sm text-white transition-colors cursor-pointer"
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
                className="w-full px-4 py-2.5 rounded-xl bg-[#141523] border border-white/10 focus:border-violet-500 focus:outline-none text-sm text-white transition-colors cursor-pointer"
              >
                <option value="بورتريه ووجوه" className="bg-[#141523] text-white">بورتريه ووجوه</option>
                <option value="سينمائي ودرامي" className="bg-[#141523] text-white">سينمائي ودرامي</option>
                <option value="أنمي وفانتازيا" className="bg-[#141523] text-white">أنمي وفانتازيا</option>
                <option value="تصميم تجاري" className="bg-[#141523] text-white">تصميم تجاري</option>
                <option value="شخصيات 3D" className="bg-[#141523] text-white">شخصيات 3D</option>
                <option value="سايبربانك وخيال علمي" className="bg-[#141523] text-white">سايبربانك وخيال علمي</option>
                <option value="برمجة وكود" className="bg-[#141523] text-white">برمجة وكود</option>
              </select>
            </div>
          </div>

          {/* صورة البرومبت: Direct File Upload from Gallery/Files */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>{isAr ? 'صورة نتيجة البرومبت (Image Upload)' : 'Prompt Output Image'}</span>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-violet-400 hover:text-violet-300 font-normal underline cursor-pointer flex items-center gap-1"
              >
                <Link className="w-3 h-3" />
                <span>
                  {showUrlInput
                    ? (isAr ? 'إخفاء الرابط الخارجي' : 'Hide URL input')
                    : (isAr ? 'أو استخدم رابط صورة خارجي (اختياري)' : 'Or use external image URL')}
                </span>
              </button>
            </label>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              id="prompt-image-upload"
              onChange={handleFileSelect}
            />

            {/* Upload Area / Image Preview */}
            {uploadedImageBase64 ? (
              <div className="relative rounded-xl border border-violet-500/40 bg-violet-950/20 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={uploadedImageBase64}
                    alt="Uploaded output"
                    className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{isAr ? 'تم تحميل الصورة بنجاح من الجهاز' : 'Image loaded from device'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {isAr ? 'جاهزة للحفظ والعرض الفوري' : 'Ready for instant preview'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إزالة / تغيير' : 'Change'}</span>
                </button>
              </div>
            ) : (
              <label
                htmlFor="prompt-image-upload"
                className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl border-2 border-dashed border-violet-500/40 hover:border-violet-400 bg-violet-600/[0.04] hover:bg-violet-600/[0.08] transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {isAr ? '📷 اختر صورة من الاستوديو أو الملفات (Upload Image)' : '📷 Upload Image from Gallery or Files'}
                </span>
                <span className="text-[11px] text-[#94a3b8] mt-1">
                  {isAr ? 'يدعم JPG وPNG وWebP (يتم الضغط والحفظ تلقائياً)' : 'JPG, PNG, WebP supported with auto-compression'}
                </span>
              </label>
            )}

            {/* Optional URL Input if toggled */}
            {showUrlInput && (
              <div className="pt-2 animate-in fade-in">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value.trim()) setUploadedImageBase64('');
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus:border-violet-500 focus:outline-none text-xs text-white placeholder-slate-500 transition-colors"
                />
              </div>
            )}
          </div>

          {/* خيارات نشر المحتوى (Submission Target Options) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>{isAr ? 'خيارات نشر المحتوى:' : 'Publishing Target:'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  submissionTarget === 'private'
                    ? 'bg-violet-600/20 border-violet-500 text-white'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="submissionTarget"
                  value="private"
                  checked={submissionTarget === 'private'}
                  onChange={() => setSubmissionTarget('private')}
                  className="hidden"
                />
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{isAr ? 'حفظ في حسابي فقط' : 'Private (Only Me)'}</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  submissionTarget === 'public'
                    ? 'bg-violet-600/20 border-violet-500 text-white'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="submissionTarget"
                  value="public"
                  checked={submissionTarget === 'public'}
                  onChange={() => setSubmissionTarget('public')}
                  className="hidden"
                />
                <Globe className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>{isAr ? 'طلب النشر العام' : 'Public Review'}</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  submissionTarget === 'both'
                    ? 'bg-violet-600/20 border-violet-500 text-white'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="submissionTarget"
                  value="both"
                  checked={submissionTarget === 'both'}
                  onChange={() => setSubmissionTarget('both')}
                  className="hidden"
                />
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isAr ? 'كلاهما معاً' : 'Both'}</span>
              </label>
            </div>

            <p className="text-[11px] text-slate-400">
              {submissionTarget === 'private'
                ? (isAr ? '🔒 سيبقى هذا البرومبت محفوظاً في ملفك الشخصي فقط ولا يظهر للعامة.' : 'Stored in your personal library only.')
                : (isAr ? '⏳ سينتقل طلبك إلى قائمة مراجعة الإدارة للموافقة عليه قبل ظهوره في الصفحة الرئيسية.' : 'Will go to admin moderation queue before appearing publicly.')}
            </p>
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
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-violet-500 focus:outline-none text-sm font-mono text-slate-200 placeholder-slate-500 transition-colors resize-none leading-relaxed"
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
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-violet-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm transition-colors flex items-center gap-2 cursor-pointer active:scale-95"
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
