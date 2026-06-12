import { describe, expect, it } from 'vitest';
import { buildPresentationDeckActionPlan } from './presentationDeckActionPlannerService';

describe('presentationDeckActionPlannerService', () => {
  it('creates an action plan for a brand system action', () => {
    const plan = buildPresentationDeckActionPlan('apply_brand_system');

    expect(plan.toolId).toBe('apply_brand_system');
    expect(plan.prerequisites.some((item) => item.includes('Brand Brain'))).toBe(true);
    expect(plan.promptBlock).toContain('PRESENTATION STUDIO ACTION PLAN');
    expect(plan.promptBlock).toContain('Never invent');
  });
});
