# DiffLocal Coding Standards

**Version:** 1.0.0
**Last Updated:** January 25, 2026

---

## Table of Contents

1. [Critical Rules](#critical-rules)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React Patterns](#react-patterns)
4. [Component Structure](#component-structure)
5. [State Management](#state-management)
6. [Web Workers](#web-workers)
7. [Styling](#styling)
8. [Testing](#testing)
9. [Accessibility](#accessibility)
10. [Performance](#performance)

---

## Critical Rules

### Auto-Reject Patterns

These patterns will cause PR rejection:

```typescript
// NEVER USE:
any                    // Use specific types or unknown
// @ts-ignore          // Fix the type error properly
// @ts-expect-error    // Same as above
// eslint-disable      // Follow lint rules
console.log           // Use debug utility in development
alert()               // Use toast/notification component
// TODO:              // Create GitHub issue instead
```

### Required Patterns

```typescript
// ALWAYS USE:

// 1. Explicit return types for functions
function processFile(input: string): ProcessResult {
  // ...
}

// 2. Interface over type for objects
interface DiffOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

// 3. cn() utility for class names
import { cn } from '@/lib/utils';
const className = cn('base-class', condition && 'conditional-class');

// 4. Error boundaries for async operations
try {
  const result = await asyncOperation();
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error
  }
  throw error; // Re-throw if not handled
}

// 5. Named exports (not default)
export function Component() { }  // Good
export default function Component() { }  // Avoid
```

---

## TypeScript Guidelines

### Strict Mode

TypeScript strict mode is enabled. All code must pass without errors.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Definitions

```typescript
// Define types in src/types/ directory
// Use .ts extension for type-only files

// src/types/diff.ts
export interface DiffLine {
  type: 'add' | 'remove' | 'unchanged';
  content: string;
  lineNumber: {
    left?: number;
    right?: number;
  };
}

export interface DiffResult {
  lines: DiffLine[];
  stats: DiffStats;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}
```

### Enums vs Union Types

```typescript
// Prefer union types for simple cases
type ViewMode = 'side-by-side' | 'unified' | 'inline';

// Use const objects for values that need runtime access
const ViewModes = {
  SIDE_BY_SIDE: 'side-by-side',
  UNIFIED: 'unified',
  INLINE: 'inline',
} as const;

type ViewMode = typeof ViewModes[keyof typeof ViewModes];
```

### Generics

```typescript
// Use descriptive generic names
interface ApiResponse<TData> {
  data: TData;
  error?: string;
}

// Constrain generics when appropriate
function processItems<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map(item => [item.id, item]));
}
```

---

## React Patterns

### Component Definition

```typescript
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// 1. Props interface above component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

// 2. Named export, not default
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className,
}: ButtonProps) {
  // 3. Hooks at top
  const [isHovered, setIsHovered] = useState(false);

  // 4. Callbacks wrapped in useCallback if passed to children
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  // 5. Early returns for edge cases
  if (!children) {
    return null;
  }

  // 6. Single return with JSX
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'button-base',
        variant === 'primary' && 'button-primary',
        variant === 'secondary' && 'button-secondary',
        size === 'sm' && 'button-sm',
        disabled && 'button-disabled',
        className
      )}
    >
      {children}
    </button>
  );
}
```

### Hooks

```typescript
// Custom hooks in src/hooks/
// Prefix with "use"
// Single responsibility

// src/hooks/useDiff.ts
import { useState, useCallback } from 'react';
import { useWorker } from './useWorker';
import type { DiffResult, DiffOptions } from '@/types/diff';

interface UseDiffReturn {
  result: DiffResult | null;
  loading: boolean;
  error: Error | null;
  compute: (left: string, right: string, options: DiffOptions) => void;
  reset: () => void;
}

export function useDiff(): UseDiffReturn {
  const [result, setResult] = useState<DiffResult | null>(null);
  const { execute, loading, error } = useWorker<DiffInput, DiffResult>(
    () => new Worker(new URL('@/workers/text-diff.worker', import.meta.url))
  );

  const compute = useCallback((left: string, right: string, options: DiffOptions) => {
    execute({ left, right, options });
  }, [execute]);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { result, loading, error, compute, reset };
}
```

### Event Handlers

```typescript
// Name: handle + Event
// Type: React.[Event]Handler or inline

interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

export function Input({ value, onChange }: InputProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Handle enter
    }
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
```

---

## Component Structure

### File Organization

```
src/components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── diff/                  # Diff-specific components
│   ├── TextDiffView.tsx
│   ├── TextDiffView.test.tsx
│   ├── DiffLine.tsx
│   └── DiffStats.tsx
├── layout/                # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
└── shared/                # Shared components
    ├── FileDropzone.tsx
    └── ShareButton.tsx
```

### Component Size

- **Max 200 lines** per component file
- Extract sub-components when exceeding limit
- One component per file (with small helper components allowed)

### Props Drilling

- **Max 3 levels** of props drilling
- Use Zustand or context for deeper state sharing
- Prefer composition over prop drilling

---

## State Management

### Zustand Store Structure

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDiffSlice, DiffSlice } from './diffSlice';
import { createSettingsSlice, SettingsSlice } from './settingsSlice';

type StoreState = DiffSlice & SettingsSlice;

export const useStore = create<StoreState>()(
  persist(
    (...args) => ({
      ...createDiffSlice(...args),
      ...createSettingsSlice(...args),
    }),
    {
      name: 'difflocal-storage',
      partialize: (state) => ({
        // Only persist settings, not diff content
        theme: state.theme,
        viewMode: state.viewMode,
        diffOptions: state.diffOptions,
      }),
    }
  )
);
```

```typescript
// src/store/diffSlice.ts
import { StateCreator } from 'zustand';

export interface DiffSlice {
  leftContent: string;
  rightContent: string;
  result: DiffResult | null;
  setLeftContent: (content: string) => void;
  setRightContent: (content: string) => void;
  setResult: (result: DiffResult | null) => void;
  reset: () => void;
}

export const createDiffSlice: StateCreator<DiffSlice> = (set) => ({
  leftContent: '',
  rightContent: '',
  result: null,
  setLeftContent: (content) => set({ leftContent: content }),
  setRightContent: (content) => set({ rightContent: content }),
  setResult: (result) => set({ result }),
  reset: () => set({ leftContent: '', rightContent: '', result: null }),
});
```

### State Selection

```typescript
// Select only needed state to prevent unnecessary re-renders
const viewMode = useStore((state) => state.viewMode);
const setViewMode = useStore((state) => state.setViewMode);

// For multiple values, use shallow comparison
import { shallow } from 'zustand/shallow';

const { leftContent, rightContent } = useStore(
  (state) => ({ leftContent: state.leftContent, rightContent: state.rightContent }),
  shallow
);
```

---

## Web Workers

### Worker File Structure

```typescript
// src/workers/text-diff.worker.ts
import { diffLines, diffWords, Change } from 'diff';

// Types for messages
interface DiffRequest {
  type: 'compute';
  id: string;
  payload: {
    left: string;
    right: string;
    options: DiffOptions;
  };
}

interface DiffResponse {
  type: 'result' | 'error' | 'progress';
  id: string;
  payload: DiffResult | Error | number;
}

// Handle messages
self.onmessage = async (event: MessageEvent<DiffRequest>) => {
  const { type, id, payload } = event.data;

  if (type !== 'compute') {
    return;
  }

  try {
    // Report progress for large files
    if (payload.left.length > 100000) {
      self.postMessage({ type: 'progress', id, payload: 0 });
    }

    const result = computeDiff(payload.left, payload.right, payload.options);

    self.postMessage({ type: 'result', id, payload: result });
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      payload: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

function computeDiff(left: string, right: string, options: DiffOptions): DiffResult {
  const changes = diffLines(left, right, {
    ignoreWhitespace: options.ignoreWhitespace,
  });

  // Process changes into DiffResult
  // ...

  return result;
}
```

### useWorker Hook

```typescript
// src/hooks/useWorker.ts
import { useEffect, useRef, useCallback, useState } from 'react';

interface UseWorkerOptions {
  onProgress?: (progress: number) => void;
}

interface UseWorkerReturn<TInput, TOutput> {
  execute: (input: TInput) => void;
  result: TOutput | null;
  loading: boolean;
  error: Error | null;
  cancel: () => void;
}

export function useWorker<TInput, TOutput>(
  createWorker: () => Worker,
  options: UseWorkerOptions = {}
): UseWorkerReturn<TInput, TOutput> {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  const [result, setResult] = useState<TOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    workerRef.current = createWorker();

    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'result':
          setResult(payload as TOutput);
          setLoading(false);
          break;
        case 'error':
          setError(new Error(payload as string));
          setLoading(false);
          break;
        case 'progress':
          options.onProgress?.(payload as number);
          break;
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [createWorker, options]);

  const execute = useCallback((input: TInput) => {
    const id = String(++requestIdRef.current);
    setLoading(true);
    setError(null);
    workerRef.current?.postMessage({ type: 'compute', id, payload: input });
  }, []);

  const cancel = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = createWorker();
    setLoading(false);
  }, [createWorker]);

  return { execute, result, loading, error, cancel };
}
```

---

## Styling

### Tailwind CSS Usage

```typescript
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

<div
  className={cn(
    // Base styles
    'flex items-center gap-2 p-4 rounded-lg',
    // Conditional styles
    isActive && 'bg-primary text-primary-foreground',
    isDisabled && 'opacity-50 cursor-not-allowed',
    // Passed className for overrides
    className
  )}
/>
```

### CSS Variables for Theming

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... */

    /* Diff-specific colors */
    --diff-add-bg: 120 40% 95%;
    --diff-add-text: 120 40% 25%;
    --diff-remove-bg: 0 40% 95%;
    --diff-remove-text: 0 40% 25%;
    --diff-modify-bg: 45 40% 95%;
    --diff-modify-text: 45 40% 25%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode overrides */

    --diff-add-bg: 120 30% 15%;
    --diff-add-text: 120 40% 75%;
    --diff-remove-bg: 0 30% 15%;
    --diff-remove-text: 0 40% 75%;
  }
}
```

### No Inline Styles

```typescript
// BAD
<div style={{ marginTop: '16px' }} />

// GOOD
<div className="mt-4" />
```

---

## Testing

### Test File Location

Co-locate test files with components:

```
src/components/diff/
├── TextDiffView.tsx
└── TextDiffView.test.tsx
```

### Test Structure

```typescript
// TextDiffView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TextDiffView } from './TextDiffView';

describe('TextDiffView', () => {
  // Group related tests
  describe('rendering', () => {
    it('renders empty state when no content provided', () => {
      render(<TextDiffView left="" right="" />);
      expect(screen.getByText(/paste or drop/i)).toBeInTheDocument();
    });

    it('renders diff lines when content provided', () => {
      render(<TextDiffView left="hello" right="hello world" />);
      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('world')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onLineClick when line is clicked', () => {
      const handleLineClick = vi.fn();
      render(
        <TextDiffView
          left="line 1"
          right="line 2"
          onLineClick={handleLineClick}
        />
      );

      fireEvent.click(screen.getByText('line 1'));
      expect(handleLineClick).toHaveBeenCalledWith(1, 'left');
    });
  });

  describe('accessibility', () => {
    it('has accessible name for diff region', () => {
      render(<TextDiffView left="a" right="b" />);
      expect(screen.getByRole('region', { name: /diff/i })).toBeInTheDocument();
    });
  });
});
```

### Coverage Requirements

- **Minimum 80%** coverage for branches, functions, lines, statements
- **100%** coverage for utility functions
- Critical paths must have integration tests

---

## Accessibility

### Requirements

- **WCAG 2.1 AA** compliance
- **Color contrast**: 4.5:1 minimum for normal text
- **Keyboard navigation**: All interactive elements focusable
- **Screen readers**: Proper ARIA labels and roles

### Patterns

```typescript
// Provide accessible names
<button aria-label="Copy diff to clipboard">
  <CopyIcon />
</button>

// Use semantic HTML
<main>
  <nav aria-label="Diff navigation">...</nav>
  <section aria-label="Diff viewer">...</section>
</main>

// Announce dynamic changes
<div aria-live="polite" aria-atomic="true">
  {loading ? 'Computing diff...' : `${stats.added} lines added, ${stats.removed} removed`}
</div>

// Don't rely solely on color
<span className={cn(
  'diff-line',
  type === 'add' && 'bg-diff-add',
)}>
  {type === 'add' && <span className="sr-only">Added: </span>}
  {content}
</span>
```

### Color Independence

Always include non-color indicators:
- Icons or symbols for added/removed
- Text labels or prefixes
- Patterns or borders as fallback

---

## Performance

### Rendering Optimization

```typescript
// Memoize expensive computations
const processedLines = useMemo(() => {
  return lines.map(line => processLine(line, options));
}, [lines, options]);

// Memoize callbacks passed to children
const handleLineClick = useCallback((lineNumber: number) => {
  setSelectedLine(lineNumber);
}, []);

// Use React.memo for pure components
export const DiffLine = React.memo(function DiffLine({ line }: DiffLineProps) {
  return <div>{line.content}</div>;
});
```

### Virtual Scrolling

Use virtual scrolling for lists > 100 items:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedDiff({ lines }: { lines: DiffLine[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24, // Line height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <DiffLine
            key={virtualRow.key}
            line={lines[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Bundle Size

- Monitor bundle size in CI
- Use dynamic imports for heavy dependencies
- Tree-shake unused code

```typescript
// Dynamic import for PDF.js (large dependency)
const loadPdfWorker = async () => {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  return getDocument;
};
```

---

## Git Commit Messages

Follow conventional commits:

```
type(scope): description

feat(diff): add character-level highlighting
fix(ui): correct dark mode contrast for diff lines
perf(worker): optimize large file processing
docs(readme): update installation instructions
test(diff): add tests for edge cases
refactor(store): simplify state management
```

Types: `feat`, `fix`, `perf`, `docs`, `test`, `refactor`, `style`, `chore`

---

**Document Version:** 1.0.0
