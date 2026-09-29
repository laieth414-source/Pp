import React, { useState, useRef, useEffect } from 'react';
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
  Clock,
  Palette,
  CheckCircle2,
  XCircle,
  Camera,
  Copy,
  Globe,
  Lock,
  Loader2,
} from 'lucide-react';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
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

type AdminTab = 'branding' | 'theme' | 'homepage' | 'categories' | 'prompts' | 'moderation' | 'analytics' | 'users';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  lang,
  siteSettings,
  categories: initialCategories,
  prompts: initialPrompts,
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
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<AdminTab>('branding');

  // Local state copies for instant editing and zero-lag reactivity
  const [settings, setSettings] = useState<SiteSettings>(siteSettings);
  const [prompts, setPrompts] = useState<PromptItem[]>(initialPrompts);
  const [categories, setCategories] = useState<HubCategory[]>(initialCategories);

  // Sync with incoming prop changes
  useEffect(() => {
    setPrompts(initialPrompts);
  }, [initialPrompts]);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setSettings(siteSettings);
  }, [siteSettings]);

  // Loading states for async updates
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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

  // Admin Direct Prompt Creator state
  const [isAdminAddingPrompt, setIsAdminAddingPrompt] = useState(false);
  const [adminNewPrompt, setAdminNewPrompt] = useState({
    titleAr: '',
    promptText: '',
    model: 'Midjourney v6.1',
    category: 'بورتريه ووجوه',
    hubId: 'portrait',
    tagsInput: '',
    imageUrl: '',
    featured: false,
  });
  const [adminUploadedImage, setAdminUploadedImage] = useState<string>('');
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // Moderation state
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Admin Review Modal state (Hooks declared unconditionally at top level)
  const [reviewPrompt, setReviewPrompt] = useState<PromptItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [reviewRejectionReason, setReviewRejectionReason] = useState<string>('');
  const [reviewIsFeatured, setReviewIsFeatured] = useState<boolean>(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [copiedReviewText, setCopiedReviewText] = useState(false);

  const pendingPrompts = prompts.filter((p) => p.status === 'pending');

  if (!isOpen) return null;

  const handleAdminImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawData = event.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setAdminUploadedImage(compressedBase64);
        setAdminNewPrompt((prev) => ({ ...prev, imageUrl: '' }));
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAdminPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewPrompt.titleAr.trim() || !adminNewPrompt.promptText.trim()) {
      onTriggerToast(isAr ? 'يرجى إدخال العنوان ونص البرومبت' : 'Please enter title and prompt text');
      return;
    }

    const categoryToHubMap: Record<string, string> = {
      'بورتريه ووجوه': 'portrait',
      'سينمائي ودرامي': 'cinematic',
      'أنمي وفانتازيا': 'anime',
      'تصميم تجاري': '3d-design',
      'شخصيات 3D': '3d-design',
      'سايبربانك وخيال علمي': 'cyberpunk',
      'برمجة وكود': 'code-dev',
    };
    const selectedCategoryName = adminNewPrompt.category || 'بورتريه ووجوه';
    const hubId = categoryToHubMap[selectedCategoryName] || 'portrait';

    const userTags = adminNewPrompt.tagsInput
      .split(/[,،]/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const finalImage = adminUploadedImage || adminNewPrompt.imageUrl.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';

    const created: PromptItem = {
      id: `admin-p-${Date.now()}`,
      titleAr: adminNewPrompt.titleAr.trim(),
      titleEn: adminNewPrompt.titleAr.trim(),
      promptText: adminNewPrompt.promptText.trim(),
      model: adminNewPrompt.model,
      category: selectedCategoryName.trim(),
      hubId: hubId,
      aspectRatio: '1:1',
      likes: 12,
      saves: 4,
      isLiked: false,
      isSaved: false,
      tags: Array.from(new Set([selectedCategoryName.trim(), adminNewPrompt.model.split(' ')[0], ...userTags])),
      creator: {
        id: 'admin-master',
        name: isAr ? 'فريق إدارة سَوّيها' : 'Sawihaa Team',
        handle: '@sawihaa_admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        badge: isAr ? 'إدارة رسمية' : 'Official Admin',
        roleAr: 'إدارة رسمية',
        roleEn: 'Official Admin',
        promptCount: prompts.length + 1,
        followers: 1280,
        verified: true,
      },
      visualType: 'cinematic_director',
      featured: true,
      isFeatured: true,
      createdAt: isAr ? 'الآن' : 'Just now',
      imageUrl: finalImage,
      status: 'approved',
      submissionTarget: 'public',
    };

    const updated = [created, ...prompts];
    onUpdatePrompts(updated);
    try {
      setDoc(doc(db, 'prompts', created.id), created, { merge: true }).catch((err) => {
        console.warn('Firestore admin prompt save error:', err);
      });
    } catch {}
    setIsAdminAddingPrompt(false);
    setAdminNewPrompt({
      titleAr: '',
      promptText: '',
      model: 'Midjourney v6.1',
      category: 'بورتريه ووجوه',
      hubId: 'portrait',
      tagsInput: '',
      imageUrl: '',
      featured: false,
    });
    setAdminUploadedImage('');
    onTriggerToast(isAr ? 'تم نشر البرومبت فورياً وبنجاح! 🚀' : 'Prompt published immediately! 🚀');
  };

  const handleOpenReviewPrompt = (prompt: PromptItem) => {
    setReviewPrompt(prompt);
    setReviewStatus(prompt.status === 'rejected' ? 'rejected' : prompt.status === 'pending' ? 'pending' : 'approved');
    setReviewRejectionReason(prompt.rejectionReason || '');
    setReviewIsFeatured(Boolean(prompt.isFeatured ?? prompt.featured ?? false));
    setCopiedReviewText(false);
  };

  const handleUpdatePromptStatus = (
    promptId: string,
    newStatus: 'pending' | 'approved' | 'rejected',
    targetPlacement: 'category_only' | 'home_and_category',
    rejectionReasonText?: string
  ) => {
    const isFeatured = targetPlacement === 'home_and_category';
    const updatePayload = {
      status: newStatus,
      isFeatured: newStatus === 'approved' ? isFeatured : false,
      featured: newStatus === 'approved' ? isFeatured : false,
      rejectionReason:
        newStatus === 'rejected'
          ? (rejectionReasonText || (isAr ? 'لم يستوفِ معايير النشر' : 'Does not meet publishing standards'))
          : null,
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately update local state so UI never freezes or hangs
    setPrompts((prev) => prev.map((p) => (p.id === promptId ? { ...p, ...updatePayload } : p)));
    onUpdatePrompts(prompts.map((p) => (p.id === promptId ? { ...p, ...updatePayload } : p)));

    // 2. Persist to Firestore asynchronously using setDoc with { merge: true } inside try/catch/finally
    (async () => {
      try {
        const promptRef = doc(db, 'prompts', promptId);
        await setDoc(promptRef, updatePayload, { merge: true });
      } catch (e) {
        console.warn('Firestore update status error:', e);
      }
    })();
  };

  const handleSaveReviewStatus = () => {
    if (!reviewPrompt) return;
    const promptId = reviewPrompt.id;
    const updatedStatus = reviewStatus;
    const finalRejectionReason =
      updatedStatus === 'rejected'
        ? (reviewRejectionReason.trim() || (isAr ? 'لم يستوفِ معايير النشر' : 'Does not meet publishing standards'))
        : null;
    const targetPlacement: 'category_only' | 'home_and_category' = reviewIsFeatured
      ? 'home_and_category'
      : 'category_only';

    const isFeaturedVal = updatedStatus === 'approved' && reviewIsFeatured;
    const payload = {
      status: updatedStatus,
      isFeatured: isFeaturedVal,
      featured: isFeaturedVal,
      rejectionReason: finalRejectionReason,
      updatedAt: new Date().toISOString(),
    };

    // Immediately update local state & close modal/loading state so UI never locks up
    setPrompts((prev) => prev.map((p) => (p.id === promptId ? { ...p, ...payload } : p)));
    onUpdatePrompts(prompts.map((p) => (p.id === promptId ? { ...p, ...payload } : p)));
    setReviewPrompt(null);
    setIsSavingReview(false);

    onTriggerToast(
      isAr
        ? `تم تحديث حالة البرومبت إلى (${
            updatedStatus === 'approved'
              ? reviewIsFeatured
                ? 'مقبول بالواجهة ومكتبة القسم ⭐'
                : 'مقبول بمكتبة القسم فقط 📁'
              : updatedStatus === 'rejected'
              ? 'مرفوض 🔴'
              : 'قيد المراجعة 🟡'
          }) بنجاح! 💾`
        : `Prompt status updated to ${updatedStatus}! 💾`
    );

    // Persist to Firestore asynchronously using setDoc with { merge: true } inside try/catch/finally
    (async () => {
      try {
        const promptRef = doc(db, 'prompts', promptId);
        await setDoc(promptRef, payload, { merge: true });
      } catch (err) {
        console.warn('Firestore review save error:', err);
      } finally {
        setIsSavingReview(false);
      }
    })();
  };

  // Standardized Status Badge Helper across the platform
  const renderStandardStatusBadge = (status?: string) => {
    if (status === 'pending' || status === 'under_review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span>{isAr ? '🟡 قيد المراجعة' : '🟡 Under Review'}</span>
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span>{isAr ? '🔴 مرفوض' : '🔴 Rejected'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span>{isAr ? '🟢 مقبول' : '🟢 Approved'}</span>
      </span>
    );
  };

  const handleApprovePrompt = (promptId: string, isFeaturedChoice = true) => {
    const targetPlacement: 'category_only' | 'home_and_category' = isFeaturedChoice
      ? 'home_and_category'
      : 'category_only';
    handleUpdatePromptStatus(promptId, 'approved', targetPlacement);
    onTriggerToast(
      isAr
        ? isFeaturedChoice
          ? 'تم قبول ونشر في المنصة (الواجهة الرئيسية ومكتبة القسم)! ⭐'
          : 'تم قبول ونشر في المنصة (مكتبة القسم فقط)! 📁'
        : 'Prompt approved and published!'
    );
  };

  const handleRejectPrompt = (promptId: string) => {
    const reason = rejectionReasonText.trim() || (isAr ? 'لم يستوفِ معايير النشر' : 'Does not meet publishing standards');
    setRejectionTargetId(null);
    setRejectionReasonText('');
    handleUpdatePromptStatus(promptId, 'rejected', 'category_only', reason);
    onTriggerToast(isAr ? 'تم رفض طلب النشر وتحديث الحالة ❌' : 'Prompt submission rejected ❌');
  };

  const handleThemeChange = (field: 'accentColor' | 'bgColor', value: string) => {
    const updated: SiteSettings = {
      ...settings,
      theme: {
        accentColor: settings.theme?.accentColor || 'violet',
        bgColor: settings.theme?.bgColor || 'obsidian',
        [field]: value,
      },
    };
    setSettings(updated);
    onUpdateSiteSettings(updated);
    onTriggerToast(
      lang === 'ar'
        ? 'تم تحديث المظهر وتطبيقه بنجاح! 🎨'
        : 'Theme updated and applied successfully! 🎨'
    );
  };

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

  const handleUpdateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCategory) return;
    setIsSavingCategory(true);
    try {
      await setDoc(doc(db, "categories", editingCategory.id), editingCategory, { merge: true });
      const updated = categories.map((cat) =>
        cat.id === editingCategory.id ? editingCategory : cat
      );
      setCategories(updated);
      onUpdateCategories(updated);
      setEditingCategory(null);
      onTriggerToast(isAr ? 'تم حفظ بيانات القسم في السحابة بنجاح! 💾' : 'Category updated in Firestore! 💾');
    } catch (error) {
      console.error("Error updating category document:", error);
      const updated = categories.map((cat) =>
        cat.id === editingCategory.id ? editingCategory : cat
      );
      setCategories(updated);
      onUpdateCategories(updated);
      setEditingCategory(null);
      onTriggerToast(isAr ? 'تم تحديث بيانات القسم محلياً! 💾' : 'Category updated locally! 💾');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!id) return;
    if (categories.length <= 1) {
      onTriggerToast(isAr ? 'لا يمكن حذف كافة الأقسام، يجب إبقاء قسم واحد على الأقل' : 'Cannot delete the only remaining category');
      return;
    }
    try {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      onUpdateCategories(categories.filter((c) => c.id !== id));
      onTriggerToast(isAr ? 'تم حذف القسم بنجاح' : 'Category deleted');
      await deleteDoc(doc(db, "categories", id));
    } catch (error) {
      console.error("Error deleting category document:", error);
    }
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
    setPrompts(updated);
    onUpdatePrompts(updated);
  };

  const handleDeletePrompt = async (id: string) => {
    if (!id) return;
    try {
      // Immediate optimistic UI update
      setPrompts((prev) => prev.filter((item) => item.id !== id));
      onUpdatePrompts(prompts.filter((item) => item.id !== id));
      onTriggerToast(isAr ? 'تم حذف البرومبت بنجاح! 🗑️' : 'Prompt deleted successfully! 🗑️');
      await deleteDoc(doc(db, "prompts", id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSavePromptEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPrompt) return;
    const promptId = editingPrompt.id;
    const updatedData: Partial<PromptItem> = {
      titleAr: editingPrompt.titleAr.trim(),
      titleEn: (editingPrompt.titleEn || editingPrompt.titleAr).trim(),
      promptText: editingPrompt.promptText.trim(),
      category: (editingPrompt.category || 'بورتريه ووجوه').trim(),
      hubId: editingPrompt.hubId,
      model: editingPrompt.model,
      imageUrl: editingPrompt.imageUrl,
    };

    // 1. Immediate optimistic UI update & close modal
    const updated = prompts.map((p) =>
      p.id === promptId ? { ...p, ...updatedData } : p
    );
    setPrompts(updated);
    onUpdatePrompts(updated);
    setEditingPrompt(null);
    setIsSavingPrompt(false);
    onTriggerToast(isAr ? 'تم حفظ التعديلات بنجاح! 💾' : 'Prompt edits saved! 💾');

    // 2. Persist to Firestore asynchronously using setDoc with merge: true inside try/catch/finally
    (async () => {
      try {
        await setDoc(doc(db, "prompts", promptId), updatedData, { merge: true });
      } catch (error) {
        console.warn("Error updating prompt document:", error);
      } finally {
        setIsSavingPrompt(false);
      }
    })();
  };

  const handleSaveSiteSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "site"), settings, { merge: true });
      onUpdateSiteSettings(settings);
      onTriggerToast(isAr ? 'تم حفظ كافة الإعدادات في السحابة بنجاح! 💾' : 'All settings saved to cloud! 💾');
    } catch (error) {
      console.error("Error saving site settings:", error);
      onUpdateSiteSettings(settings);
      onTriggerToast(isAr ? 'تم تطبيق الإعدادات محلياً! 💾' : 'Settings applied locally! 💾');
    } finally {
      setIsSavingSettings(false);
    }
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
      className="fixed inset-0 z-[100] bg-[#090a0f] flex flex-col overflow-hidden animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <header className="h-16 px-3 sm:px-6 border-b border-white/10 bg-[#13141c] flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-black text-[#f8fafc] flex items-center gap-1.5 truncate">
              <span className="truncate">{isAr ? 'لوحة التحكم (CMS)' : 'Master CMS Admin'}</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{isAr ? 'ربط فوري' : 'Live'}</span>
              </span>
            </h1>
            <p className="text-[11px] text-[#94a3b8] hidden lg:block truncate">
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
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#94a3b8] hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            title={isAr ? 'تصدير نسخة احتياطية' : 'Export JSON Backup'}
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
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
            className="bg-violet-600 hover:bg-violet-500 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 min-h-[38px] transition-colors"
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
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#090a0f]">
        
        {/* Navigation Tabs (Sidebar on desktop, smooth horizontal-scrolling chip bar on mobile) */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#0e0f17] p-2 sm:p-3 md:p-4 shrink-0 flex md:flex-col items-center md:items-stretch gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-2 px-2">
          
          <button
            onClick={() => setActiveTab('branding')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'branding'
                ? 'bg-violet-600/30 border border-violet-500 text-violet-200'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <Paintbrush className="w-4 h-4 text-violet-400 shrink-0" />
            <span>{isAr ? 'الهوية والعلامة التجارية' : 'Branding & Identity'}</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'theme'
                ? 'bg-violet-600/30 border border-violet-500 text-violet-200'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <Palette className="w-4 h-4 text-fuchsia-400 shrink-0" />
            <span>{isAr ? 'المظهر والألوان (Themes)' : 'Visual Theme Picker'}</span>
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'homepage'
                ? 'bg-violet-600/30 border border-violet-500 text-violet-200'
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
                ? 'bg-violet-600/30 border border-violet-500 text-violet-200'
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
                ? 'bg-violet-600/30 border border-violet-500 text-violet-200'
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

          {/* TAB: MODERATION QUEUE */}
          <button
            onClick={() => setActiveTab('moderation')}
            className={`shrink-0 min-h-[42px] md:min-h-0 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'bg-amber-500/20 border border-amber-500 text-amber-200'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex items-center justify-between w-full gap-2">
              <span>{isAr ? 'طلبات المراجعة المعلقة' : 'Moderation Queue'}</span>
              {pendingPrompts.length > 0 ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-black font-black animate-pulse">
                  {pendingPrompts.length}
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                  0
                </span>
              )}
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

              {/* Form: Add New Category Dedicated Modal */}
              {isAddingCategory && (
                <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
                  <div
                    className="w-full max-w-xl bg-[#0e1017] border border-violet-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                    dir={isAr ? 'rtl' : 'ltr'}
                  >
                    <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#13141f]">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-violet-400" />
                        <span>{isAr ? 'إنشاء قسم جديد' : 'Create New Category'}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      id="add-category-form"
                      onSubmit={handleSaveNewCategory}
                      className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1"
                    >
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
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-semibold">
                            {isAr ? 'الأيقونة أو الإيموجي' : 'Icon or Emoji'}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 🎨 or Sparkles, Film, User, Code..."
                            value={newCategory.iconName}
                            onChange={(e) => setNewCategory({ ...newCategory, iconName: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-slate-300 font-semibold">
                            {isAr ? 'اسم القسم بالعربية' : 'Title (Arabic)'} <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: شعارات وأيقونات تجارية"
                            value={newCategory.titleAr}
                            onChange={(e) => setNewCategory({ ...newCategory, titleAr: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                            required
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-slate-300 font-semibold">
                            {isAr ? 'اسم القسم بالإنجليزية' : 'Title (English)'}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Logos & Branding"
                            value={newCategory.titleEn}
                            onChange={(e) => setNewCategory({ ...newCategory, titleEn: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
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
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </form>

                    <div className="sticky bottom-0 bg-[#0d0e15] p-4 border-t border-white/10 flex items-center justify-end gap-3 z-10 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        form="add-category-form"
                        className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 min-h-[40px]"
                      >
                        <span>💾 {isAr ? 'إنشاء وحفظ القسم' : 'Create Category'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Form: Edit Existing Category Dedicated Modal */}
              {editingCategory && (
                <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
                  <div
                    className="w-full max-w-xl bg-[#0e1017] border border-violet-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                    dir={isAr ? 'rtl' : 'ltr'}
                  >
                    <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#13141f]">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-violet-400" />
                        <span>{isAr ? `تعديل قسم: ${editingCategory.titleAr}` : `Edit: ${editingCategory.titleEn || editingCategory.titleAr}`}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      id="edit-category-form"
                      onSubmit={handleUpdateCategory}
                      className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-semibold">
                            {isAr ? 'اسم القسم بالعربية' : 'Title (Arabic)'}
                          </label>
                          <input
                            type="text"
                            value={editingCategory.titleAr}
                            onChange={(e) => setEditingCategory({ ...editingCategory, titleAr: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
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
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
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
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </form>

                    <div className="sticky bottom-0 bg-[#0d0e15] p-4 border-t border-white/10 flex items-center justify-end gap-3 z-10 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingCategory}
                        onClick={handleUpdateCategory}
                        className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 min-h-[40px]"
                      >
                        {isSavingCategory ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                          </>
                        ) : (
                          <>
                            <span>💾 {isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
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
                          type="button"
                          onClick={() => setEditingCategory(cat)}
                          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat.id);
                          }}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer z-10 flex items-center justify-center"
                          title={isAr ? 'حذف القسم' : 'Delete category'}
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
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
                      ? 'تعديل أي برومبت، تغيير القسم، تثبيت كمميز في الصدارة ⭐، أو إضافة برومبتات جديدة فورية.'
                      : 'Moderate all prompts, toggle featured pins, edit text, or create directly as admin.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAdminAddingPrompt(!isAdminAddingPrompt)}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة برومبت جديد كمدير' : 'Add Prompt as Admin'}</span>
                </button>
              </div>

              {/* Admin Direct Prompt Creator Form */}
              {isAdminAddingPrompt && (
                <form
                  onSubmit={handleCreateAdminPrompt}
                  className="p-5 sm:p-6 rounded-2xl bg-[#13141c] border border-violet-500/40 space-y-4 shadow-xl animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-violet-400" />
                      <span>{isAr ? 'إضافة برومبت جديد كمدير (نشر فوري معتمد)' : 'Create Direct Admin Prompt'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAdminAddingPrompt(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'عنوان البرومبت' : 'Prompt Title'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={adminNewPrompt.titleAr}
                        onChange={(e) => setAdminNewPrompt({ ...adminNewPrompt, titleAr: e.target.value })}
                        placeholder={isAr ? 'مثال: مشهد سينمائي مستقبلي عالي الدقة' : 'e.g. Ultra-realistic cinematic scene'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'القسم / التصنيف' : 'Category Hub'} <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={adminNewPrompt.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          const categoryToHubMap: Record<string, string> = {
                            'بورتريه ووجوه': 'portrait',
                            'سينمائي ودرامي': 'cinematic',
                            'أنمي وفانتازيا': 'anime',
                            'تصميم تجاري': '3d-design',
                            'شخصيات 3D': '3d-design',
                            'سايبربانك وخيال علمي': 'cyberpunk',
                            'برمجة وكود': 'code-dev',
                          };
                          setAdminNewPrompt({
                            ...adminNewPrompt,
                            category: val,
                            hubId: categoryToHubMap[val] || 'portrait',
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141523] border border-white/10 text-xs text-white cursor-pointer focus:outline-none focus:border-violet-500"
                      >
                        <option value="بورتريه ووجوه">بورتريه ووجوه</option>
                        <option value="سينمائي ودرامي">سينمائي ودرامي</option>
                        <option value="أنمي وفانتازيا">أنمي وفانتازيا</option>
                        <option value="تصميم تجاري">تصميم تجاري</option>
                        <option value="شخصيات 3D">شخصيات 3D</option>
                        <option value="سايبربانك وخيال علمي">سايبربانك وخيال علمي</option>
                        <option value="برمجة وكود">برمجة وكود</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'النموذج / الأداة' : 'AI Model'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={adminNewPrompt.model}
                        onChange={(e) => setAdminNewPrompt({ ...adminNewPrompt, model: e.target.value })}
                        placeholder="Midjourney v6.1 / FLUX.1 Pro"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                        required
                      />
                    </div>

                    {/* Direct Image File Upload from Gallery */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'صورة نتيجة البرومبت' : 'Result Image'}
                      </label>

                      <input
                        ref={adminFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="admin-prompt-file-upload"
                        onChange={handleAdminImageSelect}
                      />

                      {adminUploadedImage ? (
                        <div className="rounded-xl border border-violet-500/40 bg-violet-950/20 p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={adminUploadedImage}
                              alt="Uploaded"
                              className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{isAr ? 'تم تحميل الصورة من الجهاز بنجاح' : 'Image uploaded from device'}</span>
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {isAr ? 'جاهزة للنشر الفوري' : 'Ready for instant publishing'}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setAdminUploadedImage('');
                              if (adminFileInputRef.current) adminFileInputRef.current.value = '';
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isAr ? 'إزالة / تغيير' : 'Change'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <label
                            htmlFor="admin-prompt-file-upload"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-violet-500/40 hover:border-violet-400 bg-violet-600/[0.04] hover:bg-violet-600/[0.08] cursor-pointer transition-all text-xs text-slate-300 hover:text-white"
                          >
                            <Camera className="w-4 h-4 text-violet-400" />
                            <span>{isAr ? '📷 اختر صورة من الاستوديو أو الملفات (Upload Image)' : 'Upload from Gallery / Files'}</span>
                          </label>

                          <span className="text-[11px] text-slate-500 text-center sm:text-start">{isAr ? 'أو' : 'or'}</span>

                          <input
                            type="url"
                            value={adminNewPrompt.imageUrl}
                            onChange={(e) => {
                              setAdminNewPrompt({ ...adminNewPrompt, imageUrl: e.target.value });
                              if (e.target.value.trim()) setAdminUploadedImage('');
                            }}
                            placeholder={isAr ? 'الصق رابط صورة خارجي...' : 'Paste image URL...'}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'نص البرومبت الكامل' : 'Prompt Text'} <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={adminNewPrompt.promptText}
                        onChange={(e) => setAdminNewPrompt({ ...adminNewPrompt, promptText: e.target.value })}
                        placeholder="cinematic photo of a cyber city, 8k, volumetric light, --ar 16:9..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
                        required
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold">
                        {isAr ? 'وسوم إضافية (مفصولة بفاصلة)' : 'Tags (comma separated)'}
                      </label>
                      <input
                        type="text"
                        value={adminNewPrompt.tagsInput}
                        onChange={(e) => setAdminNewPrompt({ ...adminNewPrompt, tagsInput: e.target.value })}
                        placeholder={isAr ? 'واقعي, إضاءة_درامية, بورتريه' : 'realistic, neon, portrait'}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="admin-featured-checkbox"
                        checked={adminNewPrompt.featured}
                        onChange={(e) => setAdminNewPrompt({ ...adminNewPrompt, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-violet-600 bg-white/5 border-white/10 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="admin-featured-checkbox" className="text-xs text-slate-300 font-semibold cursor-pointer flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{isAr ? 'تثبيت البرومبت في الصدارة كمميز ⭐' : 'Pin prompt as featured ⭐'}</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsAdminAddingPrompt(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.04] cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm transition-colors cursor-pointer"
                    >
                      {isAr ? 'نشر البرومبت الآن كمدير 🚀' : 'Publish Directly Now 🚀'}
                    </button>
                  </div>
                </form>
              )}

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

              {/* Edit Prompt Dedicated Modal with Sticky Actions (Never Cut Off) */}
              {editingPrompt && (
                <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
                  <div
                    className="w-full max-w-2xl bg-[#0e1017] border border-violet-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                    dir={isAr ? 'rtl' : 'ltr'}
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#13141f]">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-violet-400" />
                        <span>{isAr ? 'تعديل بيانات البرومبت' : 'Edit Prompt Details'}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingPrompt(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Scrollable Body with max-h-[85vh] */}
                    <form
                      id="edit-prompt-form"
                      onSubmit={handleSavePromptEdit}
                      className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-slate-300 font-semibold">
                            {isAr ? 'عنوان البرومبت' : 'Title'}
                          </label>
                          <input
                            type="text"
                            value={editingPrompt.titleAr}
                            onChange={(e) => setEditingPrompt({ ...editingPrompt, titleAr: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                            required
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-slate-300 font-semibold">
                            {isAr ? 'نص البرومبت الكامل' : 'Prompt Text'}
                          </label>
                          <textarea
                            rows={4}
                            value={editingPrompt.promptText}
                            onChange={(e) => setEditingPrompt({ ...editingPrompt, promptText: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-violet-500"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-semibold">
                            {isAr ? 'القسم / التصنيف' : 'Category'}
                          </label>
                          <select
                            value={editingPrompt.category || 'بورتريه ووجوه'}
                            onChange={(e) => {
                              const val = e.target.value;
                              const categoryToHubMap: Record<string, string> = {
                                'بورتريه ووجوه': 'portrait',
                                'سينمائي ودرامي': 'cinematic',
                                'أنمي وفانتازيا': 'anime',
                                'تصميم تجاري': '3d-design',
                                'شخصيات 3D': '3d-design',
                                'سايبربانك وخيال علمي': 'cyberpunk',
                                'برمجة وكود': 'code-dev',
                              };
                              setEditingPrompt({
                                ...editingPrompt,
                                category: val,
                                hubId: categoryToHubMap[val] || editingPrompt.hubId,
                              });
                            }}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#141523] border border-white/10 text-xs text-white cursor-pointer focus:outline-none focus:border-violet-500"
                          >
                            <option value="بورتريه ووجوه">بورتريه ووجوه</option>
                            <option value="سينمائي ودرامي">سينمائي ودرامي</option>
                            <option value="أنمي وفانتازيا">أنمي وفانتازيا</option>
                            <option value="تصميم تجاري">تصميم تجاري</option>
                            <option value="شخصيات 3D">شخصيات 3D</option>
                            <option value="سايبربانك وخيال علمي">سايبربانك وخيال علمي</option>
                            <option value="برمجة وكود">برمجة وكود</option>
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
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
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
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </form>

                    {/* Sticky Bottom Action Bar (Never Cut Off) */}
                    <div className="sticky bottom-0 bg-[#0d0e15] p-4 border-t border-white/10 flex items-center justify-end gap-3 z-10 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingPrompt(null)}
                        className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingPrompt}
                        onClick={handleSavePromptEdit}
                        className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 min-h-[40px]"
                      >
                        {isSavingPrompt ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                          </>
                        ) : (
                          <>
                            <span>💾 {isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
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
                            <h4
                              onClick={() => handleOpenReviewPrompt(prompt)}
                              className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate cursor-pointer hover:underline"
                            >
                              {isAr ? prompt.titleAr : prompt.titleEn}
                            </h4>
                            {renderStandardStatusBadge(prompt.status)}
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

                      {/* Touch-Friendly Action buttons (Review, Featured, Edit, Delete) */}
                      <div className="grid grid-cols-4 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => handleOpenReviewPrompt(prompt)}
                          className="min-h-[42px] sm:min-h-0 sm:p-2 px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/35 text-violet-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title={isAr ? 'مراجعة وتغيير الحالة' : 'Review & Status'}
                        >
                          <Eye className="w-3.5 h-3.5 text-violet-400" />
                          <span className="sm:hidden">{isAr ? 'مراجعة' : 'Review'}</span>
                        </button>

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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePrompt(prompt.id);
                          }}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer z-10 flex items-center justify-center"
                          title={isAr ? "حذف البرومبت" : "Delete prompt"}
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB: MODERATION QUEUE (طلبات المراجعة المعلقة) */}
          {activeTab === 'moderation' && (
            <div className="max-w-5xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>{isAr ? 'طلبات المراجعة المعلقة (Moderation Queue)' : 'Pending Moderation Queue'}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pendingPrompts.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr
                      ? 'مراجعة طلبات نشر البرومبتات المرسلة من صناع المحتوى قبل ظهورها في الصفحة الرئيسية.'
                      : 'Review and approve/reject creator-submitted prompts before publishing to the public feed.'}
                  </p>
                </div>
              </div>

              {pendingPrompts.length === 0 ? (
                <div className="p-10 sm:p-14 text-center rounded-2xl bg-[#13141c] border border-white/10 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 text-2xl">
                    ✓
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? 'لا توجد طلبات معلقة حالياً' : 'No pending submissions'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {isAr
                      ? 'رائع! كافة البرومبتات المرسلة تمت مراجعتها واعتمادها، ولا توجد أي طلبات بانتظار البت.'
                      : 'All user submissions have been reviewed and approved. Queue is completely clear.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPrompts.map((prompt) => {
                    const cat = categories.find((c) => c.id === prompt.hubId);
                    const isRejecting = rejectionTargetId === prompt.id;

                    return (
                      <div
                        key={prompt.id}
                        className="p-5 rounded-2xl bg-[#13141c] border border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col gap-4 shadow-lg"
                      >
                        {/* Top: Image, Details, Author */}
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {prompt.imageUrl ? (
                            <img
                              src={prompt.imageUrl}
                              alt={prompt.titleAr}
                              className="w-full sm:w-32 h-32 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-full sm:w-32 h-32 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-3xl shrink-0">
                              📷
                            </div>
                          )}

                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-white">
                                {prompt.titleAr || prompt.titleEn}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {isAr ? '⏳ بانتظار المراجعة' : 'Pending Review'}
                              </span>
                              {prompt.submissionTarget && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-slate-300 border border-white/10">
                                  {prompt.submissionTarget === 'both'
                                    ? (isAr ? 'كلاهما (حفظ + نشر)' : 'Both')
                                    : (isAr ? 'طلب نشر عام' : 'Public Review')}
                                </span>
                              )}
                            </div>

                            {/* Creator metadata */}
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <img
                                src={prompt.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover border border-violet-400"
                              />
                              <span className="text-white font-medium">{prompt.creator?.name || 'مبدع'}</span>
                              <span>•</span>
                              <span className="font-mono text-violet-300">{prompt.creator?.handle}</span>
                              <span>•</span>
                              <span>{prompt.createdAt}</span>
                            </div>

                            {/* Badges: Category & Model */}
                            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                              <span className="px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30 font-semibold">
                                {cat ? (isAr ? cat.titleAr : (cat.titleEn || cat.titleAr)) : prompt.hubId}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10 font-mono">
                                {prompt.model}
                              </span>
                            </div>

                            {/* Prompt text */}
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-slate-300 leading-relaxed break-words">
                              {prompt.promptText}
                            </div>
                          </div>
                        </div>

                        {/* Rejection input box if triggered */}
                        {isRejecting ? (
                          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3 animate-in fade-in">
                            <label className="text-xs font-semibold text-rose-300 block">
                              {isAr ? 'اذكر سبب رفض هذا البرومبت (سيتم إخطار المستخدم):' : 'Rejection Reason:'}
                            </label>
                            <input
                              type="text"
                              value={rejectionReasonText}
                              onChange={(e) => setRejectionReasonText(e.target.value)}
                              placeholder={isAr ? 'مثال: الصورة المرفقة غير واضحة، أو البرومبت مكرر...' : 'e.g. Blurry image, or duplicate prompt...'}
                              className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-rose-500/40 text-xs text-white focus:outline-none"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectionTargetId(null);
                                  setRejectionReasonText('');
                                }}
                                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/[0.05] cursor-pointer"
                              >
                                {isAr ? 'تراجع' : 'Cancel'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectPrompt(prompt.id)}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-sm"
                              >
                                {isAr ? 'تأكيد الرفض ❌' : 'Confirm Reject ❌'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Action buttons bar */
                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                            <button
                              type="button"
                              onClick={() => handleOpenReviewPrompt(prompt)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-violet-300 hover:text-white bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-violet-400" />
                              <span>{isAr ? 'مراجعة وتغيير الحالة' : 'Detailed Review'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRejectionTargetId(prompt.id);
                                setRejectionReasonText('');
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{isAr ? 'رفض الطلب' : 'Reject Submission'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleOpenReviewPrompt(prompt);
                                setReviewStatus('approved');
                              }}
                              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{isAr ? '✅ قبول وتحديد الوجهة' : 'Approve & Set Placement'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: VISUAL THEME PICKER (إعدادات المظهر والألوان) */}
          {activeTab === 'theme' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-fuchsia-400" />
                  <span>{isAr ? 'المظهر والألوان (Visual Theme Picker)' : 'Visual Theme Picker'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? 'اختر لوحة الألوان والخلفيات بنقرة واحدة على الدوائر المرئية بدون إدخال أكواد hex تقنية.'
                    : 'Select brand accent colors and backgrounds with interactive visual swatches.'}
                </p>
              </div>

              {/* 1. Accent Color Visual Swatches */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#13141c] border border-white/10 space-y-4 shadow-md">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? '1. لون التمييز والأزرار الرئيسي (Brand Accent)' : '1. Brand Accent Color'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr
                      ? 'يحدد ألوان الأزرار والحدود والوسوم واللمسات الفنية في كامل الموقع.'
                      : 'Changes buttons, borders, and interactive highlights platform-wide.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                  {[
                    { id: 'violet', labelAr: 'بنفسجي فخم', labelEn: 'Royal Violet', hex: '#8b5cf6', ring: 'ring-violet-400' },
                    { id: 'cyber_blue', labelAr: 'أزرق سايبر', labelEn: 'Cyber Blue', hex: '#0ea5e9', ring: 'ring-sky-400' },
                    { id: 'neon_green', labelAr: 'أخضر نيون', labelEn: 'Neon Green', hex: '#10b981', ring: 'ring-emerald-400' },
                    { id: 'fire_red', labelAr: 'أحمر ناري', labelEn: 'Fire Red', hex: '#ef4444', ring: 'ring-rose-400' },
                    { id: 'gold', labelAr: 'ذهبي ملكي', labelEn: 'Royal Gold', hex: '#f59e0b', ring: 'ring-amber-400' },
                    { id: 'crystal_white', labelAr: 'أبيض كريستال', labelEn: 'Crystal White', hex: '#f8fafc', ring: 'ring-slate-300' },
                  ].map((swatch) => {
                    const isSelected = (settings.theme?.accentColor || 'violet') === swatch.id;

                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        onClick={() => handleThemeChange('accentColor', swatch.id)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-white/[0.08] border-white/40 ring-2 ring-offset-2 ring-offset-[#090a0f] ' + swatch.ring
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-transform group-hover:scale-110 mb-2"
                          style={{ backgroundColor: swatch.hex }}
                        >
                          {isSelected && <Check className="w-5 h-5 text-black font-black drop-shadow" />}
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {isAr ? swatch.labelAr : swatch.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Background Tone Visual Swatches */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#13141c] border border-white/10 space-y-4 shadow-md">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? '2. نغمة الخلفية الأساسية (Background Tone)' : '2. Background Tone'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr
                      ? 'اختر درجة السواد والظلال في خلفية التطبيق العامة.'
                      : 'Choose between deep obsidian black or ultra-deep navy.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    { id: 'obsidian', labelAr: '⬛ أسود أوبسيديان فاحم (افتراضي مريح)', labelEn: 'Obsidian Black', hex: '#090a0f', previewBorder: '#1e2230' },
                    { id: 'deep_navy', labelAr: '🌑 كحلي داكن عميق (Cyber Deep Navy)', labelEn: 'Deep Navy', hex: '#060b17', previewBorder: '#122345' },
                  ].map((bgSwatch) => {
                    const isSelected = (settings.theme?.bgColor || 'obsidian') === bgSwatch.id;

                    return (
                      <button
                        key={bgSwatch.id}
                        type="button"
                        onClick={() => handleThemeChange('bgColor', bgSwatch.id)}
                        className={`flex items-center gap-3.5 p-4 rounded-xl border text-start transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/[0.08] border-violet-500 ring-2 ring-violet-500/40'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0"
                          style={{ backgroundColor: bgSwatch.hex, borderColor: bgSwatch.previewBorder }}
                        >
                          {isSelected && <Check className="w-5 h-5 text-violet-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {isAr ? bgSwatch.labelAr : bgSwatch.labelEn}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            {bgSwatch.hex}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Live Component Mockup */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-xs font-semibold text-slate-300">
                  {isAr ? 'معاينة حية للمظهر المختار:' : 'Live Theme Preview:'}
                </span>

                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white shadow-sm flex items-center gap-1.5"
                    style={{
                      backgroundColor:
                        settings.theme?.accentColor === 'cyber_blue'
                          ? '#0ea5e9'
                          : settings.theme?.accentColor === 'neon_green'
                          ? '#10b981'
                          : settings.theme?.accentColor === 'fire_red'
                          ? '#ef4444'
                          : settings.theme?.accentColor === 'gold'
                          ? '#f59e0b'
                          : settings.theme?.accentColor === 'crystal_white'
                          ? '#ffffff'
                          : '#8b5cf6',
                      color: settings.theme?.accentColor === 'crystal_white' ? '#000000' : '#ffffff',
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAr ? 'زر تجريبي مميز' : 'Accent Button'}</span>
                  </button>

                  <span
                    className="px-3 py-1 rounded-full text-xs font-mono font-medium border"
                    style={{
                      borderColor:
                        settings.theme?.accentColor === 'cyber_blue'
                          ? '#0ea5e9'
                          : settings.theme?.accentColor === 'neon_green'
                          ? '#10b981'
                          : settings.theme?.accentColor === 'fire_red'
                          ? '#ef4444'
                          : settings.theme?.accentColor === 'gold'
                          ? '#f59e0b'
                          : settings.theme?.accentColor === 'crystal_white'
                          ? '#ffffff'
                          : '#8b5cf6',
                      color:
                        settings.theme?.accentColor === 'cyber_blue'
                          ? '#38bdf8'
                          : settings.theme?.accentColor === 'neon_green'
                          ? '#34d399'
                          : settings.theme?.accentColor === 'fire_red'
                          ? '#f87171'
                          : settings.theme?.accentColor === 'gold'
                          ? '#fbbf24'
                          : settings.theme?.accentColor === 'crystal_white'
                          ? '#ffffff'
                          : '#a78bfa',
                    }}
                  >
                    {isAr ? 'شارة نشطة' : 'Active Badge'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS & INTERACTIVE CHARTS */}
          {activeTab === 'analytics' && (
            <AdminAnalyticsTab
              lang={lang}
              categories={categories}
              prompts={prompts}
              users={users}
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

          {/* Sticky Bottom Action Bar for Site Settings (Branding, Theme, Homepage) */}
          {(activeTab === 'branding' || activeTab === 'theme' || activeTab === 'homepage') && (
            <div className="sticky bottom-0 bg-[#0d0e15] p-4 border-t border-white/10 flex items-center justify-between gap-3 z-30 mt-8 rounded-2xl shadow-2xl">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">
                  {isAr ? 'الإعدادات جاهزة للحفظ المباشر في السحابة' : 'Settings ready to persist to cloud'}
                </span>
                <span className="sm:hidden">
                  {isAr ? 'حفظ الإعدادات' : 'Save settings'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSettings(siteSettings);
                    onTriggerToast(isAr ? 'تم إلغاء التغييرات واستعادة الإعدادات الأصلية' : 'Changes discarded');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isSavingSettings}
                  onClick={handleSaveSiteSettings}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 min-h-[38px]"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <span>💾 {isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Sleek Obsidian Prompt Review Modal */}
      {reviewPrompt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={() => !isSavingReview && setReviewPrompt(null)}
          />

          <div
            className="relative w-full max-w-2xl bg-[#0e0f17] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-right z-10 flex flex-col max-h-[90vh]"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#13141f] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {isAr ? 'مراجعة واعتماد البرومبت' : 'Prompt Review & Status'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'فحص المحتوى وتحديد حالة النشر وكتابة أسباب الرفض إن وجدت' : 'Inspect prompt details and manage publication state'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReviewPrompt(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Image & Main Info Preview */}
              <div className="flex flex-col sm:flex-row gap-4 items-start bg-black/40 p-3.5 rounded-2xl border border-white/5">
                {reviewPrompt.imageUrl ? (
                  <img
                    src={reviewPrompt.imageUrl}
                    alt=""
                    className="w-full sm:w-44 h-44 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-44 h-44 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-4xl shrink-0">
                    ✨
                  </div>
                )}

                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-white">
                      {reviewPrompt.titleAr || reviewPrompt.titleEn}
                    </h4>
                    {renderStandardStatusBadge(reviewPrompt.status)}
                  </div>

                  {/* Tags & Model */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 font-semibold">
                      {categories.find((c) => c.id === reviewPrompt.hubId)?.titleAr || reviewPrompt.hubId || 'عام'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 font-mono">
                      {reviewPrompt.model}
                    </span>
                    {reviewPrompt.aspectRatio && (
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/10 font-mono text-[11px]">
                        {reviewPrompt.aspectRatio}
                      </span>
                    )}
                  </div>

                  {/* Creator Profile */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
                    <img
                      src={reviewPrompt.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-violet-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white truncate">{reviewPrompt.creator?.name || 'مبدع'}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{reviewPrompt.creator?.handle}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono shrink-0">
                      {reviewPrompt.createdAt}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Text with 1-Tap Copy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    {isAr ? 'نص البرومبت (Prompt Text):' : 'Prompt Text:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(reviewPrompt.promptText);
                      setCopiedReviewText(true);
                      setTimeout(() => setCopiedReviewText(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedReviewText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-violet-400" />
                        <span>{isAr ? 'نسخ النص' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-slate-200 leading-relaxed max-h-40 overflow-y-auto break-words select-all">
                  {reviewPrompt.promptText}
                </div>
              </div>

              {/* Status Control Segmented Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  {isAr ? 'تحديد حالة البرومبت:' : 'Set Prompt Status:'}
                </label>

                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
                  {/* 1. Pending Button */}
                  <button
                    type="button"
                    onClick={() => setReviewStatus('pending')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reviewStatus === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>🟡</span>
                    <span>{isAr ? 'قيد المراجعة' : 'Under Review'}</span>
                  </button>

                  {/* 2. Approved Button */}
                  <button
                    type="button"
                    onClick={() => setReviewStatus('approved')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reviewStatus === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>🟢</span>
                    <span>{isAr ? 'قبول ونشر' : 'Approve & Publish'}</span>
                  </button>

                  {/* 3. Rejected Button */}
                  <button
                    type="button"
                    onClick={() => setReviewStatus('rejected')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reviewStatus === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>🔴</span>
                    <span>{isAr ? 'رفض الطلب' : 'Reject'}</span>
                  </button>
                </div>
              </div>

              {/* Target Placement Selector (Only when Approved is selected) */}
              {reviewStatus === 'approved' && (
                <div className="space-y-3 p-4 rounded-2xl bg-violet-600/10 border border-violet-500/30 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                      <span>🎯 {isAr ? 'وجهة النشر والظهور (Target Placement):' : 'Target Placement:'}</span>
                    </label>
                    <span className="text-[11px] font-mono text-violet-300/80">
                      {reviewIsFeatured ? (isAr ? 'واجهة + قسم' : 'Home + Hub') : (isAr ? 'قسم فقط' : 'Hub only')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: Category Library Only */}
                    <button
                      type="button"
                      onClick={() => setReviewIsFeatured(false)}
                      className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                        !reviewIsFeatured
                          ? 'bg-violet-950/60 border-violet-400 ring-1 ring-violet-400 text-white shadow-md'
                          : 'bg-black/40 border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="text-xl shrink-0 mt-0.5">📁</div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{isAr ? 'مكتبة القسم فقط' : 'Category Library Only'}</span>
                          {!reviewIsFeatured && (
                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">
                          {isAr
                            ? 'يظهر فقط داخل أرشيف وتصنيف القسم الخاص به'
                            : 'Appears exclusively within its category hub library'}
                        </div>
                      </div>
                    </button>

                    {/* Option 2: Home Feed + Category Library */}
                    <button
                      type="button"
                      onClick={() => setReviewIsFeatured(true)}
                      className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                        reviewIsFeatured
                          ? 'bg-amber-950/50 border-amber-400 ring-1 ring-amber-400 text-white shadow-md'
                          : 'bg-black/40 border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="text-xl shrink-0 mt-0.5">⭐</div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <span>{isAr ? 'الواجهة الرئيسية + مكتبة القسم (برومبت مميز)' : 'Home Feed + Category Library (Featured)'}</span>
                          {reviewIsFeatured && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">
                          {isAr
                            ? 'يظهر في صفحة البداية الرئيسية لجميع الزوار + مكتبة القسم'
                            : 'Featured on the home page feed and in its category hub'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection Reason Textarea (Only when Rejected is selected) */}
              {reviewStatus === 'rejected' && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 animate-in fade-in">
                  <label className="text-xs font-bold text-rose-300 block">
                    {isAr ? 'سبب الرفض (سيظهر للمستخدم لتعديله):' : 'Rejection Reason (will be shown to creator):'}
                  </label>
                  <textarea
                    rows={3}
                    value={reviewRejectionReason}
                    onChange={(e) => setReviewRejectionReason(e.target.value)}
                    placeholder={
                      isAr
                        ? 'اكتب سبب الرفض بوضوح (مثال: الصورة غير مطابقة للبرومبت، أو الكلمات غير دقيقة...)'
                        : 'Explain reason for rejection clearly to help the user revise...'
                    }
                    className="w-full p-3 rounded-xl bg-black/60 border border-rose-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 resize-none font-sans"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Modal Footer / Save Action */}
            <div className="px-5 py-4 border-t border-white/10 bg-[#13141f] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                disabled={isSavingReview}
                onClick={() => setReviewPrompt(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={isSavingReview}
                onClick={handleSaveReviewStatus}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 min-h-[42px]"
              >
                {isSavingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {reviewStatus === 'approved'
                        ? (isAr ? '🚀 قبول ونشر في المنصة' : '🚀 Approve & Publish to Platform')
                        : (isAr ? '💾 حفظ وتحديد الحالة' : '💾 Save & Set Status')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
