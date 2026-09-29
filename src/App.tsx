/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Sparkles, Cloud, CloudOff } from 'lucide-react';
import { Language, PromptItem, HubCategory, SiteSettings, AdminUser } from './types';
import { PROMPTS_DATA } from './data/promptsData';
import { CATEGORY_HUBS } from './data/hubsData';
import { DEFAULT_SITE_SETTINGS } from './data/defaultSettings';
import { INITIAL_ADMIN_USERS } from './data/mockUsers';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ShowcaseHero, ModelFilter } from './components/ShowcaseHero';
import { CategoryPillsBar, CategoryPillId } from './components/CategoryPillsBar';
import { PublicPromptsGrid } from './components/PublicPromptsGrid';
import { Footer } from './components/Footer';
import { PromptDetailModal } from './components/PromptDetailModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { SubmitPromptModal } from './components/SubmitPromptModal';
import { CategoryHubsGrid } from './components/CategoryHubsGrid';
import { CategoryHubView } from './components/CategoryHubView';
import { LatestHighlights } from './components/LatestHighlights';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthGateModal } from './components/AdminAuthGateModal';
import { UnauthorizedDomainModal } from './components/UnauthorizedDomainModal';
import { UserWorkspace } from './components/UserWorkspace';
import {
  auth,
  db,
  onAuthStateChanged,
  type FirebaseUser,
  loginWithGoogle,
  logoutUser,
  subscribeToPrompts,
  savePromptToFirestore,
  updatePromptInFirestore,
  deletePromptFromFirestore,
  subscribeToUsers,
  saveUserToFirestore,
  deleteUserFromFirestore,
  subscribeToSiteSettings,
  saveSiteSettingsToFirestore,
  subscribeToCategories,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveCategoriesToFirestore,
  seedInitialDataIfEmpty,
  testFirebaseConnection,
  purgeMockDataFromFirestore,
} from './lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');

  // Firebase Realtime State & Local fallback
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('sawihaa_site_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  });

  const [categories, setCategories] = useState<HubCategory[]>(() => {
    try {
      const saved = localStorage.getItem('sawihaa_categories');
      return saved ? JSON.parse(saved) : CATEGORY_HUBS;
    } catch {
      return CATEGORY_HUBS;
    }
  });

  const [prompts, setPrompts] = useState<PromptItem[]>(() => {
    try {
      const saved = localStorage.getItem('sawihaa_prompts');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const cleaned = parsed.filter(
        (p) =>
          !p.id?.startsWith('p-') &&
          !p.id?.startsWith('p1') &&
          !p.id?.startsWith('p2') &&
          !p.id?.startsWith('p3') &&
          p.creator?.handle !== '@laith_ai' &&
          p.creator?.handle !== '@ahmed_uiux' &&
          p.creator?.handle !== '@sara_cyber'
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('sawihaa_prompts', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  });

  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('sawihaa_admin_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current Firebase Authenticated User
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Admin Authentication Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sawihaa_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminAuthGateOpen, setIsAdminAuthGateOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);

  // Navigation and UI state
  type ActiveView = 'public' | 'user_dashboard';
  const [currentView, setCurrentView] = useState<ActiveView>('public');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [activeHubId, setActiveHubId] = useState<string | null>(null);
  const [isUserWorkspaceOpen, setIsUserWorkspaceOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'signup',
  });
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelFilter>('all');
  const [selectedCategoryPill, setSelectedCategoryPill] = useState<CategoryPillId>('all');
  const isInitialAuthHydration = useRef(true);

  // Seamless View Switch Helpers
  const switchToUserWorkspace = () => {
    setCurrentView('user_dashboard');
    setIsUserWorkspaceOpen(true);
    setActiveHubId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchToPublicFeed = () => {
    setCurrentView('public');
    setIsUserWorkspaceOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Firebase Auth listener with automatic redirection on sign-in
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      const isFreshSignIn = !currentUser && user && !isInitialAuthHydration.current;
      setCurrentUser(user);
      if (user) {
        // Auto grant admin gate if user email matches admin or role
        if (user.email === 'laieth772@gmail.com') {
          setIsAdminAuthenticated(true);
        }
        // Auto-redirect to User Workspace upon successful sign-in
        if (isFreshSignIn) {
          switchToUserWorkspace();
        }
      }
      isInitialAuthHydration.current = false;
    });

    return () => unsubscribeAuth();
  }, [currentUser]);

  // Listen for #admin route in URL
  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.hash === '#admin') {
        if (isAdminAuthenticated) {
          setIsAdminOpen(true);
        } else {
          setIsAdminAuthGateOpen(true);
        }
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, [isAdminAuthenticated]);

  // 2. Initial Firebase connectivity & seeding
  useEffect(() => {
    testFirebaseConnection().then((connected) => {
      setIsFirebaseConnected(connected);
      if (connected) {
        purgeMockDataFromFirestore().catch(() => {});
        seedInitialDataIfEmpty(CATEGORY_HUBS, DEFAULT_SITE_SETTINGS);
      }
    });
  }, []);

  // 3. Realtime Firestore Subscriptions
  useEffect(() => {
    const unsubPrompts = subscribeToPrompts(
      (firestorePrompts) => {
        if (Array.isArray(firestorePrompts)) {
          setPrompts(firestorePrompts);
          try {
            localStorage.setItem('sawihaa_prompts', JSON.stringify(firestorePrompts));
          } catch {}
        }
      },
      () => {
        // fallback gracefully to local
      }
    );

    const unsubCategories = subscribeToCategories(
      (firestoreCategories) => {
        if (firestoreCategories && firestoreCategories.length > 0) {
          setCategories(firestoreCategories);
          try {
            localStorage.setItem('sawihaa_categories', JSON.stringify(firestoreCategories));
          } catch {}
        }
      },
      () => {}
    );

    const unsubUsers = subscribeToUsers(
      (firestoreUsers) => {
        if (Array.isArray(firestoreUsers)) {
          setUsers(firestoreUsers);
          try {
            localStorage.setItem('sawihaa_admin_users', JSON.stringify(firestoreUsers));
          } catch {}
        }
      },
      () => {}
    );

    const unsubSettings = subscribeToSiteSettings(
      (firestoreSettings) => {
        if (firestoreSettings && firestoreSettings.branding) {
          setSiteSettings(firestoreSettings);
          try {
            localStorage.setItem('sawihaa_site_settings', JSON.stringify(firestoreSettings));
          } catch {}
        }
      },
      () => {}
    );

    return () => {
      unsubPrompts();
      unsubCategories();
      unsubUsers();
      unsubSettings();
    };
  }, []);

  // Sync html dir, lang, and document title seamlessly
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = `${siteSettings.branding.siteName} | ${siteSettings.branding.slogan}`;
  }, [lang, siteSettings.branding.siteName, siteSettings.branding.slogan]);

  // Persist platform state changes automatically to Firestore & LocalStorage
  const handleUpdateSiteSettings = async (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    try {
      localStorage.setItem('sawihaa_site_settings', JSON.stringify(newSettings));
      await saveSiteSettingsToFirestore(newSettings);
    } catch (e) {
      console.warn('Settings save warning:', e);
    }
  };

  const handleUpdateCategories = async (newCategories: HubCategory[]) => {
    const currentIds = new Set(newCategories.map((c) => c.id));
    for (const oldCat of categories) {
      if (!currentIds.has(oldCat.id)) {
        await deleteCategoryFromFirestore(oldCat.id).catch(() => {});
      }
    }
    for (const c of newCategories) {
      await saveCategoryToFirestore(c).catch(() => {});
    }

    setCategories(newCategories);
    try {
      localStorage.setItem('sawihaa_categories', JSON.stringify(newCategories));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  const handleUpdatePrompts = async (newPrompts: PromptItem[]) => {
    const currentIds = new Set(newPrompts.map((p) => p.id));
    // Detect deletions
    for (const oldPrompt of prompts) {
      if (!currentIds.has(oldPrompt.id)) {
        await deletePromptFromFirestore(oldPrompt.id).catch(() => {});
      }
    }
    // Detect adds/edits
    for (const p of newPrompts) {
      const old = prompts.find((x) => x.id === p.id);
      if (!old || JSON.stringify(old) !== JSON.stringify(p)) {
        await savePromptToFirestore(p).catch(() => {});
      }
    }

    setPrompts(newPrompts);
    try {
      localStorage.setItem('sawihaa_prompts', JSON.stringify(newPrompts));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  const handleUpdateUsers = async (newUsers: AdminUser[]) => {
    const currentIds = new Set(newUsers.map((u) => u.id));
    for (const oldUser of users) {
      if (!currentIds.has(oldUser.id)) {
        await deleteUserFromFirestore(oldUser.id).catch(() => {});
      }
    }
    for (const u of newUsers) {
      await saveUserToFirestore(u).catch(() => {});
    }

    setUsers(newUsers);
    try {
      localStorage.setItem('sawihaa_admin_users', JSON.stringify(newUsers));
    } catch (e) {
      console.warn('Users save warning:', e);
    }
  };

  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated || currentUser?.email === 'laieth772@gmail.com') {
      setIsAdminAuthenticated(true);
      setIsAdminOpen(true);
    } else {
      setIsAdminAuthGateOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      localStorage.setItem('sawihaa_admin_authenticated', 'true');
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
    setIsAdminAuthGateOpen(false);
    setIsAdminOpen(true);
    triggerToast(lang === 'ar' ? 'تم الدخول إلى منطقة الإدارة بنجاح! 🔓' : 'Admin unlocked successfully! 🔓');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('sawihaa_admin_authenticated');
    } catch (e) {
      console.warn('LocalStorage remove failed', e);
    }
    setIsAdminOpen(false);
    triggerToast(lang === 'ar' ? 'تم قفل لوحة الإدارة وتسجيل الخروج 🔒' : 'Admin panel locked and logged out 🔒');
  };

  const handleGoogleLoginDirect = async () => {
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
      switchToUserWorkspace();
      triggerToast(
        lang === 'ar'
          ? `مرحباً بك ${user.displayName || 'عزيزنا المبدع'}! تم الدخول ونقلك إلى مساحة عملك 🚀`
          : `Welcome ${user.displayName || 'Creator'}! Redirected to your workspace 🚀`
      );
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        setIsDomainModalOpen(true);
      } else if (err?.code !== 'auth/popup-closed-by-user') {
        triggerToast(lang === 'ar' ? 'تعذر إتمام الدخول بحساب Google' : 'Google login could not complete');
      }
    }
  };

  const handleContinueDemoUser = () => {
    const demoUser: any = {
      uid: 'demo-creator-laieth',
      displayName: 'ليث محمد (حساب تجريبي)',
      email: 'laieth772@gmail.com',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=laieth772',
    };
    setCurrentUser(demoUser);
    setIsAdminAuthenticated(true);
    switchToUserWorkspace();
    triggerToast(
      lang === 'ar'
        ? 'تم تفعيل جلسة المبدع والانتقال إلى مساحة العمل! يمكنك الآن تجربة كافة الميزات 🚀'
        : 'Demo creator session active! Redirected to your workspace 🚀'
    );
  };

  const handleLogoutFirebaseUser = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      switchToPublicFeed();
      triggerToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح 👋' : 'Logged out successfully 👋');
    } catch (err) {
      console.warn('Logout issue:', err);
      setCurrentUser(null);
      switchToPublicFeed();
    }
  };

  const handleResetAllDefaults = () => {
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    setCategories(CATEGORY_HUBS);
    setPrompts(PROMPTS_DATA);
    setUsers(INITIAL_ADMIN_USERS);
    try {
      localStorage.removeItem('sawihaa_site_settings');
      localStorage.removeItem('sawihaa_categories');
      localStorage.removeItem('sawihaa_prompts');
      localStorage.removeItem('sawihaa_admin_users');
    } catch (e) {
      console.warn('LocalStorage clear failed', e);
    }
    triggerToast(lang === 'ar' ? 'تمت استعادة كافة البيانات الافتراضية بنجاح! 🔄' : 'All defaults restored! 🔄');
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleCopyPrompt = async (promptOrText: PromptItem | string) => {
    let text = '';
    let promptId: string | null = null;
    if (typeof promptOrText === 'string') {
      text = promptOrText;
      const matched = prompts.find((p) => p.promptText === promptOrText);
      if (matched) promptId = matched.id;
    } else if (promptOrText && typeof promptOrText === 'object') {
      text = promptOrText.promptText;
      promptId = promptOrText.id;
    }

    if (text) {
      navigator.clipboard.writeText(text);
    }
    triggerToast(lang === 'ar' ? 'تم نسخ البرومبت بنجاح! ✓' : 'Prompt copied to clipboard! ✓');

    if (promptId) {
      // 1. Optimistic update to reflect dynamically in admin analytics without page reload
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p
        )
      );

      // 2. Real Firestore counter increment
      try {
        await updateDoc(doc(db, 'prompts', promptId), {
          copyCount: increment(1),
        });
      } catch (e) {
        console.warn('Firestore copyCount increment error:', e);
      }
    }
  };

  const handleSubmitNewPrompt = async (newPrompt: PromptItem) => {
    const isSubmittedByAdmin =
      newPrompt.status === 'approved' ||
      newPrompt.creator?.id === 'admin-master' ||
      Boolean(
        currentUser &&
        (currentUser.email === 'laieth772@gmail.com' ||
         currentUser.email?.includes('admin') ||
         users.some((u: AdminUser) => u.email === currentUser.email && u.role === 'admin'))
      );

    const finalStatus = isSubmittedByAdmin
      ? 'approved'
      : (newPrompt.status === 'private' ? 'private' : 'pending');
    const finalIsFeatured = isSubmittedByAdmin ? true : false;

    // If logged in, attach real user info
    const enrichedPrompt: PromptItem = {
      ...newPrompt,
      category: (newPrompt.category || 'بورتريه ووجوه').trim(),
      status: finalStatus,
      isFeatured: finalIsFeatured,
      featured: finalIsFeatured,
      creator: currentUser
        ? {
            id: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Member',
            handle: `@${currentUser.email?.split('@')[0] || 'member'}`,
            avatar: currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
            badge: isSubmittedByAdmin ? '👑 مسؤول رسمي' : '⚡ عضو نشط',
            roleAr: isSubmittedByAdmin ? 'إدارة رسمية' : 'صانع محتوى',
            roleEn: isSubmittedByAdmin ? 'Admin' : 'Prompt Creator',
            promptCount: 1,
            followers: 1,
            verified: true,
          }
        : newPrompt.creator,
    };

    // Optimistic update
    const updated = [enrichedPrompt, ...prompts];
    setPrompts(updated);
    try {
      localStorage.setItem('sawihaa_prompts', JSON.stringify(updated));
    } catch {}

    if (finalStatus === 'approved') {
      triggerToast(lang === 'ar' ? 'تم نشر البرومبت فورياً وبنجاح! 🚀' : 'Prompt published immediately! 🚀');
    } else if (finalStatus === 'private') {
      triggerToast(lang === 'ar' ? 'تم حفظ البرومبت في حسابك الشخصي 🔒' : 'Prompt saved to your private library 🔒');
    } else {
      triggerToast(
        lang === 'ar'
          ? 'تم إرسال البرومبت بنجاح! سينشر في الصفحة الرئيسية بعد موافقة الإدارة ⏳'
          : 'Prompt submitted for review! It will be published upon approval ⏳'
      );
    }

    // Permanent Firestore Write asynchronously
    try {
      await savePromptToFirestore(enrichedPrompt);
    } catch (err) {
      console.warn('Firestore prompt write error:', err);
      triggerToast(lang === 'ar' ? 'تم الحفظ محلياً وجاري المزامنة...' : 'Saved locally, syncing...');
    }

    if (newPrompt.hubId) {
      setActiveHubId(newPrompt.hubId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let targetPrompt: PromptItem | undefined;
    const updated = prompts.map((item) => {
      if (item.id === id) {
        const isLiked = !item.isLiked;
        const newItem = {
          ...item,
          isLiked,
          likes: isLiked ? item.likes + 1 : item.likes - 1,
        };
        targetPrompt = newItem;
        return newItem;
      }
      return item;
    });
    setPrompts(updated);
    try {
      localStorage.setItem('sawihaa_prompts', JSON.stringify(updated));
    } catch {}

    if (targetPrompt) {
      updatePromptInFirestore(id, {
        likes: targetPrompt.likes,
      }).catch(() => {});
    }
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let targetPrompt: PromptItem | undefined;
    const updated = prompts.map((item) => {
      if (item.id === id) {
        const isSaved = !item.isSaved;
        const newItem = {
          ...item,
          isSaved,
          saves: isSaved ? item.saves + 1 : item.saves - 1,
        };
        targetPrompt = newItem;
        return newItem;
      }
      return item;
    });
    setPrompts(updated);
    try {
      localStorage.setItem('sawihaa_prompts', JSON.stringify(updated));
    } catch {}

    if (targetPrompt) {
      updatePromptInFirestore(id, {
        saves: targetPrompt.saves,
      }).catch(() => {});
    }
  };

  const handleSearchTrigger = (query: string) => {
    setIsSearchOpen(true);
  };

  const handleSelectTag = (tag: string) => {
    setIsSearchOpen(true);
  };

  const handleExploreClick = () => {
    const el = document.getElementById('categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter prompts for public Home Feed:
  // Prompts show on Home if explicitly featured OR if isFeatured is undefined (legacy backward-compatibility)
  const publicPrompts = prompts.filter((p) => {
    const isApproved = p.status === 'approved' || p.status === undefined;
    const isHomeVisible = p.isFeatured === true || p.isFeatured === undefined;
    return isApproved && isHomeVisible;
  });

  // Real-time Category Counts for the pills bar
  const categoryCounts: Record<string, number> = {
    all: publicPrompts.length,
    'بورتريه ووجوه': 0,
    'سينمائي ودرامي': 0,
    'أنمي وفانتازيا': 0,
    'تصميم تجاري': 0,
    'شخصيات 3D': 0,
    'سايبربانك وخيال علمي': 0,
    'برمجة وكود': 0,
  };

  publicPrompts.forEach((p) => {
    const c = p.category || '';
    if (categoryCounts[c] !== undefined) {
      categoryCounts[c]++;
    } else {
      const h = (p.hubId || '').toLowerCase();
      const catLower = c.toLowerCase();
      if (h === 'portrait' || catLower.includes('بورتريه') || catLower.includes('portrait')) categoryCounts['بورتريه ووجوه']++;
      else if (h === 'cinematic' || catLower.includes('سينما') || catLower.includes('cinematic')) categoryCounts['سينمائي ودرامي']++;
      else if (h === 'anime' || catLower.includes('أنمي') || catLower.includes('anime')) categoryCounts['أنمي وفانتازيا']++;
      else if (catLower.includes('تجاري') || catLower.includes('commercial')) categoryCounts['تصميم تجاري']++;
      else if (h === '3d' || h === '3d-design' || catLower.includes('3d') || catLower.includes('ثلاثي')) categoryCounts['شخصيات 3D']++;
      else if (h === 'cyberpunk' || catLower.includes('سايبر') || catLower.includes('cyber')) categoryCounts['سايبربانك وخيال علمي']++;
      else if (h === 'code-dev' || h === 'code' || catLower.includes('برمج') || catLower.includes('كود') || catLower.includes('code')) categoryCounts['برمجة وكود']++;
    }
  });

  // Filtered Public Prompts for High-Performance Showcase
  const filteredPublicPrompts = publicPrompts.filter((prompt) => {
    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle =
        prompt.titleAr?.toLowerCase().includes(q) ||
        prompt.titleEn?.toLowerCase().includes(q);
      const matchesPrompt = prompt.promptText?.toLowerCase().includes(q);
      const matchesModel = prompt.model?.toLowerCase().includes(q);
      const matchesAuthor = prompt.creator?.name?.toLowerCase().includes(q);
      const matchesTags = prompt.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesPrompt && !matchesModel && !matchesAuthor && !matchesTags) {
        return false;
      }
    }

    // 2. Model Filter
    if (selectedModel !== 'all') {
      const m = selectedModel.toLowerCase();
      if (!prompt.model?.toLowerCase().includes(m)) {
        return false;
      }
    }

    // 3. Category Pill Filter
    const activeCategory = (selectedCategoryPill || 'الكل').trim();
    if (activeCategory !== 'all' && activeCategory !== 'الكل') {
      if (prompt.category?.trim() === activeCategory) {
        return true;
      }

      // Backward compatibility matching with hubId or legacy category string
      const hubId = (prompt.hubId || '').toLowerCase();
      const pCat = (prompt.category || '').toLowerCase();
      if (activeCategory === 'بورتريه ووجوه' && (hubId === 'portrait' || pCat.includes('بورتريه') || pCat.includes('portrait'))) return true;
      if (activeCategory === 'سينمائي ودرامي' && (hubId === 'cinematic' || pCat.includes('سينما') || pCat.includes('cinematic'))) return true;
      if (activeCategory === 'أنمي وفانتازيا' && (hubId === 'anime' || pCat.includes('أنمي') || pCat.includes('anime'))) return true;
      if (activeCategory === 'تصميم تجاري' && (pCat.includes('تجاري') || pCat.includes('commercial'))) return true;
      if (activeCategory === 'شخصيات 3D' && (hubId === '3d' || hubId === '3d-design' || pCat.includes('3d') || pCat.includes('ثلاثي'))) return true;
      if (activeCategory === 'سايبربانك وخيال علمي' && (hubId === 'cyberpunk' || pCat.includes('سايبر') || pCat.includes('cyber'))) return true;
      if (activeCategory === 'برمجة وكود' && (hubId === 'code-dev' || hubId === 'code' || pCat.includes('برمج') || pCat.includes('كود') || pCat.includes('code'))) return true;

      return false;
    }

    return true;
  });

  // Dynamic Theme Palette Map
  const ACCENT_COLORS: Record<string, { primary: string; hover: string; border: string }> = {
    violet: { primary: '#8b5cf6', hover: '#7c3aed', border: 'rgba(139, 92, 246, 0.4)' },
    cyber_blue: { primary: '#0ea5e9', hover: '#0284c7', border: 'rgba(14, 165, 233, 0.4)' },
    neon_green: { primary: '#10b981', hover: '#059669', border: 'rgba(16, 185, 129, 0.4)' },
    fire_red: { primary: '#ef4444', hover: '#dc2626', border: 'rgba(239, 68, 68, 0.4)' },
    gold: { primary: '#f59e0b', hover: '#d97706', border: 'rgba(245, 158, 11, 0.4)' },
    crystal_white: { primary: '#f8fafc', hover: '#e2e8f0', border: 'rgba(248, 250, 252, 0.4)' },
  };

  const BG_COLORS: Record<string, string> = {
    obsidian: '#090a0f',
    deep_navy: '#060b17',
  };

  useEffect(() => {
    const accent = ACCENT_COLORS[siteSettings.theme?.accentColor || 'violet'] || ACCENT_COLORS.violet;
    const bg = BG_COLORS[siteSettings.theme?.bgColor || 'obsidian'] || BG_COLORS.obsidian;
    document.documentElement.style.setProperty('--color-brand-primary', accent.primary);
    document.documentElement.style.setProperty('--color-brand-hover', accent.hover);
    document.documentElement.style.setProperty('--color-brand-border', accent.border);
    document.documentElement.style.setProperty('--color-app-bg', bg);
  }, [siteSettings.theme]);

  const currentBgColor = BG_COLORS[siteSettings.theme?.bgColor || 'obsidian'] || '#090a0f';

  return (
    <div
      className={`min-h-screen text-[#f8fafc] selection:bg-violet-600/30 selection:text-violet-200 transition-colors duration-200 ${lang === 'ar' ? 'font-cairo' : 'font-sans'}`}
      style={{ backgroundColor: currentBgColor }}
    >
      
      {/* Dynamic Announcement Top Bar */}
      <AnnouncementBar
        text={siteSettings.announcement.text}
        isEnabled={siteSettings.announcement.isEnabled}
        lang={lang}
      />

      {/* A. Clean Minimal Header */}
      <Navbar
        lang={lang}
        branding={siteSettings.branding}
        currentUser={currentUser}
        currentView={currentView}
        onLogoutUser={handleLogoutFirebaseUser}
        onGoogleLogin={handleGoogleLoginDirect}
        onOpenAuth={handleOpenAuth}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onOpenUserWorkspace={switchToUserWorkspace}
        onGoHome={switchToPublicFeed}
      />

      <main>
        {currentView === 'user_dashboard' && currentUser ? (
          /* User Workspace Dedicated Obsidian Dashboard */
          <UserWorkspace
            currentUser={currentUser}
            prompts={prompts}
            categories={categories}
            lang={lang}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onBackToFeed={switchToPublicFeed}
            onLogout={handleLogoutFirebaseUser}
            onUpdatePrompts={handleUpdatePrompts}
            onSelectPrompt={(p) => setSelectedPrompt(p)}
            onTriggerToast={triggerToast}
          />
        ) : activeHubId ? (
          /* B. Dedicated Category Hub View (Filtered strictly to this category) */
          <CategoryHubView
            hubId={activeHubId}
            categories={categories}
            prompts={publicPrompts}
            lang={lang}
            onBackToDirectory={() => {
              setActiveHubId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenDetail={(p) => setSelectedPrompt(p)}
            onToggleLike={handleToggleLike}
            onToggleSave={handleToggleSave}
            onCopyPrompt={handleCopyPrompt}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          />
        ) : (
          /* C. Clean, Minimalist & Fast Showcase Experience */
          <div className="animate-in fade-in duration-200">
            {/* 1. Streamlined Hero Section */}
            <ShowcaseHero
              lang={lang}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />

            {/* 2. Smooth Category Pills Bar */}
            <CategoryPillsBar
              lang={lang}
              selectedCategory={selectedCategoryPill}
              onSelectCategory={setSelectedCategoryPill}
              counts={categoryCounts}
            />

            {/* 3. Optimized Prompts Grid (High-Performance 60FPS) */}
            <PublicPromptsGrid
              prompts={filteredPublicPrompts}
              lang={lang}
              activeCategory={selectedCategoryPill}
              activeModel={selectedModel}
              onSelectPrompt={(p) => setSelectedPrompt(p)}
              onCopyPrompt={handleCopyPrompt}
              onResetFilters={() => {
                setSearchQuery('');
                setSelectedModel('all');
                setSelectedCategoryPill('all');
              }}
            />
          </div>
        )}
      </main>

      {/* Minimalist Obsidian Footer - hidden during immersive user workspace */}
      {!isUserWorkspaceOpen && (
        <Footer
          lang={lang}
          branding={siteSettings.branding}
          footerSettings={siteSettings.footer}
          onOpenAdmin={handleOpenAdminTrigger}
        />
      )}

      {/* Interactive Modals */}
      <PromptDetailModal
        prompt={selectedPrompt}
        allPrompts={publicPrompts}
        lang={lang}
        onClose={() => setSelectedPrompt(null)}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onSelectPrompt={(p) => setSelectedPrompt(p)}
        onOpenAuth={handleOpenAuth}
        onCopyPrompt={handleCopyPrompt}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        prompts={publicPrompts}
        lang={lang}
        onSelectPrompt={(p) => setSelectedPrompt(p)}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        lang={lang}
        onAuthSuccess={(user) => {
          if (user) setCurrentUser(user);
          switchToUserWorkspace();
          triggerToast(
            lang === 'ar'
              ? `مرحباً بك ${user?.displayName || user?.email?.split('@')[0] || 'عزيزنا المبدع'}! تم الدخول ونقلك إلى مساحة عملك 🚀`
              : `Welcome ${user?.displayName || 'back'}! Redirected to your workspace 🚀`
          );
        }}
        onOpenAdminAuth={handleOpenAdminTrigger}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        lang={lang}
      />

      <SubmitPromptModal
        isOpen={isSubmitModalOpen}
        lang={lang}
        initialHubId={activeHubId}
        categories={categories}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitPrompt={handleSubmitNewPrompt}
      />

      {/* Admin Authentication Security Gate Modal */}
      <AdminAuthGateModal
        isOpen={isAdminAuthGateOpen}
        lang={lang}
        onClose={() => setIsAdminAuthGateOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Firebase Authorized Domain Helper Modal */}
      <UnauthorizedDomainModal
        isOpen={isDomainModalOpen}
        lang={lang}
        onClose={() => setIsDomainModalOpen(false)}
        onContinueDemo={handleContinueDemoUser}
      />

      {/* Complete Dynamic Master Admin Dashboard Modal with Live Firestore Data */}
      <AdminDashboard
        isOpen={isAdminOpen}
        lang={lang}
        siteSettings={siteSettings}
        categories={categories}
        prompts={prompts}
        users={users}
        onClose={() => setIsAdminOpen(false)}
        onLogout={handleAdminLogout}
        onUpdateSiteSettings={handleUpdateSiteSettings}
        onUpdateCategories={handleUpdateCategories}
        onUpdatePrompts={handleUpdatePrompts}
        onUpdateUsers={handleUpdateUsers}
        onResetAllDefaults={handleResetAllDefaults}
        onTriggerToast={triggerToast}
      />

      {/* Desktop Only: Bottom Sticky Status / Admin Pill Controls (Hidden completely on mobile) */}
      <div className="hidden md:flex fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 items-center gap-2.5">
        {/* Firebase Cloud Sync Badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#13141c] border border-white/10 text-[11px] text-[#94a3b8] shadow-md"
          title={isFirebaseConnected ? 'Firebase Firestore متصل بالسحابة' : 'Firebase Offline mode'}
        >
          <Cloud className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>{lang === 'ar' ? 'فايربيس: متصل' : 'Firebase: Live'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Desktop Quick Admin Toggle Button */}
        <button
          onClick={handleOpenAdminTrigger}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#13141c] hover:bg-[#1c1d29] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white shadow-md transition-all duration-200 cursor-pointer active:scale-95"
          title={lang === 'ar' ? 'لوحة تحكم وإدارة المنصة' : 'Admin CMS Control'}
        >
          <div className="w-4 h-4 rounded-full bg-white/[0.06] flex items-center justify-center">
            <Settings className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-xs font-semibold font-cairo">
            {lang === 'ar' ? 'الإدارة' : 'Admin'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAdminAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
        </button>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-[#1a1c29] border border-violet-500/40 text-[#f8fafc] px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 pointer-events-none select-none"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
