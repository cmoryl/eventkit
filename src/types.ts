export enum AssetType {
  Logo = 'LOGO',
  Palette = 'PALETTE',
  Slogans = 'SLOGANS',
  SocialPost = 'SOCIAL_POST',
  NameTag = 'NAME_TAG',
  NameTagBack = 'NAME_TAG_BACK',
  Banner = 'BANNER',
  EventSignage = 'EVENT_SIGNAGE',
  HangingSignage = 'HANGING_SIGNAGE',
  OutdoorSignage = 'OUTDOOR_SIGNAGE',
  DoorSignage = 'DOOR_SIGNAGE',
  EaselSignage = 'EASEL_SIGNAGE',
  LocationSignage = 'LOCATION_SIGNAGE',
  RoomSignage = 'ROOM_SIGNAGE',
  StandUpPillarBanner = 'STAND_UP_PILLAR_BANNER',
  FeatherFlag = 'FEATHER_FLAG',
  TeardropFlag = 'TEARDROP_FLAG',
  QRCode = 'QR_CODE',
  PhotorealisticShot = 'PHOTOREALISTIC_SHOT',
  SeamlessPattern = 'SEAMLESS_PATTERN',
  Tshirt = 'TSHIRT',
  TshirtBack = 'TSHIRT_BACK',
  TshirtSleeve = 'TSHIRT_SLEEVE',
  Lanyard = 'LANYARD',
  SwagBag = 'SWAG_BAG',
  StickerSheet = 'STICKER_SHEET',
  EmailHeader = 'EMAIL_HEADER',
  SocialStory = 'SOCIAL_STORY',
  PresentationSlide = 'PRESENTATION_SLIDE',
  Presentation = 'PRESENTATION',
  WifiSign = 'WIFI_SIGN',
  ThankYouNote = 'THANK_YOU_NOTE',
  AgendaHighlights = 'AGENDA_HIGHLIGHTS',
  Hat = 'HAT',
  Folder = 'FOLDER',
  WaterBottle = 'WATER_BOTTLE',
  Menu = 'MENU',
  BackWall = 'BACK_WALL',
  Stairs = 'STAIRS',
  RegistrationCounter = 'REGISTRATION_COUNTER',
  WelcomeCounter = 'WELCOME_COUNTER',
  RegistrationBackWall = 'REGISTRATION_BACK_WALL',
  TechnologyCounter = 'TECHNOLOGY_COUNTER',
  Kiosk = 'KIOSK',
  FloorPlan = 'FLOOR_PLAN',
  LocationIntel = 'LOCATION_INTEL',
  AppIcon = 'APP_ICON',
  Favicon = 'FAVICON',
  SocialProfile = 'SOCIAL_PROFILE',
  LogoMonochrome = 'LOGO_MONOCHROME',
  LogoReversed = 'LOGO_REVERSED',
  MarketingCopy = 'MARKETING_COPY',
  StyleGuide = 'STYLE_GUIDE',
  RunOfShow = 'RUN_OF_SHOW',
  Soundtrack = 'SOUNDTRACK',
  GlassDoor = 'GLASS_DOOR',
  GlassRotatingDoor = 'GLASS_ROTATING_DOOR',
  GlassDoubleDoor = 'GLASS_DOUBLE_DOOR',
  MainStageBackdrop = 'MAIN_STAGE_BACKDROP',
  VideoTeaser = 'VIDEO_TEASER',
}

export interface LogoAsset {
  id: string;
  file: File;
  url: string;
  name: string;
  isGenerated?: boolean;
}

export interface ColorInfo {
  hex: string;
  rgb: string;
  cmyk: string;
  hsv: string;
  pantone: string;
  name: string;
}

export interface QRCodeGenerationParams {
  url: string;
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  dotsType: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
  cornersSquareType: 'square' | 'extra-rounded' | 'dot';
  cornersDotType: 'square' | 'dot';
  logoImage?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoMargin?: number;
}

export interface FloorPlanGenerationParams {
  layoutDescription?: string;
  venueName?: string;
  venueAddress?: string;
  venuePlaceId?: string;
}

export type ElementType = 'text' | 'image' | 'chart' | 'shape' | 'icon';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color: string;
  align: 'left' | 'center' | 'right';
  fontFamily?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  objectFit?: 'cover' | 'contain';
}

export interface IconElement extends BaseElement {
  type: 'icon';
  iconName?: string;
  svgContent?: string;
  color: string;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;
  title?: string;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
}

export type SlideElement = TextElement | ImageElement | ChartElement | ShapeElement | IconElement;

export interface PresentationTheme {
  backgroundColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  titleFont: string;
  bodyFont: string;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image';
  value: string;
  overlayOpacity?: number;
  imageFit?: 'cover' | 'contain' | 'fill';
  filterBrightness?: number;
  filterContrast?: number;
}

export interface Slide {
  id: string;
  type: 'title' | 'content' | 'image-split' | 'chart' | 'blank';
  elements: SlideElement[];
  speakerNotes?: string;
  background?: string;
  backgroundConfig?: BackgroundConfig;
}

export interface PresentationData {
  title: string;
  theme: PresentationTheme;
  slides: Slide[];
}

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  title: string;
  content: string | string[] | ColorInfo[] | PresentationData;
  backContent?: string;
  isLoading: boolean;
  logoId?: string;
  photorealisticShots?: GeneratedAsset[];
  sourceAssetId?: string;
  generationParams?: QRCodeGenerationParams | FloorPlanGenerationParams | Record<string, any>;
  isFavorite?: boolean;
  folderId?: string;
}

export interface AssetFolder {
  id: string;
  name: string;
}

export interface EventDetails {
  name: string;
  description: string;
  date: string;
  location: string;
  website: string;
  email: string;
  incorporateLocationStyle: boolean;
  qrCodeUrl?: string;
  qrCodeColor?: string;
  qrCodeBgColor?: string;
  venueQuery?: string;
  venueName?: string;
  venueAddress?: string;
  venuePlaceId?: string;
}

export interface VenueSearchResult {
  name: string;
  address: string;
  placeId: string;
}

export interface PdfExportOptions {
  paperSize: string;
  bleed: number;
  showTrimMarks: boolean;
}

export interface LogoGenerationOptions {
  eventTitle: string;
  eventTagline: string;
  location: string;
  text: string;
  visualElements: string;
  textHandling: 'as typed' | 'initials' | 'icon only';
  fontStyle: 'Serif' | 'Sans' | 'Slab' | 'Script' | 'Display';
  logoType: 'Wordmark' | 'Lettermark' | 'Combination mark' | 'Emblem' | 'Abstract mark';
  script: 'Latin' | 'Cyrillic' | 'Arabic' | 'Devanagari' | 'Japanese';
  culturalConsiderations: string;
  forbiddenElements: string;
  styleBundles: string[];
  tone: string[];
  moods: string[];
  cues: string[];
  renderingStyle: string[];
  colors: { hex: string; name: string }[];
}

export interface GeneratedLogoVariation {
  id: string;
  content: string;
  isLoading: boolean;
  feedback: 'liked' | 'disliked' | null;
  title?: string;
}
