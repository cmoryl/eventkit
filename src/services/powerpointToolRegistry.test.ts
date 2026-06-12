import { describe, expect, it } from 'vitest';
import { buildPowerPointToolPromptBlock, getPowerPointTool, getPowerPointToolsByCategory, powerpointToolRegistry } from './powerpointToolRegistry';

describe('powerpointToolRegistry', () => {
  it('contains advanced PowerPoint creation tools', () => {
    expect(powerpointToolRegistry.length).toBeGreaterThan(10);
    expect(getPowerPointTool('apply_brand_system')?.requiresBrandBrain).toBe(true);
    expect(getPowerPointTool('audit_deck')?.category).toBe('audit');
    expect(getPowerPointToolsByCategory('transform').map((tool) => tool.id)).toContain('convert_bullets_to_chart');
  });

  it('builds an agent prompt block', () => {
    const block = buildPowerPointToolPromptBlock();

    expect(block).toContain('POWERPOINT CREATION TOOLBOX');
    expect(block).toContain('apply_brand_system');
    expect(block).toContain('export_editable_pptx');
  });
});
