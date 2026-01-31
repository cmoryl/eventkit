// FAQ Configuration - Dynamic FAQ that updates with the system
// This file centralizes all FAQ content for easy updates

import { ASSET_CATEGORIES } from './assetConfig';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'generation' | 'export' | 'ai' | 'technical';
  keywords: string[];
}

export interface FAQCategory {
  id: string;
  label: string;
  icon: string;
  gradient: string;
}

// Dynamic FAQ categories
export const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'general', label: 'General', icon: 'HelpCircle', gradient: 'from-violet-500 to-purple-500' },
  { id: 'generation', label: 'Asset Generation', icon: 'Sparkles', gradient: 'from-pink-500 to-rose-500' },
  { id: 'export', label: 'Export & Print', icon: 'Download', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'ai', label: 'AI & Learning', icon: 'Brain', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'technical', label: 'Technical', icon: 'Settings', gradient: 'from-orange-500 to-amber-500' },
];

// Build dynamic category list from system
const assetCategoryList = Object.entries(ASSET_CATEGORIES)
  .map(([key, val]) => `**${val.label}**: ${val.description}`)
  .join('\n');

// Dynamic FAQ items - pulls from system configuration
export const FAQ_ITEMS: FAQItem[] = [
  // General
  {
    id: 'what-is-this',
    question: 'What is the Event Design Kit Generator?',
    answer: 'An AI-powered tool that creates professional event branding assets from just your logo and event description. It generates everything from banners and badges to merchandise mockups and social media content—all with consistent styling.',
    category: 'general',
    keywords: ['about', 'what', 'overview', 'introduction'],
  },
  {
    id: 'how-it-works',
    question: 'How does the generation process work?',
    answer: 'Simply enter your event details, upload your logo, describe your desired style (or upload a reference image), and select which assets you want. Our AI analyzes your inputs and generates cohesive, print-ready designs that match your brand.',
    category: 'general',
    keywords: ['process', 'how', 'steps', 'workflow'],
  },
  {
    id: 'asset-types',
    question: 'What types of assets can I generate?',
    answer: `We support a comprehensive range of event assets across these categories:\n\n${assetCategoryList}\n\nFrom banners to business cards, t-shirts to tote bags—over 50 asset types in total.`,
    category: 'general',
    keywords: ['assets', 'types', 'categories', 'what can'],
  },

  // Generation
  {
    id: 'generation-time',
    question: 'How long does asset generation take?',
    answer: 'Most individual assets generate in 10-30 seconds. A full design kit with 15-20 assets typically completes in 3-5 minutes. Generation time depends on the complexity and number of assets selected.',
    category: 'generation',
    keywords: ['time', 'speed', 'duration', 'how long'],
  },
  {
    id: 'style-references',
    question: 'Can I use reference images for styling?',
    answer: 'Yes! Upload a "vibe image" that represents your desired aesthetic, and our AI will extract colors, textures, and style cues to apply across all your assets. You can also upload a master pattern for consistent background elements.',
    category: 'generation',
    keywords: ['style', 'reference', 'vibe', 'pattern', 'aesthetic'],
  },
  {
    id: 'regenerate-assets',
    question: 'Can I regenerate specific assets?',
    answer: 'Absolutely. Click the regenerate button on any asset to get a new variation while keeping others. You can also edit assets individually using our built-in image editor or AI-powered edit tools.',
    category: 'generation',
    keywords: ['regenerate', 'redo', 'variation', 'different'],
  },
  {
    id: 'cultural-context',
    question: 'Does the AI understand cultural context?',
    answer: 'Yes! When you specify your event location, our AI applies culturally-appropriate design elements, color symbolism, and regional aesthetics for 40+ global locations. This ensures your designs resonate with local audiences.',
    category: 'generation',
    keywords: ['cultural', 'location', 'regional', 'local'],
  },

  // Export
  {
    id: 'export-formats',
    question: 'What file formats are supported for export?',
    answer: 'We support PNG, JPEG, PDF, and SVG formats. Each asset is optimized for its intended use—print assets include proper bleed and crop marks, while digital assets are web-optimized.',
    category: 'export',
    keywords: ['format', 'file', 'png', 'pdf', 'svg', 'jpeg'],
  },
  {
    id: 'print-ready',
    question: 'Are the assets print-ready?',
    answer: 'Yes! Print assets include industry-standard specifications: 300 DPI resolution, proper bleed margins (typically 0.125"), safe zones, and CMYK color support. We also support vendor-specific templates from major print providers.',
    category: 'export',
    keywords: ['print', 'ready', 'dpi', 'bleed', 'cmyk', 'resolution'],
  },
  {
    id: 'vendor-templates',
    question: 'Can I use vendor-specific print templates?',
    answer: 'Yes! Upload PDF templates from print vendors (VistaPrint, MOO, etc.) and our AI extracts the specifications automatically. Your designs will be perfectly formatted for that vendor\'s requirements.',
    category: 'export',
    keywords: ['vendor', 'template', 'vistaprint', 'moo', 'print provider'],
  },
  {
    id: 'batch-export',
    question: 'Can I download all assets at once?',
    answer: 'Yes! Use the "Download All" button to get a ZIP file containing all your assets organized by category. You can also use Advanced Export for custom resolutions and formats.',
    category: 'export',
    keywords: ['batch', 'download', 'all', 'zip', 'bulk'],
  },

  // AI & Learning
  {
    id: 'ai-learning',
    question: 'Does the AI learn from my feedback?',
    answer: 'Yes! Our AI Brain system learns from your ratings (thumbs up/down), edits, and regeneration patterns. Over time, it understands your style preferences and generates more accurate designs.',
    category: 'ai',
    keywords: ['learn', 'feedback', 'improve', 'preferences', 'brain'],
  },
  {
    id: 'render-engines',
    question: 'What are render engines?',
    answer: 'Render engines are different AI image generation providers (like OpenAI DALL-E, Stability AI, etc.). You can add your own API keys to use alternative engines, or stick with our built-in Lovable AI engine at no extra cost.',
    category: 'ai',
    keywords: ['render', 'engine', 'openai', 'stability', 'provider'],
  },
  {
    id: 'custom-api-keys',
    question: 'Can I use my own AI API keys?',
    answer: 'Yes! Go to the AI Render Engines menu to add API keys for OpenAI, Stability AI, Replicate, or Midjourney. Your keys are encrypted and never shared. Using your own keys gives you more control over generation.',
    category: 'ai',
    keywords: ['api', 'key', 'custom', 'own', 'provider'],
  },

  // Technical
  {
    id: 'save-projects',
    question: 'Can I save my projects?',
    answer: 'Yes! Save projects locally as ZIP files, or sign in to save to the cloud. Cloud saves sync across devices and preserve your complete project state including all assets, settings, and edit history.',
    category: 'technical',
    keywords: ['save', 'project', 'cloud', 'sync', 'backup'],
  },
  {
    id: 'supported-logos',
    question: 'What logo formats are supported?',
    answer: 'We accept PNG, JPEG, SVG, and WebP formats. For best results, upload a high-resolution PNG or SVG with a transparent background. You can upload multiple logo variations (primary, secondary, icon).',
    category: 'technical',
    keywords: ['logo', 'format', 'upload', 'image', 'svg'],
  },
  {
    id: 'data-privacy',
    question: 'Is my data secure?',
    answer: 'Your uploaded logos, generated assets, and project data are encrypted and stored securely. We never share your content or use it to train AI models. API keys are encrypted at rest and in transit.',
    category: 'technical',
    keywords: ['security', 'privacy', 'data', 'encrypted', 'safe'],
  },
];

// Helper to get FAQ items by category
export const getFAQByCategory = (category: FAQItem['category']): FAQItem[] => {
  return FAQ_ITEMS.filter(item => item.category === category);
};

// Helper to search FAQ
export const searchFAQ = (query: string): FAQItem[] => {
  const lowerQuery = query.toLowerCase();
  return FAQ_ITEMS.filter(item => 
    item.question.toLowerCase().includes(lowerQuery) ||
    item.answer.toLowerCase().includes(lowerQuery) ||
    item.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  );
};

// Get total counts for stats display
export const getFAQStats = () => ({
  totalQuestions: FAQ_ITEMS.length,
  categories: FAQ_CATEGORIES.length,
  assetCategories: Object.keys(ASSET_CATEGORIES).length,
});
