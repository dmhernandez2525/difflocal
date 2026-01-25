# SDD-005: Text Diff Engine

**Feature:** FEAT-006, FEAT-007 - Text Diff Algorithm & Options
**Phase:** 1
**Status:** Not Started
**Created:** January 25, 2026

---

## Overview

Implement the core text comparison engine using the jsdiff library, running in a Web Worker to keep the UI responsive. This is the foundation for all text-based comparisons.

---

## Goals

1. Compute accurate line, word, and character-level diffs
2. Offload processing to Web Worker for large files
3. Support common diff options (ignore whitespace, case, etc.)
4. Generate statistics for changes

---

## Technical Specification

### Diff Algorithm Selection

Using `jsdiff` (npm package `diff`) which implements Myers' diff algorithm:
- **diffLines**: Line-level comparison (default)
- **diffWords**: Word-level comparison
- **diffChars**: Character-level comparison

### Web Worker Implementation

```typescript
// src/workers/text-diff.worker.ts
import { diffLines, diffWords, diffChars, Change } from 'diff';

interface DiffRequest {
  type: 'compute';
  id: string;
  payload: {
    left: string;
    right: string;
    options: DiffOptions;
  };
}

interface DiffOptions {
  granularity: 'line' | 'word' | 'character';
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  trimTrailingWhitespace: boolean;
  ignoreBlankLines: boolean;
}

interface DiffLine {
  type: 'add' | 'remove' | 'unchanged';
  content: string;
  lineNumbers: {
    left?: number;
    right?: number;
  };
  changes?: CharChange[];  // For inline character highlighting
}

interface CharChange {
  type: 'add' | 'remove' | 'unchanged';
  value: string;
}

interface DiffResult {
  lines: DiffLine[];
  stats: {
    added: number;
    removed: number;
    unchanged: number;
    totalLeft: number;
    totalRight: number;
  };
}

interface DiffResponse {
  type: 'result' | 'error' | 'progress';
  id: string;
  payload: DiffResult | string | number;
}

self.onmessage = (event: MessageEvent<DiffRequest>) => {
  const { type, id, payload } = event.data;

  if (type !== 'compute') {
    return;
  }

  try {
    const result = computeDiff(payload.left, payload.right, payload.options);
    self.postMessage({ type: 'result', id, payload: result } as DiffResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ type: 'error', id, payload: message } as DiffResponse);
  }
};

function computeDiff(left: string, right: string, options: DiffOptions): DiffResult {
  // Preprocess content based on options
  let processedLeft = left;
  let processedRight = right;

  if (options.trimTrailingWhitespace) {
    processedLeft = trimTrailingWhitespace(processedLeft);
    processedRight = trimTrailingWhitespace(processedRight);
  }

  if (options.ignoreBlankLines) {
    processedLeft = removeBlankLines(processedLeft);
    processedRight = removeBlankLines(processedRight);
  }

  // Choose diff function based on granularity
  const diffFn = {
    line: diffLines,
    word: diffWords,
    character: diffChars,
  }[options.granularity];

  const changes = diffFn(processedLeft, processedRight, {
    ignoreWhitespace: options.ignoreWhitespace,
    ignoreCase: options.ignoreCase,
  });

  // Convert to our DiffLine format
  const lines = convertToLines(changes, options);

  // Calculate statistics
  const stats = calculateStats(lines);

  return { lines, stats };
}

function convertToLines(changes: Change[], options: DiffOptions): DiffLine[] {
  const lines: DiffLine[] = [];
  let leftLine = 1;
  let rightLine = 1;

  for (const change of changes) {
    const content = change.value;
    const contentLines = content.split('\n');

    // Handle trailing empty string from split
    if (contentLines[contentLines.length - 1] === '') {
      contentLines.pop();
    }

    for (const line of contentLines) {
      if (change.added) {
        lines.push({
          type: 'add',
          content: line,
          lineNumbers: { right: rightLine++ },
        });
      } else if (change.removed) {
        lines.push({
          type: 'remove',
          content: line,
          lineNumbers: { left: leftLine++ },
        });
      } else {
        lines.push({
          type: 'unchanged',
          content: line,
          lineNumbers: { left: leftLine++, right: rightLine++ },
        });
      }
    }
  }

  // Post-process to add character-level changes for modified lines
  if (options.granularity === 'line') {
    addInlineChanges(lines);
  }

  return lines;
}

function addInlineChanges(lines: DiffLine[]): void {
  // Find adjacent add/remove pairs and compute character diff
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i];
    const next = lines[i + 1];

    if (current.type === 'remove' && next.type === 'add') {
      const charChanges = diffChars(current.content, next.content);
      current.changes = charChanges
        .filter(c => !c.added)
        .map(c => ({
          type: c.removed ? 'remove' : 'unchanged',
          value: c.value,
        }));
      next.changes = charChanges
        .filter(c => !c.removed)
        .map(c => ({
          type: c.added ? 'add' : 'unchanged',
          value: c.value,
        }));
    }
  }
}

function calculateStats(lines: DiffLine[]): DiffResult['stats'] {
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const line of lines) {
    switch (line.type) {
      case 'add':
        added++;
        break;
      case 'remove':
        removed++;
        break;
      case 'unchanged':
        unchanged++;
        break;
    }
  }

  return {
    added,
    removed,
    unchanged,
    totalLeft: removed + unchanged,
    totalRight: added + unchanged,
  };
}

function trimTrailingWhitespace(text: string): string {
  return text.split('\n').map(line => line.trimEnd()).join('\n');
}

function removeBlankLines(text: string): string {
  return text.split('\n').filter(line => line.trim() !== '').join('\n');
}
```

### useDiff Hook

```typescript
// src/hooks/useDiff.ts
import { useState, useCallback, useMemo } from 'react';
import { useWorker } from './useWorker';
import type { DiffResult, DiffOptions } from '@/types/diff';

interface UseDiffReturn {
  result: DiffResult | null;
  loading: boolean;
  error: Error | null;
  compute: (left: string, right: string, options: DiffOptions) => void;
  reset: () => void;
}

const DEFAULT_OPTIONS: DiffOptions = {
  granularity: 'line',
  ignoreWhitespace: false,
  ignoreCase: false,
  trimTrailingWhitespace: false,
  ignoreBlankLines: false,
};

export function useDiff(): UseDiffReturn {
  const createWorker = useMemo(
    () => () => new Worker(
      new URL('@/workers/text-diff.worker.ts', import.meta.url),
      { type: 'module' }
    ),
    []
  );

  const {
    execute,
    result,
    loading,
    error,
    cancel,
  } = useWorker<DiffInput, DiffResult>(createWorker);

  const compute = useCallback(
    (left: string, right: string, options: Partial<DiffOptions> = {}) => {
      execute({
        left,
        right,
        options: { ...DEFAULT_OPTIONS, ...options },
      });
    },
    [execute]
  );

  const reset = useCallback(() => {
    cancel();
  }, [cancel]);

  return { result, loading, error, compute, reset };
}
```

### Type Definitions

```typescript
// src/types/diff.ts
export type DiffGranularity = 'line' | 'word' | 'character';

export interface DiffOptions {
  granularity: DiffGranularity;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  trimTrailingWhitespace: boolean;
  ignoreBlankLines: boolean;
}

export type LineType = 'add' | 'remove' | 'unchanged';

export interface CharChange {
  type: 'add' | 'remove' | 'unchanged';
  value: string;
}

export interface DiffLine {
  type: LineType;
  content: string;
  lineNumbers: {
    left?: number;
    right?: number;
  };
  changes?: CharChange[];
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
  totalLeft: number;
  totalRight: number;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: DiffStats;
}

export interface DiffInput {
  left: string;
  right: string;
  options: DiffOptions;
}
```

---

## Diff Options Implementation

### Ignore Whitespace

```typescript
// jsdiff built-in option
diffLines(left, right, { ignoreWhitespace: true });
```

Treats lines as equal if they differ only in whitespace.

### Ignore Case

```typescript
// jsdiff built-in option
diffLines(left, right, { ignoreCase: true });
```

Case-insensitive comparison.

### Trim Trailing Whitespace

Preprocesses content to remove trailing whitespace from each line before comparison.

### Ignore Blank Lines

Preprocesses content to remove entirely blank lines before comparison.

---

## Performance Considerations

### Large File Handling

For files > 1MB, the worker should report progress:

```typescript
function computeDiffWithProgress(
  left: string,
  right: string,
  options: DiffOptions
): DiffResult {
  const totalSize = left.length + right.length;

  // Report start
  if (totalSize > 1_000_000) {
    self.postMessage({ type: 'progress', id, payload: 0 });
  }

  // Compute diff
  const changes = diffLines(left, right, options);

  // Report progress during conversion
  if (totalSize > 1_000_000) {
    self.postMessage({ type: 'progress', id, payload: 50 });
  }

  const lines = convertToLines(changes, options);

  // Report completion
  if (totalSize > 1_000_000) {
    self.postMessage({ type: 'progress', id, payload: 100 });
  }

  return { lines, stats: calculateStats(lines) };
}
```

### Memory Efficiency

For very large files (> 10MB), use streaming/chunked approach:

```typescript
// Future enhancement - chunked diff for huge files
function computeChunkedDiff(
  left: string,
  right: string,
  options: DiffOptions,
  chunkSize: number = 100_000
): DiffResult {
  // Split into chunks
  // Process chunks
  // Merge results
  // This is a placeholder for Phase 2 optimization
}
```

---

## Acceptance Criteria

- [ ] Line-level diff produces correct results for basic cases
- [ ] Word-level diff works correctly
- [ ] Character-level diff works correctly
- [ ] Ignore whitespace option functions correctly
- [ ] Ignore case option functions correctly
- [ ] Trim trailing whitespace option functions correctly
- [ ] Ignore blank lines option functions correctly
- [ ] Statistics (added, removed, unchanged) are accurate
- [ ] Worker processes 1MB file in < 2 seconds
- [ ] Worker processes 10MB file without crashing
- [ ] Inline character changes computed for modified lines

---

## Test Cases

### Basic Diff

```typescript
describe('text-diff.worker', () => {
  it('computes simple line diff', async () => {
    const result = await computeInWorker({
      left: 'line1\nline2\nline3',
      right: 'line1\nmodified\nline3',
      options: defaultOptions,
    });

    expect(result.lines).toHaveLength(4); // unchanged, remove, add, unchanged
    expect(result.stats.added).toBe(1);
    expect(result.stats.removed).toBe(1);
    expect(result.stats.unchanged).toBe(2);
  });

  it('handles empty inputs', async () => {
    const result = await computeInWorker({
      left: '',
      right: 'new content',
      options: defaultOptions,
    });

    expect(result.stats.added).toBe(1);
    expect(result.stats.removed).toBe(0);
  });

  it('handles identical inputs', async () => {
    const result = await computeInWorker({
      left: 'same\ncontent',
      right: 'same\ncontent',
      options: defaultOptions,
    });

    expect(result.stats.added).toBe(0);
    expect(result.stats.removed).toBe(0);
    expect(result.stats.unchanged).toBe(2);
  });
});

describe('diff options', () => {
  it('ignores whitespace when option enabled', async () => {
    const result = await computeInWorker({
      left: 'hello world',
      right: 'hello  world',
      options: { ...defaultOptions, ignoreWhitespace: true },
    });

    expect(result.stats.unchanged).toBe(1);
  });

  it('ignores case when option enabled', async () => {
    const result = await computeInWorker({
      left: 'Hello World',
      right: 'hello world',
      options: { ...defaultOptions, ignoreCase: true },
    });

    expect(result.stats.unchanged).toBe(1);
  });
});
```

### Edge Cases

```typescript
describe('edge cases', () => {
  it('handles binary-looking content', async () => {
    const result = await computeInWorker({
      left: 'line1\x00binary',
      right: 'line1\x00modified',
      options: defaultOptions,
    });

    expect(result.lines.length).toBeGreaterThan(0);
  });

  it('handles very long lines', async () => {
    const longLine = 'a'.repeat(100_000);
    const result = await computeInWorker({
      left: longLine,
      right: longLine + 'b',
      options: defaultOptions,
    });

    expect(result.stats.removed).toBe(1);
    expect(result.stats.added).toBe(1);
  });

  it('handles mixed line endings', async () => {
    const result = await computeInWorker({
      left: 'line1\r\nline2\n',
      right: 'line1\nline2\r\n',
      options: defaultOptions,
    });

    // Should normalize or handle appropriately
    expect(result.lines.length).toBeGreaterThan(0);
  });
});
```

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All test cases passing
- [ ] Worker handles errors gracefully
- [ ] Types exported for consumer use
- [ ] No memory leaks (verified with DevTools)
- [ ] Performance benchmarks documented
