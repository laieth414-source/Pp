import React, { useState } from 'react';
import {
  FileText,
  Bookmark,
  History,
  Plus,
  Globe,
  LogOut,
  Copy,
  Check,
  Trash2,
  Edit3,
  ExternalLink,
  Lock,
  Sparkles,
  Eye,
  AlertTriangle,
  Menu,
  X,
  Heart,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Language, PromptItem, HubCategory } from '../types';
import type { FirebaseUser } from '../lib/firebase';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';

interface UserWorkspaceProps {
  currentUser: FirebaseUser;
  prompts: PromptItem[];
  categories: HubCategory[];
  lang: Language;
  onOpenSubmitModal: () => void;
  onBackToFeed: () => void;
  onLogout: () => void;
  onUpdatePrompts: (prompts: PromptItem[]) => void;
  onSelectPrompt: (prompt: PromptItem) => void;
  onTriggerToast: (msg: string) => void;
}

type TabType = 'my_prompts' | 'saved' | 'history';

export const UserWorkspace: React.FC<UserWorkspaceProps> = ({
  currentUser,
  prompts,
  categories,
  lang,
  onOpenSubmitModal,
  onBackToFeed,
  onLogout,
  onUpdatePrompts,
  onSelectPrompt,
  onTriggerToast,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<TabType>('my_prompts');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editPromptTitle, setEditPromptTitle] = useState('');
  const [editPromptText, setEditPromptText] = useState('');

  // Local storage copy history
  const [copyHistory, setCopyHistory] = useState<Array<{ id: string; title: string; text: string; copiedAt: string }>>(() => {
    try {
      const stored = localStorage.getItem('sawihaa_copy_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // User's own created prompts (matching uid, email, or demo author)
  const userIdentifier = currentUser.uid;
  const userEmail = currentUser.email || '';
  const myPrompts = prompts.filter((p) => {
    return (
      p.creator?.id === userIdentifier ||
      p.creator?.handle?.toLowerCase().includes(userEmail.split('@')[0].toLowerCase()) ||
      p.creator?.name === currentUser.displayName ||
      (currentUser.email === 'laieth772@gmail.com' && (p.creator?.id?.includes('laieth') || p.id.startsWith('user-p-') || p.id.startsWith('admin-p-')))
    );
  });

  // Saved / Bookmarked prompts
  const savedPrompts = prompts.filter((p) => p.isSaved);

  // Quick stats
  const totalLikes = myPrompts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const totalSavedCount = savedPrompts.length;

  const handleCopy = async (promptItem: PromptItem) => {
    navigator.clipboard.writeText(promptItem.promptText);
    setCopiedId(promptItem.id);
    setTimeout(() => setCopiedId(null), 2000);

    // Increment local state optimistically
    onUpdatePrompts(
      prompts.map((p) =>
        p.id === promptItem.id ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p
      )
    );

    // Real Firestore counter increment
    try {
      await updateDoc(doc(db, 'prompts', promptItem.id), {
        copyCount: increment(1),
      });
    } catch (e) {
      console.warn('Workspace copy increment error:', e);
    }

    // Add to copy history
    const entry = {
      id: promptItem.id,
      title: promptItem.titleAr || promptItem.titleEn,
      text: promptItem.promptText,
      copiedAt: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedHistory = [entry, ...copyHistory.filter((item) => item.text !== promptItem.promptText)].slice(0, 30);
    setCopyHistory(updatedHistory);
    try {
      localStorage.setItem('sawihaa_copy_history', JSON.stringify(updatedHistory));
    } catch {}

    onTriggerToast(isAr ? 'تم نسخ البرومبت بنجاح! ✓' : 'Prompt copied to clipboard! ✓');
  };

  // Track which rejected prompts have their reason banner expanded
  const [expandedRejectionIds, setExpandedRejectionIds] = useState<Record<string, boolean>>({});

  const toggleRejectionDetails = (id: string) => {
    setExpandedRejectionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (promptId: string) => {
    const updated = prompts.filter((p) => p.id !== promptId);
    onUpdatePrompts(updated);
    onTriggerToast(isAr ? 'تم حذف البرومبت بنجاح 🗑️' : 'Prompt deleted 🗑️');
    try {
      await deleteDoc(doc(db, 'prompts', promptId));
    } catch (err) {
      console.warn('Firestore delete:', err);
    }
  };

  const handleStartEdit = (prompt: PromptItem) => {
    setEditingPromptId(prompt.id);
    setEditPromptTitle(prompt.titleAr || prompt.titleEn);
    setEditPromptText(prompt.promptText);
  };

  const handleSaveEdit = async (promptId: string) => {
    if (!editPromptTitle.trim() || !editPromptText.trim()) return;

    const target = prompts.find((p) => p.id === promptId);
    const wasRejected = target?.status === 'rejected';
    const newStatus = wasRejected ? 'pending' : (target?.status || 'approved');

    const updated = prompts.map((p) => {
      if (p.id === promptId) {
        return {
          ...p,
          titleAr: editPromptTitle.trim(),
          titleEn: editPromptTitle.trim(),
          promptText: editPromptText.trim(),
          status: newStatus as any,
          rejectionReason: wasRejected ? undefined : p.rejectionReason,
        };
      }
      return p;
    });

    onUpdatePrompts(updated);
    setEditingPromptId(null);
    onTriggerToast(
      wasRejected
        ? (isAr ? 'تم حفظ التعديل وإعادة إرسال البرومبت للمراجعة بنجاح! 🟡' : 'Edited and resubmitted for review! 🟡')
        : (isAr ? 'تم حفظ التعديلات بنجاح! 💾' : 'Modifications saved! 💾')
    );

    try {
      await updateDoc(doc(db, 'prompts', promptId), {
        titleAr: editPromptTitle.trim(),
        titleEn: editPromptTitle.trim(),
        promptText: editPromptText.trim(),
        status: newStatus,
        rejectionReason: wasRejected ? null : (target?.rejectionReason || null),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.warn('Firestore edit update:', err);
    }
  };

  // Rejection reason display modal / alert
  const [rejectionModalReason, setRejectionModalReason] = useState<string | null>(null);

  // Status Badge Helper with standardized exact colors
  const renderStatusBadge = (prompt: PromptItem) => {
    const status = prompt.status || 'approved';

    if (status === 'private') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
          <Lock className="w-3 h-3 text-violet-400" />
          <span>{isAr ? 'خاص بحسابك' : 'Private Vault'}</span>
        </span>
      );
    }

    if (status === 'pending' || (status as string) === 'under_review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span>{isAr ? '🟡 قيد المراجعة' : '🟡 Under Review'}</span>
        </span>
      );
    }

    if (status === 'rejected') {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleRejectionDetails(prompt.id);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
          title={isAr ? 'انقر لعرض سبب الرفض وإعادة الإرسال' : 'Click to view rejection reason'}
        >
          <span>{isAr ? '🔴 مرفوض' : '🔴 Rejected'}</span>
        </button>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span>{isAr ? '🟢 مقبول' : '🟢 Approved'}</span>
      </span>
    );
  };

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || (isAr ? 'مبدع سَوّيها' : 'Creator');
  const displayEmail = currentUser.email || '';
  const avatarLetter = (displayName[0] || 'U').toUpperCase();

  // Sidebar Component for Desktop & Mobile Drawer
  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="relative shrink-0">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-500/60 p-0.5"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-base font-bold text-white ring-2 ring-violet-500/60">
                {avatarLetter}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0a0b10]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white truncate">{displayName}</h3>
            </div>
            <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">{displayEmail}</p>
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600/20 text-violet-300 border border-violet-500/30">
                <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                <span>{isAr ? 'صانع محتوى' : 'Creator'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action: High-end Obsidian Pill Button */}
        <button
          onClick={() => {
            setIsMobileSidebarOpen(false);
            onOpenSubmitModal();
          }}
          className="w-full px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-98 border border-violet-400/40 shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
        >
          <Plus className="w-4 h-4 text-violet-200" />
          <span>{isAr ? '➕ نشر برومبت جديد' : '➕ Submit New Prompt'}</span>
        </button>

        {/* Nav Items with Active State */}
        <nav className="space-y-1.5 pt-2">
          <button
            onClick={() => {
              setActiveTab('my_prompts');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'my_prompts'
                ? 'bg-violet-600/20 border border-violet-500/40 text-violet-200 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className={`w-4 h-4 ${activeTab === 'my_prompts' ? 'text-violet-400' : 'text-slate-500'}`} />
              <span>{isAr ? 'برومبتاتي' : 'My Prompts'}</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'my_prompts' ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {myPrompts.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('saved');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'saved'
                ? 'bg-violet-600/20 border border-violet-500/40 text-violet-200 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'text-violet-400' : 'text-slate-500'}`} />
              <span>{isAr ? 'المحفوظات والمفضلة' : 'Saved Vault'}</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'saved' ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {savedPrompts.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'history'
                ? 'bg-violet-600/20 border border-violet-500/40 text-violet-200 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-violet-400' : 'text-slate-500'}`} />
              <span>{isAr ? 'سجل النسخ الأخير' : 'Copy History'}</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'history' ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {copyHistory.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-4 border-t border-white/5">
        <button
          onClick={() => {
            setIsMobileSidebarOpen(false);
            onBackToFeed();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all cursor-pointer min-h-[42px]"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" />
            <span>{isAr ? '🌐 تصفح المنصة العامة' : '🌐 Explore Public Feed'}</span>
          </div>
          <ArrowRight className={`w-3.5 h-3.5 text-slate-400 ${isAr ? 'rotate-180' : ''}`} />
        </button>

        <button
          onClick={() => {
            setIsMobileSidebarOpen(false);
            onLogout();
          }}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer min-h-[42px]"
        >
          <LogOut className="w-4 h-4" />
          <span>{isAr ? '🚪 تسجيل الخروج' : 'Log Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f8fafc] flex flex-col md:flex-row relative">
      {/* Mobile Top App Bar (md:hidden) */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0a0b10] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Open workspace menu"
          >
            <Menu className="w-5 h-5 text-violet-300" />
          </button>
          <div>
            <span className="text-xs text-slate-400 block">{isAr ? 'مساحة العمل' : 'Workspace'}</span>
            <span className="text-sm font-bold text-white">{displayName}</span>
          </div>
        </div>

        <button
          onClick={onBackToFeed}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-violet-400" />
          <span>{isAr ? 'الرئيسية' : 'Home'}</span>
        </button>
      </div>

      {/* Desktop Fixed Obsidian Right Sidebar (md:flex) */}
      <aside
        className="hidden md:flex w-64 bg-[#0a0b10] border-l border-white/5 min-h-screen p-5 shrink-0 flex-col justify-between sticky top-0 h-screen"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Slide-out Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end bg-black/80 animate-in fade-in duration-200">
          <div
            className="w-72 max-w-[85vw] h-full bg-[#0a0b10] border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl relative"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-8 h-full">{renderSidebarContent()}</div>
          </div>
        </div>
      )}

      {/* Main Workspace Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl overflow-y-auto">
        {/* Top Header Row with Return Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {activeTab === 'my_prompts' && (isAr ? 'إدارة برومبتاتي' : 'My Prompts Management')}
                {activeTab === 'saved' && (isAr ? 'المحفوظات والمفضلة' : 'Saved Prompts Vault')}
                {activeTab === 'history' && (isAr ? 'سجل النسخ الأخير' : 'Recent Copy History')}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {activeTab === 'my_prompts' && (isAr ? 'تتبع حالات النشر، التعديل، والمشاركات الخاصة بك.' : 'Monitor submission states, edit, and manage prompts.')}
              {activeTab === 'saved' && (isAr ? 'البرومبتات التي قمت بحفظها للرجوع إليها سريعاً في أي وقت.' : 'Prompts you have bookmarked for quick access.')}
              {activeTab === 'history' && (isAr ? 'أحدث البرومبتات التي نسختها للعمل بها في الذكاء الاصطناعي.' : 'Prompts recently copied to your clipboard.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToFeed}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-violet-400" />
              <span>{isAr ? 'تصفح المنصة العامة' : 'Public Feed'}</span>
            </button>
            <button
              onClick={onOpenSubmitModal}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'أضف برومبت' : 'Add Prompt'}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Top Quick Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
          <div className="p-4 rounded-2xl bg-[#12131b] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{isAr ? 'عدد المنشورات' : 'My Submissions'}</p>
              <p className="text-2xl font-black font-mono text-white mt-1">{myPrompts.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12131b] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{isAr ? 'إجمالي الإعجابات' : 'Total Likes'}</p>
              <p className="text-2xl font-black font-mono text-rose-400 mt-1">{totalLikes}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12131b] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{isAr ? 'المحفوظات بالمفضلة' : 'Saved Prompts'}</p>
              <p className="text-2xl font-black font-mono text-amber-400 mt-1">{totalSavedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab 1: My Prompts Management Grid */}
        {activeTab === 'my_prompts' && (
          <div>
            {myPrompts.length === 0 ? (
              /* Elegant Dark Placeholder Empty State */
              <div className="p-12 sm:p-16 rounded-2xl bg-[#12131b] border border-white/10 text-center space-y-4 my-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {isAr ? 'لا توجد برومبتات مضافة حالياً. ابدأ بإضافة أول برومبت الآن!' : 'No prompts added yet. Start by adding your first prompt now!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                    {isAr ? 'شارك أول إبداع لك مع مجتمع الذكاء الاصطناعي بدقة سينمائية متناهية!' : 'Share your first prompt creation with the AI community!'}
                  </p>
                </div>
                <button
                  onClick={onOpenSubmitModal}
                  className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'ابدأ الآن بنشر برومبت جديد' : 'Submit First Prompt'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPrompts.map((prompt) => {
                  const cat = categories.find((c) => c.id === prompt.hubId);
                  const isEditing = editingPromptId === prompt.id;

                  return (
                    <div
                      key={prompt.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#12131b] border border-white/10 hover:border-violet-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      {/* Top Header: Image, Title, Status */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {prompt.imageUrl ? (
                              <img
                                src={prompt.imageUrl}
                                alt={prompt.titleAr}
                                className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-xl shrink-0">
                                🎨
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-white truncate">
                                {prompt.titleAr || prompt.titleEn}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                <span className="text-violet-300 font-semibold">{cat ? (isAr ? cat.titleAr : cat.titleEn) : prompt.hubId}</span>
                                <span>•</span>
                                <span className="font-mono">{prompt.model}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0">{renderStatusBadge(prompt)}</div>
                        </div>

                        {/* Friendly Rejection Banner & Resubmit Action */}
                        {prompt.status === 'rejected' && (
                          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2.5 animate-in fade-in">
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-rose-300">
                                    {isAr ? 'سبب الرفض من الإدارة:' : 'Admin Rejection Reason:'}
                                  </span>
                                  <span className="text-[10px] text-rose-400 font-mono shrink-0">
                                    {isAr ? 'يتطلب تعديل' : 'Revision required'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-rose-500/20 font-sans">
                                  {prompt.rejectionReason || (isAr ? 'لم يحدد المشرف سبباً تفصيلياً، يرجى مراجعة صياغة البرومبت والتأكد من وضوح الصورة ثم إعادة الإرسال.' : 'No detailed reason specified. Please refine your prompt and resubmit.')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-500/20">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(prompt);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-rose-300" />
                                <span>{isAr ? 'تعديل البرومبت وإعادة الإرسال للمراجعة ✏️' : 'Edit & Resubmit for Review ✏️'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Inline Edit Form or Prompt Text */}
                        {isEditing ? (
                          <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-violet-500/40 animate-in fade-in">
                            <input
                              type="text"
                              value={editPromptTitle}
                              onChange={(e) => setEditPromptTitle(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                              placeholder={isAr ? 'العنوان' : 'Title'}
                            />
                            <textarea
                              rows={3}
                              value={editPromptText}
                              onChange={(e) => setEditPromptText(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingPromptId(null)}
                                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                              <button
                                onClick={() => handleSaveEdit(prompt.id)}
                                className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white"
                              >
                                {isAr ? 'حفظ' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs font-mono text-slate-300 line-clamp-3 leading-relaxed break-words">
                            {prompt.promptText}
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                        <div className="flex items-center gap-3 text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            <span>{prompt.likes || 0}</span>
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                            <span>{prompt.saves || 0}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* 1-Click Copy */}
                          <button
                            onClick={() => handleCopy(prompt)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title={isAr ? 'نسخ البرومبت' : 'Copy prompt'}
                          >
                            {copiedId === prompt.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(prompt)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title={isAr ? 'تعديل البرومبت' : 'Edit prompt'}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title={isAr ? 'حذف البرومبت' : 'Delete prompt'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved / Bookmarked Prompts Grid */}
        {activeTab === 'saved' && (
          <div>
            {savedPrompts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#12131b] border border-white/10 space-y-3">
                <Bookmark className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'لا توجد عناصر محفوظة بعد' : 'No saved prompts yet'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isAr ? 'انقر على أيقونة الإشارة المرجعية (🔖) في أي برومبت بالمنصة لحفظه والرجوع إليه هنا في أي وقت.' : 'Bookmark prompts from the feed to view them here.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    onClick={() => onSelectPrompt(prompt)}
                    className="p-4 rounded-2xl bg-[#12131b] border border-white/10 hover:border-violet-500/30 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      {prompt.imageUrl && (
                        <img
                          src={prompt.imageUrl}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{prompt.titleAr || prompt.titleEn}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{prompt.model}</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs font-mono text-slate-300 line-clamp-2">
                      {prompt.promptText}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <span className="text-slate-400">{prompt.creator?.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(prompt);
                        }}
                        className="px-3 py-1 rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isAr ? 'نسخ' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Copy History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {copyHistory.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#12131b] border border-white/10 space-y-3">
                <History className="w-10 h-10 text-violet-400 mx-auto" />
                <h3 className="text-base font-bold text-white">{isAr ? 'سجل النسخ فارغ' : 'Copy history is empty'}</h3>
                <p className="text-xs text-slate-400">{isAr ? 'كلما قمت بنسخ برومبت، سيتم حفظه هنا للرجوع إليه.' : 'Copied prompts will be logged here.'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-xs text-slate-400">{isAr ? 'آخر العناصر المنسوخة:' : 'Recent copies:'}</span>
                  <button
                    onClick={() => {
                      setCopyHistory([]);
                      try {
                        localStorage.removeItem('sawihaa_copy_history');
                      } catch {}
                      onTriggerToast(isAr ? 'تم مسح سجل النسخ' : 'History cleared');
                    }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    {isAr ? 'مسح السجل' : 'Clear history'}
                  </button>
                </div>
                {copyHistory.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-[#12131b] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{item.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">{item.copiedAt}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 truncate mt-1">{item.text}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.text);
                        onTriggerToast(isAr ? 'تم إعادة النسخ بنجاح!' : 'Re-copied!');
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-violet-300 hover:text-white transition-colors shrink-0"
                      title={isAr ? 'إعادة النسخ' : 'Copy again'}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rejection Reason Modal */}
      {rejectionModalReason && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none"
          onClick={() => setRejectionModalReason(null)}
        >
          <div
            className="p-6 rounded-2xl bg-[#13141c] border border-rose-500/30 max-w-md w-full space-y-4 shadow-xl text-start"
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold">{isAr ? 'سبب رفض طلب النشر' : 'Rejection Reason'}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
              {rejectionModalReason}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRejectionModalReason(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
