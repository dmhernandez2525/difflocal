import { describe, it, expect } from 'vitest';
import {
  generateDiffLines,
  calculateDiffStats,
  generateDemoResult,
  DEMO_SCENARIOS,
} from './demoData';

describe('demoData', () => {
  describe('generateDiffLines', () => {
    it('should return empty array for identical strings', () => {
      const result = generateDiffLines('hello', 'hello');
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe('unchanged');
    });

    it('should detect added lines', () => {
      const result = generateDiffLines('original', 'original\nnew line');
      const addedLines = result.filter((l) => l.type === 'add');
      expect(addedLines.length).toBeGreaterThanOrEqual(1);
      expect(addedLines.some((l) => l.content === 'new line')).toBe(true);
    });

    it('should detect removed lines', () => {
      const result = generateDiffLines('old line\noriginal', 'original');
      const removedLines = result.filter((l) => l.type === 'remove');
      expect(removedLines.length).toBeGreaterThanOrEqual(1);
      expect(removedLines.some((l) => l.content === 'old line')).toBe(true);
    });

    it('should handle multi-line changes', () => {
      const original = 'line1\nline2\nline3';
      const modified = 'line1\nmodified\nline3';
      const result = generateDiffLines(original, modified);

      const unchanged = result.filter((l) => l.type === 'unchanged');
      const removed = result.filter((l) => l.type === 'remove');
      const added = result.filter((l) => l.type === 'add');

      expect(unchanged.length).toBeGreaterThanOrEqual(2);
      expect(removed.length + added.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateDiffStats', () => {
    it('should calculate correct stats', () => {
      const lines = [
        { type: 'unchanged' as const, content: 'a', lineNumbers: { left: 1, right: 1 } },
        { type: 'add' as const, content: 'b', lineNumbers: { right: 2 } },
        { type: 'remove' as const, content: 'c', lineNumbers: { left: 2 } },
      ];
      const stats = calculateDiffStats(lines, 2, 2);

      expect(stats.unchanged).toBe(1);
      expect(stats.added).toBe(1);
      expect(stats.removed).toBe(1);
      expect(stats.totalLeft).toBe(2);
      expect(stats.totalRight).toBe(2);
    });
  });

  describe('generateDemoResult', () => {
    it('should return a complete diff result', () => {
      const result = generateDemoResult('hello', 'world');

      expect(result).toHaveProperty('lines');
      expect(result).toHaveProperty('stats');
      expect(Array.isArray(result.lines)).toBe(true);
      expect(typeof result.stats.added).toBe('number');
      expect(typeof result.stats.removed).toBe('number');
      expect(typeof result.stats.unchanged).toBe('number');
    });
  });

  describe('DEMO_SCENARIOS', () => {
    it('should have at least one scenario', () => {
      expect(DEMO_SCENARIOS.length).toBeGreaterThan(0);
    });

    it('each scenario should have required properties', () => {
      for (const scenario of DEMO_SCENARIOS) {
        expect(scenario).toHaveProperty('id');
        expect(scenario).toHaveProperty('title');
        expect(scenario).toHaveProperty('description');
        expect(scenario).toHaveProperty('category');
        expect(scenario).toHaveProperty('original');
        expect(scenario).toHaveProperty('modified');
        expect(scenario).toHaveProperty('filename');
      }
    });
  });
});
