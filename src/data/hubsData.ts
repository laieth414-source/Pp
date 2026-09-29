import { HubCategory, PromptItem } from '../types';

export const CATEGORY_HUBS: HubCategory[] = [
  {
    id: 'portrait',
    titleAr: 'بورتريه ووجوه',
    titleEn: 'Portrait & Faces',
    descriptionAr: 'تصوير فوتوغرافي، إضاءة استوديو، مسام البشرة وواقعية سينمائية للوجوه',
    descriptionEn: 'Ultra-realistic studio lighting, raw facial details, and cinematic portrait photography',
    iconName: 'User',
    gradient: 'from-purple-900/40 via-violet-950/20 to-transparent',
    accentBorder: 'group-hover:border-purple-500/50',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    sampleTag: 'بورتريه_واقعي',
  },
  {
    id: 'cinematic',
    titleAr: 'سينمائي ودرامي',
    titleEn: 'Cinematic & Drama',
    descriptionAr: 'لقطات عريضة، حركات كاميرا درامية، إضاءة حجمية ومشاهد هوليوودية',
    descriptionEn: 'Anamorphic lenses, dynamic camera motion, atmospheric haze, and movie scenes',
    iconName: 'Film',
    gradient: 'from-indigo-900/40 via-purple-950/20 to-transparent',
    accentBorder: 'group-hover:border-indigo-500/50',
    accentGlow: 'rgba(99, 102, 241, 0.4)',
    sampleTag: 'تصوير_سينمائي',
  },
  {
    id: 'anime',
    titleAr: 'أنمي وفانتازيا',
    titleEn: 'Anime & Fantasy',
    descriptionAr: 'رسومات مانجا يابانية، ألوان فانتاسي خيالية، وتصاميم شخصيات إبداعية',
    descriptionEn: 'Studio Ghibli & modern anime styles, fantasy concept art, and vibrant cel shading',
    iconName: 'Sparkles',
    gradient: 'from-pink-900/40 via-purple-950/20 to-transparent',
    accentBorder: 'group-hover:border-pink-500/50',
    accentGlow: 'rgba(236, 72, 153, 0.4)',
    sampleTag: 'أنمي_فانتازيا',
  },
  {
    id: 'commercial',
    titleAr: 'تصميم تجاري',
    titleEn: 'Commercial Design',
    descriptionAr: 'تصوير منتجات، إعلانات تجارية، هوية بصرية وتصاميم ترويجية احترافية',
    descriptionEn: 'Product photography, commercial mockups, visual branding, and marketing assets',
    iconName: 'ShoppingBag',
    gradient: 'from-amber-900/40 via-orange-950/20 to-transparent',
    accentBorder: 'group-hover:border-amber-500/50',
    accentGlow: 'rgba(245, 158, 11, 0.4)',
    sampleTag: 'تصميم_تجاري',
  },
  {
    id: '3d-design',
    titleAr: 'شخصيات 3D',
    titleEn: '3D Characters',
    descriptionAr: 'شخصيات ثلاثية الأبعاد، مجسمات رقمية، مواد ريندر واقعية ومحاكاة Octane',
    descriptionEn: '3D characters, digital sculptures, realistic materials, and Octane renders',
    iconName: 'Box',
    gradient: 'from-violet-900/40 via-indigo-950/20 to-transparent',
    accentBorder: 'group-hover:border-violet-500/50',
    accentGlow: 'rgba(139, 92, 246, 0.4)',
    sampleTag: 'شخصيات_3D',
  },
  {
    id: 'cyberpunk',
    titleAr: 'سايبربانك وخيال علمي',
    titleEn: 'Cyberpunk & Sci-Fi',
    descriptionAr: 'مدن نيون ليلية، آليين ميكا، أجهزة مستقبلية وأمطار سايبر درامية',
    descriptionEn: 'Futuristic neon metropolises, titanium mechas, and dark techno aesthetics',
    iconName: 'Zap',
    gradient: 'from-fuchsia-900/40 via-purple-950/20 to-transparent',
    accentBorder: 'group-hover:border-fuchsia-500/50',
    accentGlow: 'rgba(217, 70, 239, 0.4)',
    sampleTag: 'سايبربانك',
  },
  {
    id: 'code-dev',
    titleAr: 'برمجة وكود',
    titleEn: 'Code & Dev',
    descriptionAr: 'وكلاء ذكاء اصطناعي، تطبيقات Full-Stack، سكربتات أتمتة وتطوير برمجيات',
    descriptionEn: 'Autonomous coding agents, fullstack architectures, refactoring, and AI pipelines',
    iconName: 'Code',
    gradient: 'from-cyan-900/40 via-blue-950/20 to-transparent',
    accentBorder: 'group-hover:border-cyan-500/50',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    sampleTag: 'برمجة_وكود',
  },
];

export function getPromptHubId(prompt: PromptItem, categories: HubCategory[] = CATEGORY_HUBS): string {
  const pCat = (prompt.category || '').trim();
  if (pCat === 'بورتريه ووجوه') return 'portrait';
  if (pCat === 'سينمائي ودرامي') return 'cinematic';
  if (pCat === 'أنمي وفانتازيا') return 'anime';
  if (pCat === 'تصميم تجاري') return 'commercial';
  if (pCat === 'شخصيات 3D') return '3d-design';
  if (pCat === 'سايبربانك وخيال علمي') return 'cyberpunk';
  if (pCat === 'برمجة وكود') return 'code-dev';

  if (prompt.hubId) {
    const valid = categories.find((h) => h.id === prompt.hubId);
    if (valid) return valid.id;
  }

  const tagsStr = (prompt.tags || []).join(' ').toLowerCase();
  const textStr = (prompt.titleAr + ' ' + prompt.titleEn + ' ' + prompt.promptText).toLowerCase();

  // Code & Dev check
  if (
    prompt.category === 'code' ||
    prompt.category === 'agents' ||
    tagsStr.includes('code') ||
    tagsStr.includes('react') ||
    tagsStr.includes('typescript') ||
    tagsStr.includes('agent') ||
    textStr.includes('برمجة') ||
    textStr.includes('كود') ||
    textStr.includes('architect')
  ) {
    const match = categories.find((c) => c.id === 'code-dev' || c.id.includes('code'));
    if (match) return match.id;
  }

  // Anime check
  if (
    tagsStr.includes('anime') ||
    tagsStr.includes('أنمي') ||
    tagsStr.includes('manga') ||
    tagsStr.includes('dragon') ||
    prompt.visualType === 'neon_dragon' ||
    textStr.includes('أنمي') ||
    textStr.includes('مانجا')
  ) {
    const match = categories.find((c) => c.id === 'anime' || c.id.includes('anime'));
    if (match) return match.id;
  }

  // 3D & Product Design check
  if (
    tagsStr.includes('3d') ||
    tagsStr.includes('automotive') ||
    tagsStr.includes('hypercar') ||
    tagsStr.includes('luxury') ||
    prompt.visualType === 'luxury_hypercar' ||
    textStr.includes('سيارة') ||
    textStr.includes('ثلاثي') ||
    textStr.includes('منتج')
  ) {
    const match = categories.find((c) => c.id === '3d-design' || c.id.includes('3d'));
    if (match) return match.id;
  }

  // Cyberpunk & Sci-Fi check
  if (
    tagsStr.includes('cyber') ||
    tagsStr.includes('mecha') ||
    tagsStr.includes('sci-fi') ||
    prompt.visualType === 'cyber_oasis' ||
    prompt.visualType === 'mecha_warrior' ||
    textStr.includes('سايبر') ||
    textStr.includes('ميكا') ||
    textStr.includes('خيال علمي')
  ) {
    const match = categories.find((c) => c.id === 'cyberpunk' || c.id.includes('cyber'));
    if (match) return match.id;
  }

  // Portrait check
  if (
    tagsStr.includes('portrait') ||
    tagsStr.includes('photography') ||
    tagsStr.includes('bourtrit') ||
    tagsStr.includes('بورتريه') ||
    tagsStr.includes('face') ||
    textStr.includes('بورتريه') ||
    textStr.includes('وجه') ||
    prompt.visualType === 'digital_fashion'
  ) {
    const match = categories.find((c) => c.id === 'portrait' || c.id.includes('portrait'));
    if (match) return match.id;
  }

  // Default to cinematic or first category
  return categories.find((c) => c.id === 'cinematic')?.id || categories[0]?.id || 'cinematic';
}
