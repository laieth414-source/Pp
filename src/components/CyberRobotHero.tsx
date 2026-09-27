import React, { useState } from 'react';
import { Language } from '../types';

interface CyberRobotHeroProps {
  lang: Language;
}

const PROMPT_TIPS = [
  {
    ar: '💡 سَوّيها: اكتشف أقوى البرومبتات',
    en: '💡 Sawihaa: Explore Top Prompts',
  },
  {
    ar: '⚡ نصيحة: ادمج Rim Lighting لعمق كروم واقعي',
    en: '⚡ Tip: Add Rim Lighting for chrome realism',
  },
  {
    ar: '🎯 معايير: اضبط --v 6.1 و --stylize 250',
    en: '🎯 Tuning: Try --v 6.1 & --stylize 250',
  },
  {
    ar: '💎 سَوّيها 3D: استخدم Octane Render 8K',
    en: '💎 3D: Specify Octane Render 8K',
  },
];

export const CyberRobotHero: React.FC<CyberRobotHeroProps> = ({ lang }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const isAr = lang === 'ar';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const handleClick = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 500);
    setTipIndex((prev) => (prev + 1) % PROMPT_TIPS.length);
  };

  return (
    /* Relative auto-centering container for robot and neatly arranged floating badges */
    <div
      className="relative flex items-center justify-center min-w-[320px] max-w-[480px] mx-auto select-none py-8 px-4"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={isAr ? 'تفاعل مع روبوت سايبر المستقبلي' : 'Interact with futuristic cyber robot'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Soft Ambient Violet Glow Behind Robot Silhouette */}
      <div
        className="absolute inset-4 rounded-full pointer-events-none -z-10 blur-[85px] transition-all duration-500"
        style={{
          background: isFlashing
            ? 'radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.5) 0%, rgba(168, 85, 247, 0.35) 50%, transparent 75%)'
            : 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.3) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 70%)',
        }}
      />
      <div className="absolute top-1/4 -right-2 w-52 h-52 bg-fuchsia-600/15 rounded-full blur-[70px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-6 -left-2 w-52 h-52 bg-violet-600/15 rounded-full blur-[70px] pointer-events-none -z-10" />

      {/* Badge 1: Top right (above head) */}
      <div
        className="absolute -top-3 right-0 sm:right-2 z-20 pointer-events-auto transition-transform duration-300"
        style={{
          transform: isHovered
            ? `translate3d(${mousePos.x * -8}px, ${mousePos.y * 8}px, 30px)`
            : undefined,
        }}
      >
        <div className="backdrop-blur-xl bg-white/[0.05] border border-purple-500/20 px-3.5 py-1.5 rounded-full text-xs text-purple-200 shadow-lg flex items-center gap-2 hover:border-purple-400/40 hover:bg-white/[0.08] transition-all whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
          </span>
          <span className="font-semibold tracking-wide">
            {isAr ? '✨ أكثر من 100 ألف برومبت' : '✨ 100k+ Verified Prompts'}
          </span>
        </div>
      </div>

      {/* Badge 2: Near the neck/shoulder on the left */}
      <div
        className="absolute top-1/3 -left-3 sm:-left-6 z-20 pointer-events-auto transition-transform duration-300"
        style={{
          transform: isHovered
            ? `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 30px)`
            : undefined,
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <div className="backdrop-blur-xl bg-white/[0.05] border border-purple-500/20 px-3.5 py-1.5 rounded-full text-xs text-purple-200 shadow-lg flex items-center gap-2 hover:border-purple-400/40 hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
          <span className="font-medium tracking-wide">
            {isAr ? PROMPT_TIPS[tipIndex].ar : PROMPT_TIPS[tipIndex].en}
          </span>
        </div>
      </div>

      {/* Robot Silhouette Container: Mirrored horizontally to face right towards headline */}
      <div
        className={`relative w-full max-w-[360px] sm:max-w-[420px] aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 ${
          isFlashing ? 'scale-95' : 'hover:scale-[1.01]'
        }`}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 6}deg)`
            : 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
        }}
      >
        {/* Subtle Pulse Wave on Click */}
        {isFlashing && (
          <div className="absolute inset-4 rounded-full border border-purple-400/70 animate-ping pointer-events-none" />
        )}

        {/* Clean Standard <img> tag with direct URL, mirrored horizontally and with violet ambient glow */}
        <img
          src="https://i.postimg.cc/6p96svf6/futuristic-robot-listening-music-headphones.png"
          alt={isAr ? 'روبوت سايبر مستقبلي يرتدي سماعات' : 'Futuristic Cyber Robot with Headphones'}
          referrerPolicy="no-referrer"
          className="w-full h-full max-h-[460px] object-contain object-center scale-x-[-1] pointer-events-none transition-all duration-300"
          style={{
            filter: isFlashing
              ? 'drop-shadow(0 0 55px rgba(216, 70, 239, 0.75)) drop-shadow(0 0 45px rgba(168, 85, 247, 0.9))'
              : 'drop-shadow(0 0 45px rgba(168, 85, 247, 0.45))',
          }}
          loading="eager"
          draggable={false}
        />
      </div>

      {/* Badge 3: Centered cleanly beneath the chest */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-transform duration-300"
        style={{
          transform: isHovered
            ? `translate3d(calc(-50% + ${mousePos.x * 6}px), ${mousePos.y * 6}px, 35px)`
            : 'translate3d(-50%, 0, 0)',
        }}
      >
        <div className="backdrop-blur-xl bg-white/[0.05] border border-purple-500/20 px-3.5 py-1.5 rounded-full text-xs text-purple-200 shadow-lg flex items-center gap-2 hover:border-purple-400/40 hover:bg-white/[0.08] transition-all whitespace-nowrap">
          <span className="text-amber-300 text-xs">💎</span>
          <span className="font-semibold tracking-wide">
            {isAr ? '💎 نتائج أصلية فائقة الدقة' : '💎 High-Fidelity 8K Output'}
          </span>
        </div>
      </div>
    </div>
  );
};
