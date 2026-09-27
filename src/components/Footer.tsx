import React from 'react';
import { Sparkles, Twitter, Github, Disc as Discord, Youtube, Send, Heart } from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  return (
    <footer className="relative border-t border-white/[0.08] bg-[#05060A] text-slate-400 text-sm overflow-hidden">
      
      {/* Ambient Floor Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Info & Mission Statement (col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white font-cairo">
                {isAr ? 'سَوّيها | Sawihaa' : 'Sawihaa | سَوّيها'}
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              {isAr
                ? '«سَوّيها» هي المنصة العربية الأولى المتخصصة في هندسة، أرشفة، ومشاركة برومبتات الذكاء الاصطناعي بدقة متناهية، لتمكين المبدعين من استخراج أقصى طاقات النماذج التوليدية العالمية.'
                : 'Sawihaa is the premier AI Prompt Hub & Marketplace dedicated to curating, archiving, and sharing verified prompts with exact reproducible parameters.'}
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-purple-600/30 border border-white/[0.08] hover:border-purple-500/40 flex items-center justify-center hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-purple-600/30 border border-white/[0.08] hover:border-purple-500/40 flex items-center justify-center hover:text-white transition-all">
                <Discord className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-purple-600/30 border border-white/[0.08] hover:border-purple-500/40 flex items-center justify-center hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-purple-600/30 border border-white/[0.08] hover:border-purple-500/40 flex items-center justify-center hover:text-white transition-all">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Cluster: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono font-semibold text-slate-200 tracking-wider">
              {isAr ? 'الاستكشاف' : 'Explore'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#explore" className="hover:text-purple-300 transition-colors">{isAr ? 'أحدث الإضافات' : 'Latest Prompts'}</a></li>
              <li><a href="#trending" className="hover:text-purple-300 transition-colors">{isAr ? 'الترند اليومي' : 'Trending Now'}</a></li>
              <li><a href="#featured" className="hover:text-purple-300 transition-colors">{isAr ? 'المختارات المميزة' : 'Featured Spotlight'}</a></li>
              <li><a href="#categories" className="hover:text-purple-300 transition-colors">{isAr ? 'توليد الصور 8K' : 'Image Prompts'}</a></li>
              <li><a href="#categories" className="hover:text-purple-300 transition-colors">{isAr ? 'فيديوهات Kling & Runway' : 'Video Prompts'}</a></li>
            </ul>
          </div>

          {/* Navigation Cluster: Models & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono font-semibold text-slate-200 tracking-wider">
              {isAr ? 'النماذج المدعومة' : 'Supported Models'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-purple-300 transition-colors">Midjourney v6.1</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Flux.1 Pro / Schnell</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Kling AI v1.5</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Runway Gen-3 Alpha</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Claude 3.7 & GPT-4o</a></li>
            </ul>
          </div>

          {/* Navigation Cluster: Legal & Support */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono font-semibold text-slate-200 tracking-wider">
              {isAr ? 'المساعدة والقانونية' : 'Legal & Help'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-purple-300 transition-colors">{isAr ? 'شروط الاستخدام' : 'Terms of Service'}</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">{isAr ? 'معايير جودة البرومبت' : 'Prompt Standards'}</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">{isAr ? 'مركز الدعم الفني' : 'Support Center'}</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">{isAr ? 'تواصل معنا' : 'Contact Us'}</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 سَوّيها | Sawihaa. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-1">
            <span>{isAr ? 'صُنعت بحب بواسطة مجتمع الذكاء الاصطناعي' : 'Crafted with passion for AI creators'}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>

      </div>
    </footer>
  );
};
