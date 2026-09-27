import React from 'react';
import { PromptItem } from '../types';

interface PromptArtworkProps {
  prompt: PromptItem;
  className?: string;
  showOverlay?: boolean;
}

export const PromptArtwork: React.FC<PromptArtworkProps> = ({ prompt, className = '', showOverlay = true }) => {
  const { visualType } = prompt;

  const renderArtwork = () => {
    if (prompt.imageUrl) {
      return (
        <img
          src={prompt.imageUrl}
          alt={prompt.titleAr}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      );
    }

    switch (visualType) {
      case 'ancient_futuristic':
        return (
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0b081a] via-[#170e2f] to-[#080512]">
            {/* Holographic Islamic Domes & Cyber Minarets */}
            <svg viewBox="0 0 400 300" className="w-full h-full object-cover" fill="none">
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E1035" />
                  <stop offset="50%" stopColor="#0F0926" />
                  <stop offset="100%" stopColor="#06040F" />
                </linearGradient>
                <radialGradient id="twilightMoon" cx="70%" cy="30%" r="40%">
                  <stop offset="0%" stopColor="#F5D0FE" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#A855F7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="400" height="300" fill="url(#skyGrad)" />
              <circle cx="280" cy="90" r="70" fill="url(#twilightMoon)" />
              {/* Star grid */}
              <circle cx="50" cy="40" r="1.5" fill="#E9D5FF" opacity="0.8" />
              <circle cx="120" cy="70" r="1.2" fill="#E9D5FF" opacity="0.6" />
              <circle cx="340" cy="30" r="1.5" fill="#E9D5FF" opacity="0.9" />
              <circle cx="210" cy="50" r="1.8" fill="#E9D5FF" opacity="0.7" />
              {/* Distant cyber city silhouette */}
              <path d="M 20 230 L 40 180 L 70 180 L 80 230 L 110 230 L 125 150 L 140 230 Z" fill="#130D26" />
              <path d="M 260 230 L 280 140 L 295 140 L 310 230 L 350 230 L 370 170 L 390 230 Z" fill="#181033" />
              {/* Iconic Glowing Cyber Minaret */}
              <rect x="70" y="70" width="16" height="150" fill="#2E1065" stroke="#A855F7" strokeWidth="1" />
              <polygon points="70,70 78,35 86,70" fill="#C084FC" />
              <circle cx="78" cy="35" r="4" fill="#FDE047" />
              <line x1="78" y1="70" x2="78" y2="220" stroke="#F472B6" strokeWidth="2" strokeDasharray="6 4" />
              {/* Grand Glowing Islamic Dome */}
              <path d="M 140 220 C 140 130 240 130 240 220 Z" fill="#1E0E3E" stroke="#9333EA" strokeWidth="2" />
              <path d="M 170 220 C 170 160 210 160 210 220 Z" fill="#3B0764" stroke="#C084FC" strokeWidth="1" />
              <circle cx="190" cy="120" r="5" fill="#FDE047" />
              {/* Water Canal Reflections */}
              <rect x="0" y="220" width="400" height="80" fill="#090514" />
              <line x1="0" y1="230" x2="400" y2="230" stroke="#A855F7" strokeWidth="2" opacity="0.4" />
              <line x1="60" y1="245" x2="320" y2="245" stroke="#C084FC" strokeWidth="1.5" opacity="0.5" />
              <line x1="120" y1="260" x2="260" y2="260" stroke="#E879F9" strokeWidth="2" opacity="0.7" />
            </svg>
          </div>
        );

      case 'mecha_warrior':
        return (
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#090714] via-[#130E26] to-[#05030A]">
            <svg viewBox="0 0 350 400" className="w-full h-full object-cover" fill="none">
              <defs>
                <radialGradient id="eyeVisor" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#D946EF" />
                  <stop offset="100%" stopColor="#7E22CE" />
                </radialGradient>
              </defs>
              {/* Rain lines */}
              <line x1="40" y1="10" x2="20" y2="120" stroke="#A855F7" strokeWidth="1" opacity="0.3" />
              <line x1="120" y1="30" x2="100" y2="150" stroke="#C084FC" strokeWidth="1.2" opacity="0.4" />
              <line x1="280" y1="20" x2="260" y2="160" stroke="#A855F7" strokeWidth="1.5" opacity="0.35" />
              <line x1="320" y1="60" x2="300" y2="200" stroke="#E879F9" strokeWidth="1" opacity="0.25" />
              {/* Titanium helmet cowl */}
              <path d="M 90 120 C 100 40 250 40 260 120 L 275 220 L 225 310 L 125 310 L 75 220 Z" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
              <path d="M 120 70 C 140 50 210 50 230 70 L 245 130 L 105 130 Z" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
              {/* Luminous Violet Visor Slot */}
              <path d="M 100 140 L 250 140 L 235 180 L 115 180 Z" fill="url(#eyeVisor)" />
              <line x1="110" y1="160" x2="240" y2="160" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />
              {/* Angular Jaw / Chin Filters */}
              <polygon points="140,210 210,210 195,270 155,270" fill="#0F172A" stroke="#A855F7" strokeWidth="1.5" />
              <circle cx="175" cy="240" r="8" fill="#581C87" stroke="#C084FC" strokeWidth="1.5" />
              <circle cx="175" cy="240" r="3" fill="#FFFFFF" />
              {/* Shoulder Pauldrons */}
              <path d="M 30 280 L 100 240 L 115 350 L 20 370 Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />
              <path d="M 320 280 L 250 240 L 235 350 L 330 370 Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />
              {/* Water droplet sheen */}
              <circle cx="120" cy="110" r="2.5" fill="#E2E8F0" opacity="0.8" />
              <circle cx="230" cy="115" r="2" fill="#E2E8F0" opacity="0.9" />
              <circle cx="145" cy="195" r="1.5" fill="#C084FC" />
            </svg>
          </div>
        );

      case 'luxury_hypercar':
        return (
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#06050b] via-[#100b21] to-[#040208]">
            <svg viewBox="0 0 400 240" className="w-full h-full object-cover" fill="none">
              <defs>
                <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1E1B2E" />
                  <stop offset="40%" stopColor="#312252" />
                  <stop offset="70%" stopColor="#1A1528" />
                  <stop offset="100%" stopColor="#0B0914" />
                </linearGradient>
                <linearGradient id="neonLightbar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="50%" stopColor="#E879F9" />
                  <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
              </defs>
              {/* Wet floor reflection */}
              <ellipse cx="200" cy="195" rx="170" ry="30" fill="#2E1065" opacity="0.25" />
              {/* Sleek Aerodynamic Silhouette */}
              <path
                d="M 50 155 C 80 135 120 125 180 100 C 230 80 270 85 310 115 C 340 130 365 145 370 160 L 350 175 L 50 175 Z"
                fill="url(#carBody)"
                stroke="#6B21A8"
                strokeWidth="1.5"
              />
              {/* Low-profile Cockpit Canopy */}
              <path
                d="M 160 108 C 190 92 230 92 265 112 L 255 125 L 170 125 Z"
                fill="#05030A"
                stroke="#A855F7"
                strokeWidth="1"
              />
              {/* Signature Violet LED Tail & Side Accent Line */}
              <path
                d="M 45 155 C 100 145 220 135 365 150"
                stroke="url(#neonLightbar)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Front Splitter Aero Vent */}
              <path d="M 330 158 L 375 162 L 365 174 L 325 172 Z" fill="#0A0612" stroke="#7E22CE" strokeWidth="1" />
              {/* High-Performance Centerlock Wheels with Purple Calipers */}
              {/* Rear Wheel */}
              <circle cx="105" cy="170" r="26" fill="#090714" stroke="#475569" strokeWidth="3" />
              <circle cx="105" cy="170" r="16" fill="#1E1B2E" stroke="#9333EA" strokeWidth="2" />
              <path d="M 98 165 C 105 160 112 165 112 172" stroke="#D946EF" strokeWidth="3" fill="none" />
              {/* Front Wheel */}
              <circle cx="305" cy="170" r="26" fill="#090714" stroke="#475569" strokeWidth="3" />
              <circle cx="305" cy="170" r="16" fill="#1E1B2E" stroke="#9333EA" strokeWidth="2" />
              <path d="M 298 165 C 305 160 312 165 312 172" stroke="#D946EF" strokeWidth="3" fill="none" />
            </svg>
          </div>
        );

      case 'digital_fashion':
        return (
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#120a21] via-[#1d1033] to-[#07040d]">
            <svg viewBox="0 0 350 400" className="w-full h-full object-cover" fill="none">
              <defs>
                <radialGradient id="fabricGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F0ABFC" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#A855F7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Ambient Fashion Studio Flare */}
              <circle cx="175" cy="160" r="120" fill="url(#fabricGlow)" />
              {/* Stylized Haute Couture Mannequin/Model Silhouette */}
              <path d="M 160 80 C 160 60 190 60 190 80 C 190 95 160 95 160 80 Z" fill="#F5D0FE" opacity="0.9" />
              <line x1="175" y1="95" x2="175" y2="120" stroke="#F5D0FE" strokeWidth="4" />
              {/* Draped bioluminescent dress with fluid fiber optic strands */}
              <path
                d="M 140 130 C 120 180 80 250 60 360 C 140 380 210 380 290 360 C 270 250 230 180 210 130 Z"
                fill="#2E1065"
                stroke="#C084FC"
                strokeWidth="1.5"
                opacity="0.85"
              />
              {/* Cascading luminous fiber threads */}
              <path d="M 160 130 Q 120 220 90 350" stroke="#F472B6" strokeWidth="2" opacity="0.8" />
              <path d="M 175 130 Q 170 230 160 365" stroke="#E879F9" strokeWidth="2.5" opacity="0.9" />
              <path d="M 190 130 Q 230 220 260 350" stroke="#C084FC" strokeWidth="2" opacity="0.8" />
              <path d="M 145 180 Q 200 240 235 340" stroke="#A855F7" strokeWidth="1.8" opacity="0.7" />
              {/* Luminescent butterflies/particles */}
              <circle cx="110" cy="180" r="3" fill="#FDE047" />
              <circle cx="240" cy="160" r="2.5" fill="#F472B6" />
              <circle cx="210" cy="260" r="3" fill="#F0ABFC" />
            </svg>
          </div>
        );

      case 'neon_dragon':
        return (
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#080514] via-[#150a2b] to-[#040208]">
            <svg viewBox="0 0 400 240" className="w-full h-full object-cover" fill="none">
              {/* Lightning strikes */}
              <path d="M 70 0 L 85 50 L 75 70 L 95 110" stroke="#E879F9" strokeWidth="1.5" opacity="0.6" />
              <path d="M 330 0 L 315 40 L 325 65 L 305 100" stroke="#C084FC" strokeWidth="1.5" opacity="0.7" />
              {/* Cyber dragon coils */}
              <path
                d="M 50 180 Q 120 70 200 120 T 350 90"
                stroke="#A855F7"
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 50 180 Q 120 70 200 120 T 350 90"
                stroke="#F0ABFC"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="12 8"
                fill="none"
              />
              {/* Dragon Head with Violet Eye */}
              <polygon points="340,75 385,85 365,115 330,105" fill="#3B0764" stroke="#C084FC" strokeWidth="2" />
              <circle cx="360" cy="88" r="4" fill="#FDE047" />
              {/* Horns */}
              <path d="M 345 75 Q 360 40 375 30" stroke="#E879F9" strokeWidth="3" fill="none" />
            </svg>
          </div>
        );

      case 'ai_code_agent':
        return (
          <div className="relative w-full h-full overflow-hidden bg-[#0A0B12] p-5 flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] text-purple-400 font-semibold tracking-wider">AGENT_CORE::v4.2</span>
            </div>
            <div className="space-y-1.5 text-slate-300 py-3">
              <div className="text-purple-400">const pipeline = new AgentOrchestrator(&#123;</div>
              <div className="pl-4 text-slate-400">model: <span className="text-emerald-400">'claude-3.7-sonnet'</span>,</div>
              <div className="pl-4 text-slate-400">reasoning: <span className="text-amber-400">'deep_research'</span>,</div>
              <div className="pl-4 text-slate-400">verification: <span className="text-purple-300">true</span></div>
              <div className="text-purple-400">&#125;);</div>
              <div className="text-emerald-400 pt-1">await pipeline.executeAutonomousFlow();</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-purple-500/20 text-[10px] text-purple-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ACTIVE_THREADS: 8</span>
              </span>
              <span>100% PASS RATE</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-violet-950/30 to-[#07080D] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              ✦
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative overflow-hidden group select-none ${className}`}>
      {renderArtwork()}

      {/* Subtle Ambient Vignette & Scrim */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080D] via-transparent to-transparent opacity-80 pointer-events-none" />
      )}
    </div>
  );
};
