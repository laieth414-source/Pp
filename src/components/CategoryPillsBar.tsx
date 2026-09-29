import React from 'react';
import { Language } from '../types';

export type CategoryPillId =
  | 'all'
  | 'بورتريه ووجوه'
  | 'سينمائي ودرامي'
  | 'أنمي وفانتازيا'
  | 'تصميم تجاري'
  | 'شخصيات 3D'
  | 'سايبربانك وخيال علمي'
  | 'برمجة وكود'
  | string;

interface CategoryPillsBarProps {
  lang: Language;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  counts?: Record<string, number>;
}

export const CategoryPillsBar: React.FC<CategoryPillsBarProps> = ({
  lang,
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  const isAr = lang === 'ar';

  const categories: Array<{ id: string; labelAr: string; labelEn: string }> = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'بورتريه ووجوه', labelAr: 'بورتريه ووجوه', labelEn: 'Portrait & Faces' },
    { id: 'سينمائي ودرامي', labelAr: 'سينمائي ودرامي', labelEn: 'Cinematic & Drama' },
    { id: 'أنمي وفانتازيا', labelAr: 'أنمي وفانتازيا', labelEn: 'Anime & Fantasy' },
    { id: 'تصميم تجاري', labelAr: 'تصميم تجاري', labelEn: 'Commercial Design' },
    { id: 'شخصيات 3D', labelAr: 'شخصيات 3D', labelEn: '3D Characters' },
    { id: 'سايبربانك وخيال علمي', labelAr: 'سايبربانك وخيال علمي', labelEn: 'Cyberpunk & Sci-Fi' },
    { id: 'برمجة وكود', labelAr: 'برمجة وكود', labelEn: 'Code & Dev' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-5">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 justify-start sm:justify-center">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = counts?.[cat.id];

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? 'bg-violet-600 text-white border border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                  : 'bg-[#10121a] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              {typeof count === 'number' && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
