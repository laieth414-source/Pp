import React, { useState } from 'react';
import {
  X,
  Settings,
  Paintbrush,
  FileText,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  Eye,
  RotateCcw,
  Download,
  Upload,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Megaphone,
  BarChart3,
  Users,
  LogOut,
} from 'lucide-react';
import {
  Language,
  SiteSettings,
  HubCategory,
  PromptItem,
  AdminUser,
} from '../types';
import { DEFAULT_SITE_SETTINGS } from '../data/defaultSettings';
import { CATEGORY_HUBS } from '../data/hubsData';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import { AdminUsersTab } from './AdminUsersTab';

interface AdminDashboardProps {
  isOpen: boolean;
  lang: Language;
  siteSettings: SiteSettings;
  categories: HubCategory[];
  prompts: PromptItem[];
  users: AdminUser[];
  onClose: () => void;
  onLogout: () => void;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
  onUpdateCategories: (categories: HubCategory[]) => void;
  onUpdatePrompts: (prompts: PromptItem[]) => void;
  onUpdateUsers: (users: AdminUser[]) => void;
  onResetAllDefaults: () => void;
  onTriggerToast: (msg: string) => void;
}

type AdminTab = 'branding' | 'homepage' | 'categories' | 'prompts' | 'analytics' | 'users';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  lang,
  siteSettings,
  categories,
  prompts,
  users,
  onClose,
  onLogout,
  onUpdateSiteSettings,
  onUpdateCategories,
  onUpdatePrompts,
  onUpdateUsers,
  onResetAllDefaults,
  onTriggerToast,
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<AdminTab>('branding');

  // Local state copy for instant editing
  const [settings, setSettings] = useState<SiteSettings>(siteSettings);

  // Category editing state
  const [editingCategory, setEditingCategory] = useState<HubCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<HubCategory>>({
    id: '',
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    iconName: 'Sparkles',
  });

  // Prompt editing state
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [promptSearch, setPromptSearch] = useState('');
  const [promptCategoryFilter, setPromptCategoryFilter] = useState('all');

  // Handle setting updates with real-time live binding
  const handleSettingChange = (
    section: keyof SiteSettings,
    field: string,
    value: any
  ) => {
    const updated = {
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    };
    setSettings(updated);
    onUpdateSiteSettings(updated);
  };

  // Categories CRUD
  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.titleAr?.trim()) {
      onTriggerToast(isAr ? 'يرجى كتابة اسم القسم بالعربية' : 'Please provide category name');
      return;
    }
    const slug =
      newCategory.id?.trim().toLowerCase().replace(/\s+/g, '-') ||
      `cat-${Date.now()}`;

    const created: HubCategory = {
      id: slug,
      titleAr: newCategory.titleAr.trim(),
      titleEn: newCategory.titleEn?.trim() || newCategory.titleAr.trim(),
      descriptionAr: newCategory.descriptionAr?.trim() || '',
      descriptionEn: newCategory.descriptionEn?.trim() || '',
      iconName: newCategory.iconName?.trim() || 'Sparkles',
      gradient: 'from-purple-900/40 via-violet-950/20 to-transparent',
      accentBorder: 'group-hover:border-purple-500/50',
      accentGlow: 'rgba(168, 85, 247, 0.4)',
    };

    const updatedCategories = [...categories, created];
    onUpdateCategories(updatedCategories);
    setIsAddingCategory(false);
    setNewCategory({
      id: '',
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      iconName: 'Sparkles',
    });
    onTriggerToast(isAr ? 'تمت إضافة القسم الجديد بنجاح! ✓' : 'New category created successfully! ✓');
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const updated = categories.map((cat) =>
      cat.id === editingCategory.id ? editingCategory : cat
    );
    onUpdateCategories(updated);
    setEditingCategory(null);
    onTriggerToast(isAr ? 'تم تحديث بيانات القسم بنجاح! ✓' : 'Category updated! ✓');
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      onTriggerToast(isAr ? 'لا يمكن حذف كافة الأقسام، يجب إبقاء قسم واحد على الأقل' : 'Cannot delete the only remaining category');
      return;
    }
    const updated = categories.filter((c) => c.id !== catId);
    onUpdateCategories(updated);
    onTriggerToast(isAr ? 'تم حذف القسم بنجاح' : 'Category deleted');
  };

  // Prompts CRUD & Moderation
  const handleToggleFeatured = (promptId: string) => {
    const updated = prompts.map((p) => {
      if (p.id === promptId) {
        const next = !p.featured;
        onTriggerToast(
          next
            ? (isAr ? 'تم تثبيت البرومبت كمميز في الصدارة ⭐' : 'Prompt pinned as featured ⭐')
            : (isAr ? 'تم إلغاء التثبيت المميز' : 'Prompt unpinned')
        );
        return { ...p, featured: next };
      }
      return p;
    });
    onUpdatePrompts(updated);
  };

  const handleDeletePrompt = (promptId: string) => {
    const updated = prompts.filter((p) => p.id !== promptId);
    onUpdatePrompts(updated);
    onTriggerToast(isAr ? 'تم حذف البرومبت نهائياً' : 'Prompt deleted');
  };

  const handleSavePromptEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt) return;
    const updated = prompts.map((p) =>
      p.id === editingPrompt.id ? editingPrompt : p
    );
    onUpdatePrompts(updated);
    setEditingPrompt(null);
    onTriggerToast(isAr ? 'تم حفظ تعديلات البرومبت بنجاح! ✓' : 'Prompt edits saved! ✓');
  };

  // Export / Import Config
  const handleExportConfig = () => {
    const backup = {
      siteSettings,
      categories,
      prompts,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sawihaa-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onTriggerToast(isAr ? 'تم تصدير نسخة احتياطية كاملة بنجاح 💾' : 'Backup exported! 💾');
  };

  // Filter prompts for moderation tab
  const filteredPrompts = prompts.filter((p) => {
    if (promptCategoryFilter !== 'all' && p.hubId !== promptCategoryFilter) {
      return false;
    }
    if (promptSearch.trim()) {
      const q = promptSearch.toLowerCase();
      const match =
        p.titleAr?.toLowerCase().includes(q) ||
        p.titleEn?.toLowerCase().includes(q) ||
        p.promptText?.toLowerCase().includes(q) ||
        p.model?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <header className="h-16 px-3 sm:px-6 border-b border-white/10 bg-[#090A14] flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] shrink-0">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-black text-white flex items-center gap-1.5 truncate">
              <span className="truncate">{isAr ? 'لوحة التحكم (CMS)' : 'Master CMS Admin'}</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isAr ? 'ربط فوري' : 'Live'}</span>
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden lg:block truncate">
              {isAr
                ? 'تحكم بنسبة 100% بكافة عناصر المنصة: الهوية، النصوص، الأقسام، والبرومبتات.'
                : 'Full direct control over branding, content, directory hubs, and prompt moderation.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Export button */}
          <button
            onClick={handleExportConfig}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            title={isAr ? 'تصدير نسخة احتياطية' : 'Export JSON Backup'}
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">{isAr ? 'تصدير JSON' : 'Export'}</span>
          </button>

          {/* Reset Defaults button */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  isAr
                    ? 'هل أنت متأكد من استعادة كافة الإعدادات والنصوص الافتراضية؟'
                    : 'Are you sure you want to reset all site settings to default?'
                )
              ) {
                onResetAllDefaults();
                setSettings(DEFAULT_SITE_SETTINGS);
              }
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 transition-all text-xs flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            title={isAr ? 'إعادة ضبط للافتراضي' : 'Reset to Defaults'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAr ? 'استعادة' : 'Reset'}</span>
          </button>

          {/* Close / Return to Live Preview button */}
          <button
            onClick={onClose}
            className="violet-glow-btn px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 min-h-[38px]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'معاينة المنصة' : 'Live Preview'}</span>
          </button>

          {/* Dedicated Admin Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            title={isAr ? 'تسجيل خروج الإدارة وقفل اللوحة' : 'Logout & Lock Admin'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAr ? 'تسجيل خروج' : 'Logout'}</span>
          </button>
        </div>
      </header>

      {/* Main Body: Tabs Navigation & Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Navigation Tabs (Sidebar on desktop, smooth horizontal-scrolling chip bar on mobile) */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#07080F]/95 p-2 sm:p-3 md:p-4 shrink-0 flex md:flex-col items-center md:items-stretch gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-2 px-2">
          
          <button
            onClick={() => setActiveTab('branding')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'branding'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <Paintbrush className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{isAr ? 'الهوية والعلامة التجارية' : 'Branding & Identity'}</span>
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'homepage'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{isAr ? 'نصوص الواجهة والصفحة' : 'Homepage Text CMS'}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-fuchsia-400 shrink-0" />
            <div className="flex items-center justify-between w-full gap-2">
              <span>{isAr ? 'إدارة الأقسام (CRUD)' : 'Categories Hubs'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                {categories.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'prompts'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
            <div className="flex items-center justify-between w-full gap-2">
              <span>{isAr ? 'إدارة البرومبتات' : 'Prompts Moderation'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                {prompts.length}
              </span>
            </div>
          </button>

          {/* TAB 5: ANALYTICS & CHARTS BUTTON */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex items-center justify-between w-full gap-2">
              <span>{isAr ? 'الإحصائيات والتحليلات' : 'Analytics & Charts'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE
              </span>
            </div>
          </button>

          {/* TAB 6: USERS MANAGEMENT BUTTON */}
          <button
            onClick={() => setActiveTab('users')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex items-center justify-between w-full gap-2">
              <span>{isAr ? 'المستخدمون والمسجلون' : 'Users Management'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                {users?.length || 0}
              </span>
            </div>
          </button>

          {/* Lock / Logout inside sidebar for desktop */}
          <div className="mt-auto pt-4 border-t border-white/10 hidden md:block">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{isAr ? 'قفل لوحة الإدارة' : 'Lock Admin Panel'}</span>
            </button>
          </div>

        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {/* TAB 1: BRANDING & IDENTITY */}
          {activeTab === 'branding' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Paintbrush className="w-5 h-5 text-purple-400" />
                  <span>{isAr ? 'الهوية والعلامة التجارية (Branding & Identity)' : 'Branding & Identity Settings'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? 'يتم تحديث اسم وشعار وهوية المنصة في كامل الواجهة تلقائياً وبشكل حي.'
                    : 'Changes here instantly update header logo, footer titles, and browser branding.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* اسم المنصة الرئيسي */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {isAr ? 'اسم المنصة (Site Name)' : 'Site Name'}
                  </label>
                  <input
                    type="text"
                    value={settings.branding.siteName}
                    onChange={(e) => handleSettingChange('branding', 'siteName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* نص اللوغو البديل */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {isAr ? 'نص اللوغو المعروض (Logo Text)' : 'Logo Display Text'}
                  </label>
                  <input
                    type="text"
                    value={settings.branding.logoText}
                    onChange={(e) => handleSettingChange('branding', 'logoText', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* الشعار الفرعي */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {isAr ? 'الشعار الفرعي للمنصة (Slogan / Tagline)' : 'Slogan / Tagline'}
                  </label>
                  <input
                    type="text"
                    value={settings.branding.slogan}
                    onChange={(e) => handleSettingChange('branding', 'slogan', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* رابط صورة اللوغو (مع معاينة فورية) */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {isAr ? 'رابط صورة اللوغو (اختياري - Logo Image URL)' : 'Logo Image URL (Optional)'}
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      value={settings.branding.logoImage}
                      onChange={(e) => handleSettingChange('branding', 'logoImage', e.target.value)}
                      placeholder="https://... (PNG / SVG)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-sm text-white focus:outline-none transition-colors"
                    />
                    {settings.branding.logoImage && (
                      <button
                        type="button"
                        onClick={() => handleSettingChange('branding', 'logoImage', '')}
                        className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs border border-rose-500/20"
                      >
                        {isAr ? 'حذف الصورة' : 'Remove'}
                      </button>
                    )}
                  </div>

                  {/* Logo Live Preview */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-400">{isAr ? 'المعاينة الفورية:' : 'Live Preview:'}</span>
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#0B0C15] border border-white/10">
                      {settings.branding.logoImage ? (
                        <img
                          src={settings.branding.logoImage}
                          alt="Logo Preview"
                          className="w-9 h-9 rounded-xl object-contain border border-purple-500/40"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <span className="text-base font-black text-white">
                          {settings.branding.logoText || settings.branding.siteName}
                        </span>
                        <span className="text-[10px] text-slate-400 block -mt-0.5">
                          {settings.branding.slogan}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: HOMEPAGE TEXT CMS */}
          {activeTab === 'homepage' && (
            <div className="max-w-4xl space-y-8">
              
              {/* Announcement Bar Section */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isAr ? 'شريط الإعلانات العلوي (Announcement Bar)' : 'Announcement Bar'}
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.announcement.isEnabled}
                      onChange={(e) => handleSettingChange('announcement', 'isEnabled', e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-transparent border-white/20"
                    />
                    <span className="text-xs text-purple-300 font-semibold">
                      {settings.announcement.isEnabled
                        ? (isAr ? 'مفعل ومضاء' : 'Enabled')
                        : (isAr ? 'معطل' : 'Disabled')}
                    </span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {isAr ? 'نص الإعلان' : 'Announcement Text'}
                  </label>
                  <input
                    type="text"
                    value={settings.announcement.text}
                    onChange={(e) => handleSettingChange('announcement', 'text', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Hero Section Texts */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{isAr ? 'نصوص قسم الهيرو (Hero Section Texts)' : 'Hero Section Texts'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* الشارة الترحيبية */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'الشارة الترحيبية (Badge)' : 'Top Badge Text'}
                    </label>
                    <input
                      type="text"
                      value={settings.hero.badge}
                      onChange={(e) => handleSettingChange('hero', 'badge', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* العنوان الرئيسي */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'العنوان العريض (Main Title)' : 'Main Title'}
                    </label>
                    <input
                      type="text"
                      value={settings.hero.title}
                      onChange={(e) => handleSettingChange('hero', 'title', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-sm text-white focus:outline-none"
                    />
                  </div>

                  {/* الكلمة البارزة المتوهجة */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'الكلمة المتوهجة الملونة (Gradient Highlight)' : 'Gradient Highlight Text'}
                    </label>
                    <input
                      type="text"
                      value={settings.hero.titleHighlight}
                      onChange={(e) => handleSettingChange('hero', 'titleHighlight', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-sm text-white focus:outline-none"
                    />
                  </div>

                  {/* الوصف الفرعي */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'الوصف الفرعي (Subtitle)' : 'Subtitle'}
                    </label>
                    <textarea
                      rows={2}
                      value={settings.hero.subtitle}
                      onChange={(e) => handleSettingChange('hero', 'subtitle', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* نص البحث الافتراضي */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'نص البحث الافتراضي (Search Placeholder)' : 'Search Placeholder'}
                    </label>
                    <input
                      type="text"
                      value={settings.hero.searchPlaceholder}
                      onChange={(e) => handleSettingChange('hero', 'searchPlaceholder', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* زر الاستكشاف */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'نص زر الاستكشاف' : 'Explore Button Label'}
                    </label>
                    <input
                      type="text"
                      value={settings.hero.exploreBtnText}
                      onChange={(e) => handleSettingChange('hero', 'exploreBtnText', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* زر كيف تعمل */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'نص زر كيف تعمل' : 'How It Works Button Label'}
                    </label>
                    <input
                      type="text"
                      value={settings.hero.howItWorksBtnText}
                      onChange={(e) => handleSettingChange('hero', 'howItWorksBtnText', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Section Texts */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>{isAr ? 'نصوص الفوتر (Footer Texts)' : 'Footer Texts'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* نبذة الفوتر */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'نبذة عن المنصة (About Text)' : 'About / Mission Statement'}
                    </label>
                    <input
                      type="text"
                      value={settings.footer.aboutText}
                      onChange={(e) => handleSettingChange('footer', 'aboutText', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* رسالة الحقوق */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'رسالة الحقوق (Copyright Notice)' : 'Copyright Notice'}
                    </label>
                    <input
                      type="text"
                      value={settings.footer.copyright}
                      onChange={(e) => handleSettingChange('footer', 'copyright', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-purple-500 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CATEGORIES CRUD */}
          {activeTab === 'categories' && (
            <div className="max-w-4xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-fuchsia-400" />
                    <span>{isAr ? 'إدارة الأقسام الشاملة (Categories CRUD)' : 'Categories Hubs Management'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr
                      ? 'يمكنك إضافة أقسام جديدة، تعديل بياناتها وأيقوناتها، أو حذفها فورا.'
                      : 'Create, update, or remove domain-specific directory categories.'}
                  </p>
                </div>

                {!isAddingCategory && !editingCategory && (
                  <button
                    onClick={() => setIsAddingCategory(true)}
                    className="violet-glow-btn px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة قسم جديد' : 'New Category'}</span>
                  </button>
                )}
              </div>

              {/* Form: Add New Category */}
              {isAddingCategory && (
                <form
                  onSubmit={handleSaveNewCategory}
                  className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-purple-400" />
                      <span>{isAr ? 'إنشاء قسم جديد' : 'Create New Category'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'معرف القسم (Slug / ID)' : 'Category Slug'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. logos-icons"
                        value={newCategory.id}
                        onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'الأيقونة أو الإيموجي (Emoji or Icon)' : 'Icon or Emoji'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 🎨 or Sparkles, Film, User, Code..."
                        value={newCategory.iconName}
                        onChange={(e) => setNewCategory({ ...newCategory, iconName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'اسم القسم بالعربية' : 'Title (Arabic)'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: شعارات وأيقونات تجارية"
                        value={newCategory.titleAr}
                        onChange={(e) => setNewCategory({ ...newCategory, titleAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'اسم القسم بالإنجليزية' : 'Title (English)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Logos & Branding"
                        value={newCategory.titleEn}
                        onChange={(e) => setNewCategory({ ...newCategory, titleEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'وصف القسم بالعربية' : 'Description (Arabic)'}
                      </label>
                      <input
                        type="text"
                        placeholder="نبذة مختصرة عن برومبتات هذا القسم..."
                        value={newCategory.descriptionAr}
                        onChange={(e) => setNewCategory({ ...newCategory, descriptionAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.04]"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="violet-glow-btn px-5 py-2 rounded-xl text-xs font-semibold text-white"
                    >
                      {isAr ? 'إنشاء وحفظ القسم' : 'Create Category'}
                    </button>
                  </div>
                </form>
              )}

              {/* Form: Edit Existing Category */}
              {editingCategory && (
                <form
                  onSubmit={handleUpdateCategory}
                  className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-indigo-400" />
                      <span>{isAr ? `تعديل قسم: ${editingCategory.titleAr}` : `Edit: ${editingCategory.titleEn || editingCategory.titleAr}`}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'اسم القسم بالعربية' : 'Title (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={editingCategory.titleAr}
                        onChange={(e) => setEditingCategory({ ...editingCategory, titleAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'الأيقونة أو الإيموجي' : 'Icon / Emoji'}
                      </label>
                      <input
                        type="text"
                        value={editingCategory.iconName}
                        onChange={(e) => setEditingCategory({ ...editingCategory, iconName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'الوصف بالعربية' : 'Description (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={editingCategory.descriptionAr}
                        onChange={(e) => setEditingCategory({ ...editingCategory, descriptionAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.04]"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="violet-glow-btn px-5 py-2 rounded-xl text-xs font-semibold text-white"
                    >
                      {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Categories List Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const promptCount = prompts.filter((p) => p.hubId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-500/40 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.iconName || '📁'}</span>
                          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                            {isAr ? cat.titleAr : (cat.titleEn || cat.titleAr)}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {isAr ? cat.descriptionAr : (cat.descriptionEn || cat.descriptionAr)}
                        </p>
                        <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-purple-300">
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                            {promptCount} {isAr ? 'برومبت' : 'prompts'}
                          </span>
                          <span className="text-slate-500 font-sans">ID: {cat.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(isAr ? `هل أنت متأكد من حذف قسم "${cat.titleAr}"؟` : `Delete category "${cat.titleAr}"?`)) {
                              handleDeleteCategory(cat.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 4: PROMPTS MODERATION */}
          {activeTab === 'prompts' && (
            <div className="max-w-5xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    <span>{isAr ? 'إدارة وتعديل البرومبتات (Prompts Moderation)' : 'Prompts Moderation & Pins'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr
                      ? 'تعديل أي برومبت، تغيير القسم، تثبيت كمميز في الصدارة ⭐، أو الحذف النهائي.'
                      : 'Moderate all prompts, toggle featured pins, edit text, or remove.'}
                  </p>
                </div>
              </div>

              {/* Filters & Search row */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isAr ? 'ابحث في البرومبتات...' : 'Search prompts...'}
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    className="w-full px-9 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  {promptSearch && (
                    <button
                      onClick={() => setPromptSearch('')}
                      className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setPromptCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      promptCategoryFilter === 'all'
                        ? 'bg-purple-600/30 border border-purple-500 text-purple-200'
                        : 'bg-white/[0.03] border border-white/[0.06] text-slate-400'
                    }`}
                  >
                    {isAr ? 'كافة الأقسام' : 'All Hubs'}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setPromptCategoryFilter(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                        promptCategoryFilter === c.id
                          ? 'bg-purple-600/30 border border-purple-500 text-purple-200'
                          : 'bg-white/[0.03] border border-white/[0.06] text-slate-400'
                      }`}
                    >
                      {isAr ? c.titleAr : (c.titleEn || c.titleAr)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Prompt Form Modal / Drawer */}
              {editingPrompt && (
                <form
                  onSubmit={handleSavePromptEdit}
                  className="p-5 rounded-2xl bg-[#0E0F1E] border border-purple-500/50 space-y-4 shadow-2xl animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-purple-400" />
                      <span>{isAr ? 'تعديل بيانات البرومبت' : 'Edit Prompt Details'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingPrompt(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'عنوان البرومبت' : 'Title'}
                      </label>
                      <input
                        type="text"
                        value={editingPrompt.titleAr}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, titleAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'نص البرومبت الكامل' : 'Prompt Text'}
                      </label>
                      <textarea
                        rows={3}
                        value={editingPrompt.promptText}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, promptText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'القسم التابع له' : 'Category Hub'}
                      </label>
                      <select
                        value={editingPrompt.hubId || 'portrait'}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, hubId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#141523] border border-white/10 text-xs text-white cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {isAr ? c.titleAr : (c.titleEn || c.titleAr)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'النموذج / الأداة' : 'Model'}
                      </label>
                      <input
                        type="text"
                        value={editingPrompt.model}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, model: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'رابط الصورة المعاينة' : 'Image URL'}
                      </label>
                      <input
                        type="url"
                        value={editingPrompt.imageUrl || ''}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPrompt(null)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.04]"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="violet-glow-btn px-5 py-2 rounded-xl text-xs font-semibold text-white"
                    >
                      {isAr ? 'حفظ تعديلات البرومبت' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Prompts Table / List */}
              <div className="space-y-3 w-full">
                {filteredPrompts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-white/[0.02] rounded-2xl border border-white/10">
                    {isAr ? 'لا توجد برومبتات مطابقة' : 'No matching prompts'}
                  </div>
                ) : (
                  filteredPrompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="p-4 rounded-2xl bg-[#11121c] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group shadow-md"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {prompt.imageUrl ? (
                          <img
                            src={prompt.imageUrl}
                            alt=""
                            className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center shrink-0 text-xl">
                            ✨
                          </div>
                        )}

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                              {isAr ? prompt.titleAr : prompt.titleEn}
                            </h4>
                            {prompt.featured && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span>{isAr ? 'مثبت مميز' : 'Featured'}</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 font-mono line-clamp-2 sm:line-clamp-1">
                            {prompt.promptText}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 flex-wrap">
                            <span className="text-purple-300 px-1.5 py-0.5 rounded bg-purple-900/30 border border-purple-500/20">
                              {prompt.model}
                            </span>
                            <span>•</span>
                            <span className="text-indigo-300 font-bold">{prompt.hubId}</span>
                            <span>•</span>
                            <span>❤️ {prompt.likes}</span>
                          </div>
                        </div>
                      </div>

                      {/* Touch-Friendly Action buttons (Stacked 3-column on mobile with min-h-[42px]) */}
                      <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(prompt.id)}
                          className={`min-h-[42px] sm:min-h-0 sm:p-2 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            prompt.featured
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                              : 'bg-white/[0.04] text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 border border-white/10'
                          }`}
                          title={prompt.featured ? (isAr ? 'إلغاء التثبيت' : 'Unpin') : (isAr ? 'تثبيت كمميز ⭐' : 'Pin as Featured')}
                        >
                          <Star className={`w-3.5 h-3.5 ${prompt.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span className="sm:hidden">{prompt.featured ? (isAr ? 'مثبت' : 'Pinned') : (isAr ? 'تثبيت' : 'Pin')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingPrompt(prompt)}
                          className="min-h-[42px] sm:min-h-0 sm:p-2 px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title={isAr ? 'تعديل البرومبت' : 'Edit'}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                          <span className="sm:hidden">{isAr ? 'تعديل' : 'Edit'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا البرومبت؟' : 'Delete this prompt?')) {
                              handleDeletePrompt(prompt.id);
                            }
                          }}
                          className="min-h-[42px] sm:min-h-0 sm:p-2 px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span className="sm:hidden">{isAr ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 5: ANALYTICS & INTERACTIVE CHARTS */}
          {activeTab === 'analytics' && (
            <AdminAnalyticsTab
              lang={lang}
              categories={categories}
              prompts={prompts}
            />
          )}

          {/* TAB 6: USERS MANAGEMENT DATA TABLE */}
          {activeTab === 'users' && (
            <AdminUsersTab
              lang={lang}
              users={users}
              onUpdateUsers={onUpdateUsers}
              onTriggerToast={onTriggerToast}
            />
          )}

        </main>

      </div>
    </div>
  );
};
