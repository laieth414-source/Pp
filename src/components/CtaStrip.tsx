import React from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Rocket, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface CtaStripProps {
  lang: Language;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const CtaStrip: React.FC<CtaStripProps> = ({ lang, onOpenAuth }) => {
  const isAr = lang === 'ar';

  const benefits = [
    { ar: 'حفظ وإدارة مكتبتك السحابية للبرومبتات', en: 'Save & curate your personal cloud prompt library' },
    { ar: 'مزامنة مباشرة مع إعدادات Midjourney وFlux', en: '1-click export to Midjourney, Flux & Kling params' },
    { ar: 'تحقيق أرباح عبر نشر البرومبتات الحصرية', en: 'Monetize exclusive prompt templates & recipes' },
  ];

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Ambient Container */}
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-purple-950/60 via-[#0E0C1A] to-[#07080D] border border-purple-500/30 shadow-[0_0_60px_rgba(147,51,234,0.25)] text-center sm:text-start flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Text Content */}
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-semibold">
              <Rocket className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'انضم للمجتمع الأسرع نمواً' : 'Join the Fastest Growing Hub'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {isAr ? (
                <>
                  انضم لأكبر مجتمع برومبتات عربي <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300">
                    وانشر إبداعاتك للعالم
                  </span>
                </>
              ) : (
                <>
                  Join the Premier AI Prompt Community <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300">
                    & Showcase Your Masterpieces
                  </span>
                </>
              )}
            </h2>

            <div className="space-y-2 pt-2">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{isAr ? b.ar : b.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <button
              onClick={() => onOpenAuth('signup')}
              className="violet-glow-btn px-8 py-4 rounded-full text-sm font-bold text-white tracking-wide shadow-[0_0_35px_rgba(168,85,247,0.6)] flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>{isAr ? 'ابدأ مجاناً الآن' : 'Start Free Today'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
