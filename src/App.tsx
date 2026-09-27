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
import {
  auth,
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
} from './lib/firebase';

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
      return saved ? JSON.parse(saved) : PROMPTS_DATA;
    } catch {
      return PROMPTS_DATA;
    }
  });

  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('sawihaa_admin_users');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
    } catch {
      return INITIAL_ADMIN_USERS;
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
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [activeHubId, setActiveHubId] = useState<string | null>(null);
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

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Auto grant admin gate if user email matches admin or role
        if (user.email === 'laieth772@gmail.com') {
          setIsAdminAuthenticated(true);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Initial Firebase connectivity & seeding
  useEffect(() => {
    testFirebaseConnection().then((connected) => {
      setIsFirebaseConnected(connected);
      if (connected) {
        seedInitialDataIfEmpty(PROMPTS_DATA, INITIAL_ADMIN_USERS, CATEGORY_HUBS, DEFAULT_SITE_SETTINGS);
      }
    });
  }, []);

  // 3. Realtime Firestore Subscriptions
  useEffect(() => {
    const unsubPrompts = subscribeToPrompts(
      (firestorePrompts) => {
        if (firestorePrompts && firestorePrompts.length > 0) {
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
        if (firestoreUsers && firestoreUsers.length > 0) {
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
    if (isAdminAuthenticated) {
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
      triggerToast(
        lang === 'ar'
          ? `مرحباً بك ${user.displayName || 'عزيزنا المبدع'}! تم الدخول وحفظ حسابك بنجاح 🎉`
          : `Welcome ${user.displayName || 'Creator'}! Logged in & synced 🎉`
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
    triggerToast(
      lang === 'ar'
        ? 'تم تفعيل جلسة المبدع والمدير بنجاح! يمكنك الآن تجربة كافة الميزات 🚀'
        : 'Demo creator & admin session active! 🚀'
    );
  };

  const handleLogoutFirebaseUser = async () => {
    try {
      await logoutUser();
      triggerToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح 👋' : 'Logged out successfully 👋');
    } catch (err) {
      console.error(err);
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

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    triggerToast(lang === 'ar' ? 'تم نسخ البرومبت إلى الحافظة! ✓' : 'Prompt copied to clipboard! ✓');
  };

  const handleSubmitNewPrompt = async (newPrompt: PromptItem) => {
    // If logged in, attach real user info
    const enrichedPrompt: PromptItem = {
      ...newPrompt,
      creator: currentUser
        ? {
            id: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Member',
            handle: `@${currentUser.email?.split('@')[0] || 'member'}`,
            avatar: currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
            badge: '⚡ عضو نشط',
            roleAr: 'صانع محتوى',
            roleEn: 'Prompt Creator',
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

    // Permanent Firestore Write
    try {
      await savePromptToFirestore(enrichedPrompt);
      triggerToast(lang === 'ar' ? 'تم حفظ ونشر البرومبت في Firebase بنجاح! 🚀' : 'Prompt saved to Firebase Firestore! 🚀');
    } catch (err) {
      console.warn('Firestore prompt write error:', err);
      triggerToast(lang === 'ar' ? 'تم نشر البرومبت محلياً وجاري المزامنة...' : 'Published locally, syncing...');
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

  return (
    <div className={`min-h-screen bg-[#07080D] text-slate-100 selection:bg-purple-600/30 selection:text-purple-200 transition-colors duration-200 ${lang === 'ar' ? 'font-cairo' : 'font-sans'}`}>
      
      {/* Dynamic Announcement Top Bar */}
      <AnnouncementBar
        text={siteSettings.announcement.text}
        isEnabled={siteSettings.announcement.isEnabled}
        lang={lang}
      />

      {/* Ambient Deep Radial Violet Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-900/10 via-violet-950/5 to-transparent blur-[160px] pointer-events-none -z-10" />

      {/* A. Floating Glass Navbar with Real Firebase Auth */}
      <Navbar
        lang={lang}
        branding={siteSettings.branding}
        currentUser={currentUser}
        onLogoutUser={handleLogoutFirebaseUser}
        onGoogleLogin={handleGoogleLoginDirect}
        onToggleLang={toggleLanguage}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onGoHome={() => {
          setActiveHubId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={handleOpenAdminTrigger}
      />

      <main>
        {activeHubId ? (
          /* B. Dedicated Category Hub View (Filtered strictly to this category) */
          <CategoryHubView
            hubId={activeHubId}
            categories={categories}
            prompts={prompts}
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
          /* C. Clean Streamlined Directory Homepage */
          <>
            {/* 1. Slim Hero Section with Global Search */}
            <HeroSection
              lang={lang}
              heroSettings={siteSettings.hero}
              branding={siteSettings.branding}
              categories={categories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearchTrigger}
              activeCategory="all"
              onCategoryChange={(catId) => {
                if (catId === 'all') {
                  setActiveHubId(null);
                } else {
                  setActiveHubId(catId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              onSelectTag={handleSelectTag}
              onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
              onExploreClick={handleExploreClick}
            />

            {/* 2. Grid of Category Explorer Cards ("أقسام المنصة") */}
            <CategoryHubsGrid
              categories={categories}
              prompts={prompts}
              lang={lang}
              onSelectHub={(hubId) => {
                setActiveHubId(hubId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 3. Tight "أحدث الإضافات" (Top 4 latest highlights) */}
            <div id="highlights">
              <LatestHighlights
                categories={categories}
                prompts={prompts}
                lang={lang}
                onOpenDetail={(p) => setSelectedPrompt(p)}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onCopyPrompt={handleCopyPrompt}
                onSelectHub={(hubId) => {
                  setActiveHubId(hubId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </>
        )}
      </main>

      {/* Minimalist Obsidian Footer */}
      <Footer
        lang={lang}
        branding={siteSettings.branding}
        footerSettings={siteSettings.footer}
      />

      {/* Interactive Modals */}
      <PromptDetailModal
        prompt={selectedPrompt}
        allPrompts={prompts}
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
        prompts={prompts}
        lang={lang}
        onSelectPrompt={(p) => setSelectedPrompt(p)}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        lang={lang}
        onAuthSuccess={(user) => {
          triggerToast(lang === 'ar' ? `مرحباً بك ${user?.displayName || user?.email?.split('@')[0] || ''} 🎉` : `Welcome ${user?.displayName || 'back'}! 🎉`);
        }}
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

      {/* Bottom Sticky Status / Admin Pill Controls */}
      <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 flex items-center gap-2.5">
        {/* Firebase Cloud Sync Badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#090A14]/90 border border-purple-500/30 text-[11px] text-purple-300 backdrop-blur-xl shadow-lg"
          title={isFirebaseConnected ? 'Firebase Firestore متصل بالسحابة' : 'Firebase Offline mode'}
        >
          <Cloud className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>{lang === 'ar' ? 'فايربيس: متصل' : 'Firebase: Live'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Persistent Floating Quick Admin Toggle Button */}
        <button
          onClick={handleOpenAdminTrigger}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0D0E1C]/90 hover:bg-purple-950 border border-purple-500/50 hover:border-purple-400 text-purple-200 hover:text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] backdrop-blur-xl transition-all duration-300 cursor-pointer active:scale-95"
          title={lang === 'ar' ? 'لوحة تحكم وإدارة المنصة المحمية' : 'Protected Admin CMS Control'}
        >
          <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <Settings className="w-3.5 h-3.5 text-purple-300" />
          </div>
          <span className="text-xs font-bold font-cairo tracking-wide">
            {lang === 'ar' ? 'لوحة الإدارة' : 'Admin CMS'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isAdminAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
            title={isAdminAuthenticated ? (lang === 'ar' ? 'تمت المصادقة' : 'Authenticated') : (lang === 'ar' ? 'محمية بكلمة مرور' : 'Protected')}
          />
        </button>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] backdrop-blur-xl bg-purple-950/85 border border-purple-500/50 text-purple-100 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 pointer-events-none select-none"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
