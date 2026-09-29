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
  model: string;
  category: string;
  hubId?: 'portrait' | 'cinematic' | 'cyberpunk' | 'anime' | '3d-design' | 'code-dev' | string;
  aspectRatio: '16:9' | '1:1' | '9:16' | '4:5' | '21:9' | string;
  seed?: string;
  stylize?: number;
  chaos?: number;
  steps?: number;
  likes: number;
  saves: number;
  isLiked?: boolean;
  isSaved?: boolean;
  tags: string[];
  creator: Creator;
  visualType: 'cyber_oasis' | 'mecha_warrior' | 'luxury_hypercar' | 'digital_fashion' | 'cinematic_director' | 'ancient_futuristic' | 'neon_dragon' | 'ai_code_agent' | string;
  featured?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  imageUrl?: string;
  status?: 'approved' | 'pending' | 'rejected' | 'private';
  submissionTarget?: 'private' | 'public' | 'both';
  rejectionReason?: string | null;
  copyCount?: number;
}

export interface HubCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  gradient?: string;
  accentBorder?: string;
  accentGlow?: string;
  sampleTag?: string;
}

export interface BrandingSettings {
  siteName: string;
  logoText: string;
  logoImage: string;
  slogan: string;
}

export interface HeroSettings {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  searchPlaceholder: string;
  exploreBtnText: string;
  howItWorksBtnText: string;
}

export interface AnnouncementSettings {
  isEnabled: boolean;
  text: string;
}

export interface FooterSettings {
  aboutText: string;
  copyright: string;
}

export interface ThemeSettings {
  accentColor: string;
  bgColor: string;
}

export interface SiteSettings {
  branding: BrandingSettings;
  hero: HeroSettings;
  announcement: AnnouncementSettings;
  footer: FooterSettings;
  theme?: ThemeSettings;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: 'admin' | 'creator' | 'member';
  status: 'active' | 'suspended';
  promptsCount: number;
  joinedDate: string;
}

export interface CategoryInfo {
  id: 'image' | 'video' | 'text' | 'audio' | 'code' | 'agents' | string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  iconName: string;
  count: number;
  popularTags: string[];
  gradient: string;
}

