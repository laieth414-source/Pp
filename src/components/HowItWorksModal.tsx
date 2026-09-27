import React from 'react';
import { X, Search, Copy, Sparkles, CheckCircle2, Sliders, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language } from '../types';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose, lang }) => {
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      titleAr: 'استكشف وابحث بدقة',
      titleEn: '1. Discover & Filter',
      descAr: 'تصفح آلاف البرومبتات المنظمة حسب التصنيف، النموذج (Midjourney, Flux, Kling)، أو النمط الفني بدقة عالية.',
      descEn: 'Browse curated prompts filtered by model, media type, style, or specific creative outcome.',
      icon: <Search className="w-5 h-5 text-purple-400" />,
    },
    {
      num: '02',
      titleAr: 'انسخ بضغطة زر واحدة مع المعايير',
      titleEn: '2. One-Click Copy with Parameters',
      descAr: 'انسخ الأمر النصي الكامل مع كافة معايير الضبط الدقيقة (--ar, --stylize, --seed, negative prompts).',
      descEn: 'Copy complete prompts along with fine-tuned arguments, aspect ratios, seeds, and negative exclusions.',
      icon: <Copy className="w-5 h-5 text-fuchsia-400" />,
    },
    {
      num: '03',
      titleAr: 'ألصق وأنتج مخرجات 8K أصلية',
      titleEn: '3. Paste & Generate High-End Assets',
      descAr: 'ألصق البرومبت مباشرة في أداتك المفضلة (Discord, Web, API) واحصل على نتائج مطابقة للعينات المعتمدة.',
      descEn: 'Paste directly into your model workspace and reproduce world-class photorealistic or cinematic results.',
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#13141c] border border-white/10 shadow-xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 text-[#f8fafc]">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-[#f8fafc]">
            {isAr ? 'كيف تعمل منصة «سَوّيها»؟' : 'How Sawihaa Works'}
          </h3>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1 max-w-md mx-auto">
            {isAr
              ? 'ثلاث خطوات سهلة تفصلك عن إنتاج أقوى الصور والفيديوهات الاحترافية بالذكاء الاصطناعي.'
              : 'Three streamlined steps to produce production-grade creative assets with generative AI.'}
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-violet-400 font-bold">{step.num}</span>
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? step.titleAr : step.titleEn}
                  </h4>
                </div>
                <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                  {isAr ? step.descAr : step.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-violet-600 hover:bg-violet-500 px-6 py-2.5 rounded-xl text-xs font-semibold text-white tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{isAr ? 'ابدأ الاستكشاف الآن' : 'Start Exploring'}</span>
            {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </div>
  );
};
