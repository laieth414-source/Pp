export type Language = 'ar' | 'en';

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  badge: string;
  roleAr: string;
  roleEn: string;
  promptCount: number;
  followers: number;
  verified: boolean;
  isFollowing?: boolean;
}

export interface PromptItem {
  id: string;
  titleAr: string;
  titleEn: string;
  promptText: string;
  negativePrompt?: string;
  model: 'Midjourney v6.1' | 'Flux.1 Pro' | 'Kling AI v1.5' | 'Runway Gen-3' | 'GPT-4o / Claude' | 'Suno v3.5';
  category: 'image' | 'video' | 'text' | 'audio' | 'code' | 'agents';
  aspectRatio: '16:9' | '1:1' | '9:16' | '4:5' | '21:9';
  seed: string;
  stylize?: number;
  chaos?: number;
  steps?: number;
  likes: number;
  saves: number;
  isLiked?: boolean;
  isSaved?: boolean;
  tags: string[];
  creator: Creator;
  visualType: 'cyber_oasis' | 'mecha_warrior' | 'luxury_hypercar' | 'digital_fashion' | 'cinematic_director' | 'ancient_futuristic' | 'neon_dragon' | 'ai_code_agent';
  featured?: boolean;
  createdAt: string;
}

export interface CategoryInfo {
  id: 'image' | 'video' | 'text' | 'audio' | 'code' | 'agents';
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  iconName: string;
  count: number;
  popularTags: string[];
  gradient: string;
}
