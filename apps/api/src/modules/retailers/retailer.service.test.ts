import { describe, expect, it } from 'vitest';
import { normalizeSlug } from './retailer.mapper.js';
import { RetailerModel } from './retailer.model.js';
import { createRetailerSchema, updateRetailerSchema } from './retailer.schemas.js';

describe('retailer domain rules', () => {
  it('normalizes generated slugs by removing accents and unsafe characters', () => {
    expect(normalizeSlug('Mayorista Ágil S.A.!')).toBe('mayorista-agil-s-a');
  });

  it('rejects empty PATCH bodies', () => {
    expect(() => updateRetailerSchema.parse({})).toThrow();
  });

  it('validates create payload and urls', () => {
    expect(createRetailerSchema.parse({ name: 'Makro', websiteUrl: 'https://example.com' }).name).toBe('Makro');
    expect(() => createRetailerSchema.parse({ name: 'M', logoUrl: 'not-url' })).toThrow();
  });

  it('defines a unique slug index', () => {
    expect(RetailerModel.schema.indexes()).toContainEqual([{ slug: 1 }, { unique: true, background: true }]);
  });
});
