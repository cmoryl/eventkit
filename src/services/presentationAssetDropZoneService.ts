import { ALL_EDITABLE_TEMPLATES } from '@/config/editableTemplates/allTemplates';
import type { EditableTemplate, TemplateField, TemplateFieldType } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

const ASSET_FIELD_TYPES: TemplateFieldType[] = ['image', 'logo', 'icon', 'qrcode'];

export interface PresentationAssetDropZone {
  templateId: string;
  templateName: string;
  fieldId: string;
  fieldName: string;
  type: TemplateFieldType;
  group?: string;
  placeholder?: string;
  acceptedFormats?: string[];
  aspectRatio?: number;
  position: TemplateField['position'];
}

export interface PresentationTemplateAssetMap {
  template: EditableTemplate;
  zones: PresentationAssetDropZone[];
}

const isPresentationTemplate = (template: EditableTemplate) => template.assetType === AssetType.PresentationSlide;
const isAssetField = (field: TemplateField) => ASSET_FIELD_TYPES.includes(field.type);

export const getPresentationAssetDropZones = (templateId?: string): PresentationTemplateAssetMap[] => {
  return ALL_EDITABLE_TEMPLATES
    .filter(isPresentationTemplate)
    .filter((template) => !templateId || template.id === templateId)
    .map((template) => ({
      template,
      zones: template.fields.filter(isAssetField).map((field) => ({
        templateId: template.id,
        templateName: template.name,
        fieldId: field.id,
        fieldName: field.name,
        type: field.type,
        group: field.group,
        placeholder: field.placeholder,
        acceptedFormats: field.acceptedFormats,
        aspectRatio: field.aspectRatio,
        position: field.position,
      })),
    }))
    .filter((entry) => entry.zones.length > 0);
};

export const getPresentationAssetDropZoneSummary = () => {
  const maps = getPresentationAssetDropZones();
  const zones = maps.flatMap((entry) => entry.zones);
  return {
    templatesWithDropZones: maps.length,
    totalDropZones: zones.length,
    imageZones: zones.filter((zone) => zone.type === 'image').length,
    logoZones: zones.filter((zone) => zone.type === 'logo').length,
    iconZones: zones.filter((zone) => zone.type === 'icon').length,
    qrZones: zones.filter((zone) => zone.type === 'qrcode').length,
    dragDropGroupedZones: zones.filter((zone) => zone.group === 'drag-drop-assets').length,
  };
};

export const buildPresentationAssetDropZonePromptBlock = (templateId?: string) => {
  const maps = getPresentationAssetDropZones(templateId);
  return [
    'PRESENTATION ASSET DROP ZONES',
    templateId ? `Template: ${templateId}` : 'Template: all presentation templates',
    'Only insert assets into valid drop zones. Preserve exact logos and safe zones.',
    ...maps.flatMap((entry) => [
      `Template ${entry.template.id}: ${entry.template.name}`,
      ...entry.zones.map((zone) => `- ${zone.fieldId} [${zone.type}] ${zone.placeholder ?? zone.fieldName} formats=${zone.acceptedFormats?.join(', ') ?? 'any'}`),
    ]),
  ].join('\n');
};
