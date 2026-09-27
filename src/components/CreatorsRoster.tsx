import React, { useState } from 'react';
import { Users, Check, UserPlus, Sparkles, Award } from 'lucide-react';
import { Creator, Language } from '../types';
import { CREATORS_DATA } from '../data/promptsData';

interface CreatorsRosterProps {
  lang: Language;
}

export const CreatorsRoster: React.FC<CreatorsRosterProps> = ({ lang }) => {
  const [creators, setCreators] = useState<Creator[]>(CREATORS_DATA);
  const isAr = lang === 'ar';

  const toggleFollow = (id: string) => {
    setCreators((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isFollowing: !c.isFollowing,
              followers: c.isFollowing ? c.followers - 1 : c.followers + 1,
            }
          : c
      )
    );
  };

  return (
    <section id="creators" className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-300 text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>{isAr ? 'نخبة المصممين والمطورين' : 'Elite Creator Network'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isAr ? 'أبرز مبدعي البرومبتات في المنصة' : 'Featured Creators Roster'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              {isAr
                ? 'تابع رواد الذكاء الاصطناعي واستفد من أحدث مكتباتهم الحصرية المنشورة دورياً.'
                : 'Follow master prompt engineers and unlock their private generation workflows.'}
            </p>
          </div>
        </div>

        {/* Creators Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((creator) => {
            const isFollowing = creator.isFollowing;

            return (
              <div
                key={creator.id}
                className="group relative rounded-2xl p-6 backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between items-center text-center"
              >
                {/* Ambient Top Glow */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Avatar with Ring */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-purple-600 border-2 border-[#090A14] flex items-center justify-center text-[10px] text-white">
                    ✓
                  </span>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {creator.name}
                  </h3>
                  <div className="text-xs font-mono text-purple-400 mt-0.5">
                    {creator.handle}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 px-2">
                    {isAr ? creator.roleAr : creator.roleEn}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 w-full py-4 my-3 border-y border-white/[0.06] text-xs">
                  <div>
                    <div className="font-bold text-white font-mono">{creator.promptCount}</div>
                    <div className="text-[11px] text-slate-400">{isAr ? 'برومبت' : 'Prompts'}</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-300 font-mono">
                      {creator.followers.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400">{isAr ? 'متابع' : 'Followers'}</div>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => toggleFollow(creator.id)}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isFollowing
                      ? 'bg-purple-950/60 border border-purple-500/40 text-purple-200 hover:bg-purple-900/50'
                      : 'violet-glow-btn text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تتابعه حالياً' : 'Following'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'متابعة' : 'Follow'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
