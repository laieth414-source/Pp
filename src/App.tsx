/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, PromptItem } from './types';
import { PROMPTS_DATA } from './data/promptsData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { TrendingSection } from './components/TrendingSection';
import { FeaturedSpotlight } from './components/FeaturedSpotlight';
import { LatestStream } from './components/LatestStream';
import { CreatorsRoster } from './components/CreatorsRoster';
import { CtaStrip } from './components/CtaStrip';
import { Footer } from './components/Footer';
import { PromptDetailModal } from './components/PromptDetailModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { HowItWorksModal } from './components/HowItWorksModal';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [prompts, setPrompts] = useState<PromptItem[]>(PROMPTS_DATA);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'signup',
  });
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sync html dir and lang attribute seamlessly
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrompts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isLiked = !item.isLiked;
          return {
            ...item,
            isLiked,
            likes: isLiked ? item.likes + 1 : item.likes - 1,
          };
        }
        return item;
      })
    );
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrompts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isSaved = !item.isSaved;
          return {
            ...item,
            isSaved,
            saves: isSaved ? item.saves + 1 : item.saves - 1,
          };
        }
        return item;
      })
    );
  };

  const handleSearchTrigger = (query: string) => {
    setIsSearchOpen(true);
  };

  const handleSelectTag = (tag: string) => {
    // Scroll to explore/latest stream or filter
    const el = document.getElementById('explore');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
      const el = document.getElementById('trending');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleExploreClick = () => {
    const el = document.getElementById('trending');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen bg-[#07080D] text-slate-100 selection:bg-purple-600/30 selection:text-purple-200 transition-colors duration-200 ${lang === 'ar' ? 'font-cairo' : 'font-sans'}`}>
      
      {/* Ambient Deep Radial Violet Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-900/10 via-violet-950/5 to-transparent blur-[160px] pointer-events-none -z-10" />

      {/* A. Floating Glass Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      <main>
        {/* B. High-Converting Hero Section (Dual-Column with 3D Cyber-Robot & Orbiting Status Pills) */}
        <HeroSection
          lang={lang}
          onSearch={handleSearchTrigger}
          onSelectTag={handleSelectTag}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          onExploreClick={handleExploreClick}
        />

        {/* C. Six Core Category Pillars */}
        <CategoriesSection
          lang={lang}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* D. Trending Prompts Grid 🔥 */}
        <TrendingSection
          prompts={prompts}
          lang={lang}
          onOpenDetail={(p) => setSelectedPrompt(p)}
          onToggleLike={handleToggleLike}
          onToggleSave={handleToggleSave}
        />

        {/* E. Featured Prompts Spotlight ⭐ */}
        <FeaturedSpotlight
          prompts={prompts}
          lang={lang}
          onOpenDetail={(p) => setSelectedPrompt(p)}
        />

        {/* F. Latest Prompts Stream 🆕 */}
        <LatestStream
          prompts={prompts}
          lang={lang}
          onOpenDetail={(p) => setSelectedPrompt(p)}
          onToggleLike={handleToggleLike}
          onToggleSave={handleToggleSave}
        />

        {/* G. Featured Creators Roster 👨🎨 */}
        <CreatorsRoster lang={lang} />

        {/* H. Discovery Call-To-Action (CTA Strip) */}
        <CtaStrip
          lang={lang}
          onOpenAuth={handleOpenAuth}
        />
      </main>

      {/* I. Comprehensive Master Footer */}
      <Footer lang={lang} />

      {/* Interactive Modals */}
      <PromptDetailModal
        prompt={selectedPrompt}
        lang={lang}
        onClose={() => setSelectedPrompt(null)}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
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
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        lang={lang}
      />

    </div>
  );
}
