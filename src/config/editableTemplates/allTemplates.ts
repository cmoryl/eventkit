// All Editable Templates - Master collection

import { EditableTemplate } from '@/types/editableTemplate.types';
import { ALL_NAMETAG_TEMPLATES } from './nameTagTemplates';
import { ALL_BANNER_TEMPLATES } from './bannerTemplates';
import { ALL_BADGE_TEMPLATES } from './badgeTemplates';
import { ALL_SIGNAGE_TEMPLATES } from './signageTemplates';
import { ALL_MERCHANDISE_TEMPLATES } from './merchandiseTemplates';
import { ALL_SOCIAL_TEMPLATES } from './socialTemplates';
import { ALL_LOCAL_VENDOR_TEMPLATES } from './localVendorTemplates';
import { ALL_LARGE_EVENT_SIGNAGE_TEMPLATES } from './largeEventSignageTemplates';
import { ALL_EVENT_ESSENTIALS_TEMPLATES } from './eventEssentialsTemplates';
import { ALL_DIGITAL_MISC_TEMPLATES } from './digitalMiscTemplates';
import { ALL_PRESENTATION_TEMPLATES } from './presentationTemplates';
import { CUTTING_EDGE_PRESENTATION_TEMPLATES } from './cuttingEdgePresentationTemplates';

// Master collection of all editable templates
export const ALL_EDITABLE_TEMPLATES: EditableTemplate[] = [
  ...ALL_NAMETAG_TEMPLATES,
  ...ALL_BANNER_TEMPLATES,
  ...ALL_BADGE_TEMPLATES,
  ...ALL_SIGNAGE_TEMPLATES,
  ...ALL_MERCHANDISE_TEMPLATES,
  ...ALL_SOCIAL_TEMPLATES,
  ...ALL_LOCAL_VENDOR_TEMPLATES,
  ...ALL_LARGE_EVENT_SIGNAGE_TEMPLATES,
  ...ALL_EVENT_ESSENTIALS_TEMPLATES,
  ...ALL_DIGITAL_MISC_TEMPLATES,
  ...ALL_PRESENTATION_TEMPLATES,
  ...CUTTING_EDGE_PRESENTATION_TEMPLATES
];

// Template counts by category
export const TEMPLATE_STATS = {
  total: ALL_EDITABLE_TEMPLATES.length,
  universal: ALL_EDITABLE_TEMPLATES.filter(t => t.category === 'universal').length,
  vendorSpecific: ALL_EDITABLE_TEMPLATES.filter(t => t.category === 'vendor-specific').length,
  premium: ALL_EDITABLE_TEMPLATES.filter(t => t.category === 'premium').length
};
