import { describe, expect, it } from 'vitest';
import { ADVANCED_DECK_TEMPLATES } from './advancedDeckTemplates';

describe('ADVANCED_DECK_TEMPLATES', () => {
  it('ships exactly ten advanced gallery templates', () => {
    expect(ADVANCED_DECK_TEMPLATES).toHaveLength(10);
  });

  it('has unique ids and complete palette data', () => {
    const ids = new Set(ADVANCED_DECK_TEMPLATES.map((template) => template.id));
    expect(ids.size).toBe(ADVANCED_DECK_TEMPLATES.length);
    for (const template of ADVANCED_DECK_TEMPLATES) {
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.themePrompt.length).toBeGreaterThan(80);
      expect(template.palette.bg).toMatch(/^#/);
      expect(template.palette.text).toMatch(/^#/);
      expect(template.palette.accent).toMatch(/^#/);
      expect(template.palette.secondary).toMatch(/^#/);
    }
  });
});
