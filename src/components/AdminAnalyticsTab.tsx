import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Copy,
  Eye,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Flame,
  Award,
} from 'lucide-react';
import { Language, HubCategory, PromptItem } from '../types';
import { getPromptHubId } from '../data/hubsData';

interface AdminAnalyticsTabProps {
  lang: Language;
  categories: HubCategory[];
  prompts: PromptItem[];
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  lang,
  categories,
  prompts,
}) => {
  const isAr = lang === 'ar';
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Growth Data Mock Sets
  const chartDatasets = {
    '7d': [
      { label: isAr ? 'السبت' : 'Sat', visitors: 4200, signups: 320, copies: 1120 },
      { label: isAr ? 'الأحد' : 'Sun', visitors: 5600, signups: 410, copies: 1450 },
      { label: isAr ? 'الإثنين' : 'Mon', visitors: 6800, signups: 530, copies: 1820 },
      { label: isAr ? 'الثلاثاء' : 'Tue', visitors: 7400, signups: 620, copies: 2100 },
      { label: isAr ? 'الأربعاء' : 'Wed', visitors: 8900, signups: 740, copies: 2650 },
      { label: isAr ? 'الخميس' : 'Thu', visitors: 11200, signups: 980, copies: 3410 },
      { label: isAr ? 'الجمعة' : 'Fri', visitors: 13500, signups: 1250, copies: 4190 },
    ],
    '30d': [
      { label: isAr ? 'أسبوع ١' : 'W1', visitors: 28000, signups: 2200, copies: 7900 },
      { label: isAr ? 'أسبوع ٢' : 'W2', visitors: 36000, signups: 3100, copies: 10400 },
      { label: isAr ? 'أسبوع ٣' : 'W3', visitors: 44000, signups: 3900, copies: 13200 },
      { label: isAr ? 'أسبوع ٤' : 'W4', visitors: 58000, signups: 5100, copies: 18500 },
    ],
    'all': [
      { label: isAr ? 'يناير' : 'Jan', visitors: 45000, signups: 4200, copies: 14000 },
      { label: isAr ? 'فبراير' : 'Feb', visitors: 72000, signups: 6800, copies: 24000 },
      { label: isAr ? 'مارس' : 'Mar', visitors: 124000, signups: 11500, copies: 42000 },
    ],
  };

  const currentData = chartDatasets[timeframe];

  // Dynamic Category Breakdown Calculation
  const totalPrompts = prompts.length || 1;
  const categoryStats = categories.map((cat, idx) => {
    const count = prompts.filter((p) => getPromptHubId(p, categories) === cat.id).length;
    const percentage = Math.round((count / totalPrompts) * 100) || 0;
    const colors = [
      '#A855F7', // purple
      '#6366F1', // indigo
      '#D946EF', // fuchsia
      '#EC4899', // pink
      '#8B5CF6', // violet
      '#06B6D4', // cyan
      '#10B981', // emerald
    ];
    return {
      id: cat.id,
      name: isAr ? cat.titleAr : (cat.titleEn || cat.titleAr),
      count,
      percentage,
      color: colors[idx % colors.length],
    };
  });

  // Calculate Most Engaged Prompt
  const mostEngagedPrompt = [...prompts].sort(
    (a, b) => b.likes + b.saves * 2 - (a.likes + a.saves * 2)
  )[0] || prompts[0];

  // Calculate SVG curve coordinates for Visitors Growth
  const maxVisitors = Math.max(...currentData.map((d) => d.visitors));
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = currentData.map((d, i) => {
    const x = paddingX + (i / (currentData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.visitors / maxVisitors) * (svgHeight - paddingY * 2);
    return { x, y, data: d };
  });

  // Build SVG Path string
  const linePath = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="space-y-6 max-w-5xl" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span>{isAr ? 'الإحصائيات والتحليلات المتقدمة' : 'Advanced Analytics & Metrics'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'متابعة حية لتفاعل المستخدمين، معدلات نسخ البرومبتات، وتوزيع المحتوى عبر الأقسام.'
              : 'Real-time telemetry tracking visitor growth, prompt engagement, and hub distributions.'}
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === '7d'
                ? 'bg-purple-600/40 border border-purple-500/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'آخر ٧ أيام' : '7 Days'}
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === '30d'
                ? 'bg-purple-600/40 border border-purple-500/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'آخر ٣٠ يوماً' : '30 Days'}
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === 'all'
                ? 'bg-purple-600/40 border border-purple-500/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'منذ الإطلاق' : 'All-time'}
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Average Prompts Copied per Day */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'معدل النسخ اليومي' : 'Avg. Copied / Day'}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">١,٨٤٠</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              <span>+٢٤٪</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isAr ? 'مقارنة بالأسبوع المنصرم' : 'vs previous period'}
          </p>
        </div>

        {/* KPI 2: Total Platform Visitors */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'إجمالي الزيارات' : 'Total Visits'}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">٩٤,٥٢٠</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              <span>+٣١٪</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isAr ? 'زوار نشطون من ٤٢ دولة' : 'across 42 countries'}
          </p>
        </div>

        {/* KPI 3: Registered Community Creators */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-fuchsia-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'المبدعون المسجلون' : 'Verified Creators'}</span>
            <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">١,٢٨٠</span>
            <span className="text-[11px] font-semibold text-purple-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              <span>+١٢٪</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isAr ? 'صناع برومبتات معتمدون' : 'active community members'}
          </p>
        </div>

        {/* KPI 4: Total Verified Prompts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-pink-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'إجمالي البرومبتات النشطة' : 'Active Prompts'}</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{prompts.length}</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              <span>+٦ هذا الأسبوع</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isAr ? `موزعة على ${categories.length} أقسام` : `across ${categories.length} hubs`}
          </p>
        </div>

      </div>

      {/* Main Growth Line Chart: نمو الزوار والمسجلين الجدد */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0F1020]/90 via-[#0A0B14]/90 to-[#07080E] border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'نمو الزوار والمسجلين الجدد (Visitor & Signup Growth)' : 'Visitor & Signup Growth'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'حرك المؤشر فوق النقاط لعرض التفاصيل اليومية' : 'Hover over points for daily breakdown'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span>{isAr ? 'الزيارات اليومية' : 'Daily Visitors'}</span>
            </span>
            <span className="flex items-center gap-1.5 text-indigo-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span>{isAr ? 'المسجلون الجدد' : 'New Signups'}</span>
            </span>
          </div>
        </div>

        {/* Interactive SVG Chart Container */}
        <div className="relative w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto min-h-[220px] max-h-[300px] overflow-visible"
          >
            <defs>
              <linearGradient id="violetAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#6366F1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0B0C15" stopOpacity="0.0" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#violetAreaGradient)" />

            {/* Glowing Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#A855F7"
              strokeWidth="3.5"
              filter="url(#glow)"
              strokeLinecap="round"
            />

            {/* Interactive Points */}
            {points.map((pt, idx) => {
              const isHovered = hoveredPointIndex === idx;
              return (
                <g key={idx}>
                  {/* Point Outer Ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 8 : 5}
                    fill="#121026"
                    stroke="#C084FC"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />

                  {/* Point Center Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 3.5 : 2}
                    fill="#FFFFFF"
                    className="pointer-events-none"
                  />

                  {/* X-Axis Label */}
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill={isHovered ? '#FFFFFF' : '#94A3B8'}
                    fontSize="11"
                    fontFamily="inherit"
                    className="select-none"
                  >
                    {pt.data.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip Card */}
          {hoveredPointIndex !== null && (
            <div
              className="absolute z-20 pointer-events-none -translate-x-1/2 rounded-2xl p-3 bg-[#0E0F1E]/95 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.5)] backdrop-blur-xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: `${(points[hoveredPointIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredPointIndex].y / svgHeight) * 70}%`,
              }}
            >
              <div className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between gap-4">
                <span>{points[hoveredPointIndex].data.label}</span>
                <span className="text-[10px] text-purple-400 font-mono">
                  {points[hoveredPointIndex].data.copies} {isAr ? 'نسخ' : 'copies'}
                </span>
              </div>
              <div className="text-[11px] text-purple-300 font-mono flex items-center justify-between gap-3">
                <span>{isAr ? 'الزوار:' : 'Visitors:'}</span>
                <strong>{points[hoveredPointIndex].data.visitors.toLocaleString()}</strong>
              </div>
              <div className="text-[11px] text-indigo-300 font-mono flex items-center justify-between gap-3">
                <span>{isAr ? 'المسجلون:' : 'Signups:'}</span>
                <strong>+{points[hoveredPointIndex].data.signups}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Category Distribution Breakdown + Most Engaged Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Category Breakdown (Donut + Progress Bars) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'توزيع البرومبتات حسب الأقسام (Category Breakdown)' : 'Category Distribution'}</span>
            </h3>
            <span className="text-xs font-mono text-purple-300">
              {totalPrompts} {isAr ? 'برومبت مسجل' : 'prompts'}
            </span>
          </div>

          {/* Stacked Percentage Bar */}
          <div className="h-3 w-full rounded-full bg-white/[0.05] overflow-hidden flex gap-0.5">
            {categoryStats.map((cat) => (
              <div
                key={cat.id}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all hover:brightness-125"
                title={`${cat.name}: ${cat.count} (${cat.percentage}%)`}
              />
            ))}
          </div>

          {/* Individual Category List */}
          <div className="space-y-2.5 pt-2">
            {categoryStats.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-200 font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400">
                    {cat.count} {isAr ? 'برومبت' : 'prompts'}
                  </span>
                  <span className="font-bold text-white w-10 text-left rtl:text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Engaged Prompt Highlight Card */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-violet-950/20 to-[#0A0B14] border border-purple-500/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{isAr ? 'البرومبت الأكثر تفاعلاً هذا الأسبوع' : 'Top Prompt of the Week'}</span>
              </span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>

            {mostEngagedPrompt ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  {mostEngagedPrompt.imageUrl ? (
                    <img
                      src={mostEngagedPrompt.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover border border-purple-500/40 shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xl">
                      ⭐
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {isAr ? mostEngagedPrompt.titleAr : mostEngagedPrompt.titleEn}
                    </h4>
                    <span className="text-[11px] font-mono text-purple-300">
                      {mostEngagedPrompt.model}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300/80 font-mono line-clamp-3 bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                  {mostEngagedPrompt.promptText}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
                  <span>❤️ {mostEngagedPrompt.likes} {isAr ? 'إعجاب' : 'likes'}</span>
                  <span>🔖 {mostEngagedPrompt.saves} {isAr ? 'حفظ' : 'saves'}</span>
                  <span className="text-emerald-400 font-bold">٩٩.٤٪ رضا</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-3 border-t border-white/[0.08] text-[11px] text-slate-400">
            {isAr
              ? 'يتم تحديث ترشيحات النخبة تلقائياً بالاعتماد على خوارزمية قياس النسخ والنقرات.'
              : 'Ranked automatically based on algorithmic save-to-copy ratio.'}
          </div>
        </div>

      </div>

    </div>
  );
};
