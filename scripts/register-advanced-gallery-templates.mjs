import fs from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'src/components/powerpoint/composer/TemplateGallery.tsx');
const source = fs.readFileSync(filePath, 'utf8');

let next = source;

if (!next.includes("./advancedDeckTemplates")) {
  next = next.replace(
    'import { TemplatePosterPreview } from "./TemplatePosterPreview";\n',
    'import { TemplatePosterPreview } from "./TemplatePosterPreview";\nimport { ADVANCED_DECK_TEMPLATES } from "./advancedDeckTemplates";\n',
  );
}

if (!next.includes('FEATURED_DECK_TEMPLATES')) {
  next = next.replace(
    'export const ALL_DECK_TEMPLATES: DeckTemplate[] = [...DECK_TEMPLATES, ...LIBRARY_TEMPLATES];',
    'export const FEATURED_DECK_TEMPLATES: DeckTemplate[] = [...DECK_TEMPLATES, ...ADVANCED_DECK_TEMPLATES];\nexport const ALL_DECK_TEMPLATES: DeckTemplate[] = [...FEATURED_DECK_TEMPLATES, ...LIBRARY_TEMPLATES];',
  );
}

next = next
  .replace('DECK_TEMPLATES.some((featured) => featured.id === t.id)', 'FEATURED_DECK_TEMPLATES.some((featured) => featured.id === t.id)')
  .replace('const heroTemplates = savedAsDeckTemplates.length ? [...savedAsDeckTemplates.slice(0, 2), ...DECK_TEMPLATES].slice(0, 8) : DECK_TEMPLATES;', 'const heroTemplates = savedAsDeckTemplates.length ? [...savedAsDeckTemplates.slice(0, 2), ...FEATURED_DECK_TEMPLATES].slice(0, 8) : FEATURED_DECK_TEMPLATES.slice(0, 12);')
  .replace('{(isShowcase ? heroTemplates : DECK_TEMPLATES).map((t) => renderTemplate(t))}', '{(isShowcase ? heroTemplates : FEATURED_DECK_TEMPLATES.slice(0, 12)).map((t) => renderTemplate(t))}')
  .replace('{filtered.length} showing · {DECK_TEMPLATES.length} featured · {LIBRARY_TEMPLATES.length} library · {savedAsDeckTemplates.length} saved', '{filtered.length} showing · {FEATURED_DECK_TEMPLATES.length} featured · {LIBRARY_TEMPLATES.length} library · {savedAsDeckTemplates.length} saved')
  .replace('{DECK_TEMPLATES.map((t) => renderTemplate(t))}', '{FEATURED_DECK_TEMPLATES.map((t) => renderTemplate(t))}');

if (next === source) {
  console.log('No TemplateGallery changes needed.');
  process.exit(0);
}

fs.writeFileSync(filePath, next);
console.log('Registered advanced gallery templates in TemplateGallery.tsx');
