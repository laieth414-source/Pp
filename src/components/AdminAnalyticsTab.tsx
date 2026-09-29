import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Copy,
  Sparkles,
  Layers,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Language, HubCategory, PromptItem, AdminUser } from '../types';
import { getPromptHubId } from '../data/hubsData';

interface AdminAnalyticsTabProps {
  lang: Language;
  categories: HubCategory[];
  prompts: PromptItem[];
  users?: AdminUser[];
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  lang,
  categories,
  prompts,
  users = [],
}) => {
  const isAr = lang === 'ar';
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // 1. Real KPI Aggregates strictly from Firestore state
  const activePrompts = prompts.filter((p) => p.status === 'approved');
  const activePromptsCount = activePrompts.length;
  const pendingPromptsCount = prompts.filter((p) => p.status === 'pending').length;
  const totalCopiesCount = prompts.reduce((acc, p) => acc + (p.copyCount || 0), 0);
  const creatorsCount = users.length;

  // 2. Dynamic Timeframe Chart Generation from real document timestamps
  const numDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 14;
  const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const dynamicChartData = Array.from({ length: numDays }, (_, i) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (numDays - 1 - i));
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Count prompts created on this specific day
    const dayPrompts = prompts.filter((p) => {
      if (!p.createdAt) return false;
      const d = new Date(p.createdAt);
      if (isNaN(d.getTime())) return false;
      return d >= targetDate && d < nextDate;
    });

    // Sum actual copies on this day's items
    const dayCopies = dayPrompts.reduce((acc, p) => acc + (p.copyCount || 0), 0);

    // Count new users registered on this day
    const dayUsers = users.filter((u) => {
      if (!u.joinedDate) return false;
      const d = new Date(u.joinedDate);
      if (isNaN(d.getTime())) return false;
      return d >= targetDate && d < nextDate;
    }).length;

    const weekdayLabel = isAr
      ? (numDays <= 7 ? ARABIC_WEEKDAYS[targetDate.getDay()] : targetDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'numeric' }))
      : targetDate.toLocaleDateString('en-US', { weekday: numDays <= 7 ? 'short' : undefined, day: 'numeric', month: 'numeric' });

    return {
      label: weekdayLabel,
      fullDate: targetDate.toLocaleDateString(isAr ? 'ar-SA' : 'en-US'),
      promptsCreated: dayPrompts.length,
      copies: dayCopies,
      signups: dayUsers,
      activity: dayPrompts.length + dayCopies + dayUsers,
    };
  });

  // Calculate coordinates: if 0 activity, cleanly plot at the bottom baseline (0)
  const maxActivity = Math.max(...dynamicChartData.map((d) => d.activity), 0);
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = dynamicChartData.map((d, i) => {
    const x = paddingX + (i / (dynamicChartData.length - 1)) * (svgWidth - paddingX * 2);
    // When d.activity is 0 or maxActivity is 0, y is exactly at the baseline (0 activity)
    const y =
      maxActivity === 0
        ? svgHeight - paddingY
        : svgHeight - paddingY - (d.activity / maxActivity) * (svgHeight - paddingY * 2);
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

  // Dynamic Category Breakdown Calculation strictly from real prompts
  const totalPromptsCount = prompts.length;

  const colors = [
    '#A855F7',
    '#6366F1',
    '#D946EF',
    '#EC4899',
    '#8B5CF6',
    '#06B6D4',
    '#10B981',
  ];

  const categoryStats = categories.map((cat, idx) => {
    const count = prompts.filter((p) => {
      const pCat = ((p as any).category || '').toLowerCase();
      const pCatId = ((p as any).categoryId || '').toLowerCase();
      const pHubId = (p.hubId || '').toLowerCase();
      const catId = cat.id.toLowerCase();
      const catNameAr = (cat.titleAr || '').toLowerCase();
      const catNameEn = (cat.titleEn || (cat as any).name || '').toLowerCase();

      return (
        pCatId === catId ||
        pHubId === catId ||
        pCat === catId ||
        pCat === catNameAr ||
        pCat === catNameEn ||
        getPromptHubId(p, categories) === cat.id
      );
    }).length;

    const percentage = totalPromptsCount > 0 ? Math.round((count / totalPromptsCount) * 100) : 0;

    return {
      ...cat,
      id: cat.id,
      name: isAr ? cat.titleAr : (cat.titleEn || (cat as any).name || cat.titleAr),
      count,
      percentage,
      color: colors[idx % colors.length],
    };
  });

  // Top / Most Engaged Prompt based on actual Firestore copyCount and interactions
  const mostEngagedPrompt =
    prompts.length > 0
      ? [...prompts].sort(
          (a, b) =>
            (b.copyCount || 0) * 3 + (b.likes || 0) * 2 + (b.saves || 0) -
            ((a.copyCount || 0) * 3 + (a.likes || 0) * 2 + (a.saves || 0))
        )[0]
      : null;

  return (
    <div className="space-y-6 max-w-5xl" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span>{isAr ? 'إحصائيات وتحليلات المنصة الحقيقية' : 'Live Platform Analytics'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'بيانات حية مباشرة 100% من قاعدة بيانات Firestore تتبع تفاعل المستخدمين والنسخ الفعلي.'
              : 'Direct live queries tracking real user document creations, active prompts, and copy events.'}
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
        </div>
      </div>

      {/* Top 4 Real KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Real Active Prompts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#13141c] border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-[#94a3b8] text-xs">
            <span>{isAr ? 'إجمالي البرومبتات النشطة' : 'Active Live Prompts'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{activePromptsCount.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isAr ? 'معتمد' : 'Approved'}</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isAr ? 'البرومبتات المنشورة في الصفحة العامة' : 'Currently visible in public feed'}
          </p>
        </div>

        {/* KPI 2: Real Registered Creators */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#13141c] border border-white/10 relative overflow-hidden group hover:border-violet-500/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-[#94a3b8] text-xs">
            <span>{isAr ? 'المبدعون المسجلون' : 'Registered Creators'}</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{creatorsCount.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-violet-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              <span>{isAr ? 'حقيقي' : 'Live'}</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isAr ? 'مستندات حقيقية من Firestore' : 'Live accounts in users collection'}
          </p>
        </div>

        {/* KPI 3: Real Total Copy Actions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#13141c] border border-white/10 relative overflow-hidden group hover:border-indigo-500/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-[#94a3b8] text-xs">
            <span>{isAr ? 'إجمالي عمليات النسخ' : 'Total Prompt Copies'}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalCopiesCount.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-indigo-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              <span>{isAr ? 'تفاعل مباشر' : 'Logged clicks'}</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isAr ? 'مجموع عداد copyCount للبرومبتات' : 'Aggregated copy clicks counter'}
          </p>
        </div>

        {/* KPI 4: Real Pending Review Queue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#13141c] border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-[#94a3b8] text-xs">
            <span>{isAr ? 'طلبات قيد المراجعة' : 'Pending Review'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{pendingPromptsCount.toLocaleString()}</span>
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                pendingPromptsCount > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <span>{pendingPromptsCount > 0 ? (isAr ? '⏳ بانتظار البت' : 'Action needed') : (isAr ? '✓ القائمة فارغة' : 'Clean')}</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isAr ? 'برومبتات بحالة pending' : 'Prompts waiting for admin review'}
          </p>
        </div>
      </div>

      {/* Main Growth Dynamic Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0F1020]/90 via-[#0A0B14]/90 to-[#07080E] border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'مخطط النشاط اليومي الحقيقي (Daily Activity)' : 'Real Daily Activity Chart'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'حساب ديناميكي فوري من تواريخ إنشاء البرومبتات، عمليات النسخ، وتسجيل المبدعين.'
                : 'Calculated in real-time from prompt creations, copy actions, and registrations.'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span>{isAr ? 'النشاط الكلي الفعلي' : 'Recorded Activity'}</span>
            </span>
          </div>
        </div>

        {/* Dynamic SVG Chart */}
        <div className="relative w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto min-h-[220px] max-h-[300px] overflow-visible"
          >
            <defs>
              <linearGradient id="realActivityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#6366F1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0B0C15" stopOpacity="0.0" />
              </linearGradient>

              <filter id="realGlow" x="-20%" y="-20%" width="140%" height="140%">
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
            <path d={areaPath} fill="url(#realActivityGradient)" />

            {/* Dynamic Curve Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#A855F7"
              strokeWidth="3.5"
              filter="url(#realGlow)"
              strokeLinecap="round"
            />

            {/* Interactive Points */}
            {points.map((pt, idx) => {
              const isHovered = hoveredPointIndex === idx;
              return (
                <g key={idx}>
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
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 3.5 : 2}
                    fill="#FFFFFF"
                    className="pointer-events-none"
                  />
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

          {/* Interactive Hover Tooltip */}
          {hoveredPointIndex !== null && (
            <div
              className="absolute z-20 pointer-events-none -translate-x-1/2 rounded-2xl p-3 bg-[#0E0F1E]/95 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.5)] backdrop-blur-xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: `${(points[hoveredPointIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredPointIndex].y / svgHeight) * 65}%`,
              }}
            >
              <div className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between gap-4">
                <span>{points[hoveredPointIndex].data.fullDate || points[hoveredPointIndex].data.label}</span>
                <span className="text-[10px] text-purple-400 font-mono">
                  {points[hoveredPointIndex].data.activity} {isAr ? 'إجمالي تفاعل' : 'total'}
                </span>
              </div>
              <div className="text-[11px] text-purple-300 font-mono flex items-center justify-between gap-3">
                <span>{isAr ? 'برومبتات جديدة:' : 'New prompts:'}</span>
                <strong>{points[hoveredPointIndex].data.promptsCreated}</strong>
              </div>
              <div className="text-[11px] text-indigo-300 font-mono flex items-center justify-between gap-3">
                <span>{isAr ? 'عمليات نسخ:' : 'Copy events:'}</span>
                <strong>{points[hoveredPointIndex].data.copies}</strong>
              </div>
              <div className="text-[11px] text-cyan-300 font-mono flex items-center justify-between gap-3">
                <span>{isAr ? 'مبدعون جدد:' : 'New signups:'}</span>
                <strong>{points[hoveredPointIndex].data.signups}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Category Distribution Breakdown + Most Engaged Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Category Breakdown */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'توزيع البرومبتات حسب الأقسام' : 'Category Distribution'}</span>
            </h3>
            <span className="text-xs font-mono text-purple-300">
              {totalPromptsCount} {isAr ? 'برومبت مسجل' : 'prompts'}
            </span>
          </div>

          {/* Stacked Percentage Bar */}
          <div className="h-3 w-full rounded-full bg-white/[0.05] overflow-hidden flex gap-0.5">
            {totalPromptsCount > 0 && categoryStats.some((cat) => cat.count > 0) ? (
              categoryStats.map((cat) =>
                cat.percentage > 0 ? (
                  <div
                    key={cat.id}
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all hover:brightness-125"
                    title={`${cat.name}: ${cat.count} (${cat.percentage}%)`}
                  />
                ) : null
              )
            ) : (
              <div className="w-full h-full bg-white/[0.03]" />
            )}
          </div>

          {/* Category List */}
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

        {/* Most Engaged Prompt */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'البرومبت الأكثر نسخاً وتفاعلاً' : 'Most Copied & Engaged'}</span>
            </h3>

            {mostEngagedPrompt ? (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  {mostEngagedPrompt.imageUrl ? (
                    <img
                      src={mostEngagedPrompt.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                      ✨
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">
                      {isAr ? mostEngagedPrompt.titleAr : mostEngagedPrompt.titleEn}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {mostEngagedPrompt.model}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono line-clamp-3 leading-relaxed break-words bg-black/40 p-2.5 rounded-xl border border-white/5">
                  {mostEngagedPrompt.promptText}
                </p>

                <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400">
                  <span className="flex items-center gap-1 text-indigo-400">
                    <Copy className="w-3.5 h-3.5" />
                    <strong>{mostEngagedPrompt.copyCount || 0} {isAr ? 'نسخة' : 'copies'}</strong>
                  </span>
                  <span>❤️ {mostEngagedPrompt.likes || 0}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[#0e1017] border border-white/10 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'لا توجد برومبتات مضافة حالياً. ابدأ بإضافة أول برومبت الآن!'
                    : 'No prompts added yet. Start by adding your first prompt now!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
