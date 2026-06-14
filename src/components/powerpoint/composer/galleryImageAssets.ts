export interface GalleryImageAsset {
  templateId: string;
  title: string;
  kind: 'hero' | 'background' | 'thumbnail' | 'mockup';
  src: string;
  alt: string;
}

const svgData = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const baseSvg = ({ bg, accent, secondary, label, motif }: { bg: string; accent: string; secondary: string; label: string; motif: string }) => svgData(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
  <defs>
    <radialGradient id="g1" cx="20%" cy="20%" r="60%"><stop stop-color="${accent}" stop-opacity=".85"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="82%" cy="18%" r="50%"><stop stop-color="${secondary}" stop-opacity=".72"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></radialGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#050816"/></linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="24"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="260" cy="180" r="330" fill="url(#g1)" filter="url(#blur)"/>
  <circle cx="1300" cy="160" r="300" fill="url(#g2)" filter="url(#blur)"/>
  ${motif}
  <rect x="80" y="690" width="520" height="8" rx="4" fill="${accent}"/>
  <text x="80" y="765" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="800" letter-spacing="-1">${label}</text>
</svg>`);

export const GALLERY_IMAGE_ASSETS: GalleryImageAsset[] = [
  {
    templateId: 'enterprise-ai-nexus',
    title: 'Enterprise AI Nexus hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#050816', accent: '#22D3EE', secondary: '#8B5CF6', label: 'AI Nexus', motif: '<g opacity=".8"><rect x="920" y="220" width="420" height="250" rx="34" fill="#06111f" stroke="#22D3EE" stroke-opacity=".55"/><path d="M960 300h300M960 360h220M960 420h140" stroke="#fff" stroke-opacity=".75" stroke-width="14" stroke-linecap="round"/><circle cx="1240" cy="368" r="70" fill="#22D3EE" fill-opacity=".24" stroke="#8B5CF6" stroke-width="10"/></g>' }),
    alt: 'Dark AI command-center abstract thumbnail with glass UI cards.',
  },
  {
    templateId: 'global-launch-keynote',
    title: 'Global Launch Keynote hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#001C3D', accent: '#139DD8', secondary: '#A1F9F9', label: 'Global Launch', motif: '<g opacity=".88"><path d="M800 620C940 420 1080 300 1390 245" stroke="#A1F9F9" stroke-width="10" fill="none"/><rect x="920" y="260" width="430" height="260" rx="38" fill="#03002C" fill-opacity=".55" stroke="#139DD8" stroke-opacity=".6"/><circle cx="1040" cy="360" r="54" fill="#139DD8" fill-opacity=".45"/><circle cx="1180" cy="360" r="54" fill="#A1F9F9" fill-opacity=".25"/><rect x="1010" y="460" width="290" height="18" rx="9" fill="#fff" fill-opacity=".7"/></g>' }),
    alt: 'Cinematic global launch stage thumbnail with blue lighting and event panels.',
  },
  {
    templateId: 'data-observatory-pro',
    title: 'Data Observatory Pro hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#07111F', accent: '#7BCD3A', secondary: '#139DD8', label: 'Data Observatory', motif: '<g opacity=".88"><rect x="850" y="210" width="520" height="350" rx="34" fill="#0C1E36" stroke="#7BCD3A" stroke-opacity=".45"/><g fill="#139DD8" fill-opacity=".65"><rect x="910" y="430" width="42" height="75" rx="8"/><rect x="980" y="365" width="42" height="140" rx="8"/><rect x="1050" y="310" width="42" height="195" rx="8"/><rect x="1120" y="390" width="42" height="115" rx="8"/><rect x="1190" y="270" width="42" height="235" rx="8"/></g><path d="M910 390C990 300 1050 360 1120 290C1190 220 1240 250 1320 180" stroke="#7BCD3A" stroke-width="12" fill="none" stroke-linecap="round"/></g>' }),
    alt: 'Dark analytics thumbnail with dashboard chart bars and trend line.',
  },
  {
    templateId: 'cinematic-case-study-system',
    title: 'Cinematic Case Study hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#08101F', accent: '#3BBFB5', secondary: '#139DD8', label: 'Case Study', motif: '<g opacity=".88"><rect x="820" y="210" width="260" height="360" rx="34" fill="#3BBFB5" fill-opacity=".35"/><rect x="1110" y="210" width="260" height="360" rx="34" fill="#139DD8" fill-opacity=".32"/><path d="M940 620h310" stroke="#fff" stroke-opacity=".8" stroke-width="12" stroke-linecap="round"/><text x="875" y="400" fill="#fff" font-size="88" font-weight="800" font-family="Arial">3.4x</text></g>' }),
    alt: 'Cinematic case study thumbnail with before/after panels and result metric.',
  },
  {
    templateId: 'product-os-launch',
    title: 'Product OS Launch hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#F7FAFC', accent: '#003FC7', secondary: '#139DD8', label: 'Product OS', motif: '<g opacity=".92"><rect x="850" y="210" width="520" height="330" rx="42" fill="#FFFFFF" stroke="#003FC7" stroke-opacity=".45"/><rect x="900" y="270" width="420" height="200" rx="28" fill="#E0E8F5"/><circle cx="980" cy="360" r="58" fill="#139DD8" fill-opacity=".45"/><rect x="1080" y="320" width="180" height="18" rx="9" fill="#003FC7"/><rect x="1080" y="365" width="240" height="18" rx="9" fill="#139DD8"/></g>' }),
    alt: 'Product launch thumbnail with device mockup and UI panels.',
  },
  {
    templateId: 'event-experience-system',
    title: 'Event Experience System hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#03002C', accent: '#FF6600', secondary: '#EC388A', label: 'Event System', motif: '<g opacity=".88"><rect x="900" y="210" width="420" height="300" rx="34" fill="#FF6600" fill-opacity=".23" stroke="#EC388A" stroke-opacity=".5"/><path d="M930 470C1030 320 1180 280 1320 240" stroke="#FF6600" stroke-width="14" fill="none"/><circle cx="990" cy="350" r="44" fill="#EC388A" fill-opacity=".55"/><circle cx="1160" cy="310" r="44" fill="#FF6600" fill-opacity=".55"/></g>' }),
    alt: 'Experiential event system thumbnail with activation path and sponsor moments.',
  },
  {
    templateId: 'boardroom-decision-pack',
    title: 'Boardroom Decision Pack hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#F7F9FC', accent: '#003B71', secondary: '#139DD8', label: 'Boardroom Pack', motif: '<g opacity=".92"><rect x="830" y="230" width="160" height="230" rx="28" fill="#FFFFFF" stroke="#003B71" stroke-opacity=".3"/><rect x="1030" y="230" width="160" height="230" rx="28" fill="#FFFFFF" stroke="#003B71" stroke-opacity=".3"/><rect x="1230" y="230" width="160" height="230" rx="28" fill="#FFFFFF" stroke="#003B71" stroke-opacity=".3"/><path d="M870 320h80M1070 320h80M1270 320h80" stroke="#003B71" stroke-width="14" stroke-linecap="round"/></g>' }),
    alt: 'Executive boardroom decision thumbnail with decision cards.',
  },
  {
    templateId: 'brand-governance-kit',
    title: 'Brand Governance Kit hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#FFFFFF', accent: '#139DD8', secondary: '#E0E8F5', label: 'Brand Governance', motif: '<g opacity=".95"><rect x="870" y="220" width="420" height="290" rx="34" fill="#F7F9FC" stroke="#139DD8" stroke-opacity=".55"/><rect x="980" y="310" width="200" height="90" rx="20" fill="#003B71"/><path d="M930 270h310M930 450h310M825 365h90M1245 365h90" stroke="#139DD8" stroke-width="10" stroke-linecap="round" stroke-dasharray="18 18"/></g>' }),
    alt: 'Brand governance thumbnail with safe-zone logo diagram.',
  },
  {
    templateId: 'thought-leadership-editorial',
    title: 'Thought Leadership Editorial hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#F7F5F1', accent: '#C4654A', secondary: '#8B7355', label: 'Editorial POV', motif: '<g opacity=".92"><rect x="920" y="180" width="280" height="420" rx="140" fill="#C4654A" fill-opacity=".45"/><rect x="1120" y="330" width="250" height="190" fill="#FFFFFF" fill-opacity=".55"/><path d="M780 260h420M780 320h260M780 380h330" stroke="#1A1A1A" stroke-opacity=".5" stroke-width="13" stroke-linecap="round"/></g>' }),
    alt: 'Editorial thought leadership thumbnail with magazine-style image crop.',
  },
  {
    templateId: 'immersive-workshop-lab',
    title: 'Immersive Workshop Lab hero image',
    kind: 'thumbnail',
    src: baseSvg({ bg: '#FFFFFF', accent: '#F96167', secondary: '#6366F1', label: 'Workshop Lab', motif: '<g opacity=".92"><rect x="850" y="220" width="170" height="150" rx="28" fill="#F96167" fill-opacity=".82" transform="rotate(-7 935 295)"/><rect x="1040" y="250" width="170" height="150" rx="28" fill="#6366F1" fill-opacity=".82" transform="rotate(5 1125 325)"/><rect x="1230" y="210" width="170" height="150" rx="28" fill="#139DD8" fill-opacity=".74" transform="rotate(-4 1315 285)"/><path d="M885 300h90M1075 330h90M1265 290h90" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>' }),
    alt: 'Workshop lab thumbnail with interactive sticky-note cards.',
  },
];

export const getGalleryImageAsset = (templateId: string) => GALLERY_IMAGE_ASSETS.find((asset) => asset.templateId === templateId);
