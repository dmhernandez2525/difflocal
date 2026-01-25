# DiffLocal Architecture Patterns

**Version:** 1.0.0
**Last Updated:** January 25, 2026

---

## Overview

This document describes the architectural patterns used in DiffLocal. These patterns ensure consistent implementation across all features while maintaining privacy, performance, and user experience.

---

## Core Architecture

### Client-Only Processing

DiffLocal is a **100% client-side application**. This is non-negotiable.

```
User's Machine
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  React SPA                                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │   │
│  │  │ UI      │ │ State   │ │ File Processing │   │   │
│  │  │ (React) │ │(Zustand)│ │ (Web Workers)   │   │   │
│  │  └─────────┘ └─────────┘ └─────────────────┘   │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ Local Storage (IndexedDB, localStorage) │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Files never leave this boundary                        │
└─────────────────────────────────────────────────────────┘
           │
           │ Only static assets (JS, CSS, HTML)
           ▼
    Static Hosting (Vercel)
```

### Enforcement

1. **No fetch() to external APIs with user data**
2. **No FormData uploads**
3. **No WebSocket connections for data transfer**
4. **CSP headers restrict network access**

---

## Web Worker Pattern

Heavy processing runs in Web Workers to keep the UI responsive.

### Worker Communication Protocol

```typescript
// Message structure
interface WorkerRequest<T = unknown> {
  type: 'compute' | 'cancel';
  id: string;          // Unique request ID for correlation
  payload: T;
}

interface WorkerResponse<T = unknown> {
  type: 'result' | 'error' | 'progress';
  id: string;          // Matches request ID
  payload: T;
}

// Flow
Main Thread                      Worker
    │                              │
    │  { type: 'compute', id, payload }
    │ ──────────────────────────>  │
    │                              │
    │  { type: 'progress', id, 25 }│
    │ <──────────────────────────  │
    │                              │
    │  { type: 'progress', id, 50 }│
    │ <──────────────────────────  │
    │                              │
    │  { type: 'result', id, data }│
    │ <──────────────────────────  │
```

### Worker Registry

```typescript
// src/lib/workers/registry.ts
export const workers = {
  textDiff: () => new Worker(
    new URL('@/workers/text-diff.worker.ts', import.meta.url),
    { type: 'module' }
  ),
  imageDiff: () => new Worker(
    new URL('@/workers/image-diff.worker.ts', import.meta.url),
    { type: 'module' }
  ),
  pdfParse: () => new Worker(
    new URL('@/workers/pdf-parse.worker.ts', import.meta.url),
    { type: 'module' }
  ),
  excelParse: () => new Worker(
    new URL('@/workers/excel-parse.worker.ts', import.meta.url),
    { type: 'module' }
  ),
};
```

### Transferable Objects

For large data, use Transferable Objects to avoid copying:

```typescript
// Worker sending ArrayBuffer
const buffer = new ArrayBuffer(1024 * 1024);
// ... fill buffer ...
self.postMessage(
  { type: 'result', id, payload: buffer },
  [buffer]  // Transfer ownership, no copy
);

// Main thread receiving
worker.onmessage = (event) => {
  const buffer = event.data.payload;  // Ownership transferred
};
```

---

## State Management Pattern

### Store Structure

```typescript
// Slices for organization
interface StoreState {
  // Diff slice - transient, not persisted
  diff: {
    left: ContentState;
    right: ContentState;
    result: DiffResult | null;
    loading: boolean;
    error: Error | null;
  };

  // Settings slice - persisted to localStorage
  settings: {
    theme: 'light' | 'dark' | 'system';
    viewMode: 'side-by-side' | 'unified' | 'inline';
    diffOptions: DiffOptions;
  };

  // Actions
  setLeftContent: (content: string, metadata?: FileMetadata) => void;
  setRightContent: (content: string, metadata?: FileMetadata) => void;
  setResult: (result: DiffResult) => void;
  setTheme: (theme: Theme) => void;
  // ...
}
```

### Persistence Strategy

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'difflocal-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user preferences
        settings: state.settings,
      }),
      // Never persist file contents or diff results
    }
  )
);
```

---

## URL Sharing Pattern

Share diffs via URL fragments without server storage.

### Encoding Flow

```typescript
// src/lib/share/encode.ts
import LZString from 'lz-string';

interface ShareableState {
  left: string;
  right: string;
  options: DiffOptions;
  version: number;  // For future format changes
}

const SHARE_VERSION = 1;
const MAX_URL_LENGTH = 8000;  // Safe limit for most browsers

export function encodeShareUrl(state: ShareableState): string | null {
  const payload = JSON.stringify({
    ...state,
    version: SHARE_VERSION,
  });

  const compressed = LZString.compressToEncodedURIComponent(payload);

  if (compressed.length > MAX_URL_LENGTH) {
    return null;  // Too large to share via URL
  }

  return `${window.location.origin}${window.location.pathname}#${compressed}`;
}

export function decodeShareUrl(hash: string): ShareableState | null {
  if (!hash || hash.length < 2) {
    return null;
  }

  try {
    const compressed = hash.slice(1);  // Remove #
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);

    if (!decompressed) {
      return null;
    }

    const state = JSON.parse(decompressed);

    // Version migration if needed
    if (state.version !== SHARE_VERSION) {
      return migrateState(state);
    }

    return state;
  } catch {
    return null;
  }
}
```

### URL Fragment Security

URL fragments are **never sent to the server**:

```
https://difflocal.dev/text#eJxLy0ktLlGyULA...
                           ▲
                           │
              This part stays in browser only
              Server only sees: /text
```

This is enforced by the HTTP specification (RFC 3986).

---

## File Input Pattern

### Unified FileDropzone Component

```typescript
// src/components/shared/FileDropzone.tsx
interface FileDropzoneProps {
  onFile: (content: string, metadata: FileMetadata) => void;
  accept?: string[];           // MIME types
  maxSize?: number;           // Bytes
  placeholder?: React.ReactNode;
  className?: string;
}

export function FileDropzone({
  onFile,
  accept,
  maxSize = 50 * 1024 * 1024,  // 50MB default
  placeholder,
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    // Validate
    if (maxSize && file.size > maxSize) {
      throw new FileTooLargeError(file.size, maxSize);
    }

    if (accept && !accept.includes(file.type)) {
      throw new InvalidFileTypeError(file.type, accept);
    }

    // Read
    const content = await readFileAsText(file);

    onFile(content, {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });
  };

  // ... drag/drop handlers, file input, paste handler
}
```

### Input Methods

1. **Drag & Drop** - Primary for files
2. **File Picker** - Click to select
3. **Paste** - Ctrl+V for text/images
4. **Text Area** - Direct typing for small content

---

## Diff Visualization Pattern

### View Mode Architecture

```typescript
// Base interface for all diff views
interface DiffViewProps {
  result: DiffResult;
  options: ViewOptions;
  onLineClick?: (line: number, side: 'left' | 'right') => void;
  className?: string;
}

// View components
export function SideBySideView({ result, options, onLineClick }: DiffViewProps) { }
export function UnifiedView({ result, options, onLineClick }: DiffViewProps) { }
export function InlineView({ result, options, onLineClick }: DiffViewProps) { }

// Container that switches views
export function DiffViewer({ result, viewMode, ...props }: DiffViewerProps) {
  switch (viewMode) {
    case 'side-by-side':
      return <SideBySideView result={result} {...props} />;
    case 'unified':
      return <UnifiedView result={result} {...props} />;
    case 'inline':
      return <InlineView result={result} {...props} />;
  }
}
```

### Line Rendering

```typescript
interface DiffLine {
  type: 'add' | 'remove' | 'unchanged' | 'modify';
  content: string;
  lineNumbers: {
    left?: number;
    right?: number;
  };
  // For character-level highlighting within modified lines
  changes?: Array<{
    type: 'add' | 'remove' | 'unchanged';
    value: string;
  }>;
}

export function DiffLineComponent({ line, showLineNumbers }: DiffLineProps) {
  return (
    <div
      className={cn(
        'diff-line',
        line.type === 'add' && 'diff-line-add',
        line.type === 'remove' && 'diff-line-remove',
        line.type === 'modify' && 'diff-line-modify',
      )}
      role="row"
    >
      {showLineNumbers && (
        <>
          <span className="diff-line-number" aria-label="Original line">
            {line.lineNumbers.left ?? ' '}
          </span>
          <span className="diff-line-number" aria-label="Modified line">
            {line.lineNumbers.right ?? ' '}
          </span>
        </>
      )}
      <span className="diff-line-content">
        {line.changes ? (
          line.changes.map((change, i) => (
            <span key={i} className={`diff-char-${change.type}`}>
              {change.value}
            </span>
          ))
        ) : (
          line.content
        )}
      </span>
    </div>
  );
}
```

---

## Virtual Scrolling Pattern

For large files (> 1000 lines), use virtual scrolling:

```typescript
// src/components/diff/VirtualizedDiffView.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedDiffViewProps {
  lines: DiffLine[];
  lineHeight: number;
  overscan?: number;
}

export function VirtualizedDiffView({
  lines,
  lineHeight = 24,
  overscan = 10,
}: VirtualizedDiffViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => lineHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      role="grid"
      aria-label="Diff view"
      aria-rowcount={lines.length}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
            aria-rowindex={virtualRow.index + 1}
          >
            <DiffLineComponent line={lines[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Scroll Synchronization

For side-by-side view, synchronize scrolling between panels:

```typescript
function useSyncScroll(leftRef: RefObject<HTMLElement>, rightRef: RefObject<HTMLElement>) {
  const isScrolling = useRef<'left' | 'right' | null>(null);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const handleLeftScroll = () => {
      if (isScrolling.current === 'right') return;
      isScrolling.current = 'left';
      right.scrollTop = left.scrollTop;
      requestAnimationFrame(() => { isScrolling.current = null; });
    };

    const handleRightScroll = () => {
      if (isScrolling.current === 'left') return;
      isScrolling.current = 'right';
      left.scrollTop = right.scrollTop;
      requestAnimationFrame(() => { isScrolling.current = null; });
    };

    left.addEventListener('scroll', handleLeftScroll);
    right.addEventListener('scroll', handleRightScroll);

    return () => {
      left.removeEventListener('scroll', handleLeftScroll);
      right.removeEventListener('scroll', handleRightScroll);
    };
  }, [leftRef, rightRef]);
}
```

---

## Error Handling Pattern

### Error Types

```typescript
// src/lib/errors.ts
export class DiffLocalError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'DiffLocalError';
  }
}

export class FileTooLargeError extends DiffLocalError {
  constructor(size: number, maxSize: number) {
    super(
      `File size ${formatBytes(size)} exceeds maximum ${formatBytes(maxSize)}`,
      'FILE_TOO_LARGE'
    );
  }
}

export class UnsupportedFileTypeError extends DiffLocalError {
  constructor(type: string) {
    super(`File type "${type}" is not supported`, 'UNSUPPORTED_TYPE');
  }
}

export class ProcessingError extends DiffLocalError {
  constructor(message: string) {
    super(message, 'PROCESSING_ERROR');
  }
}
```

### Error Boundaries

```typescript
// src/components/shared/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <ErrorFallback
          error={this.state.error}
          onReset={() => {
            this.setState({ error: null });
            this.props.onReset?.();
          }}
        />
      );
    }

    return this.props.children;
  }
}
```

---

## Progressive Enhancement Pattern

### Feature Detection

```typescript
// src/lib/features.ts
export const features = {
  fileSystemAccess: 'showDirectoryPicker' in window,
  offscreenCanvas: 'OffscreenCanvas' in window,
  sharedArrayBuffer: 'SharedArrayBuffer' in window,
  clipboard: 'clipboard' in navigator,
  serviceWorker: 'serviceWorker' in navigator,
} as const;

// Usage
if (features.fileSystemAccess) {
  // Use File System Access API for folder comparison
} else {
  // Fall back to webkitdirectory input
}
```

### Graceful Degradation

```typescript
// Example: Folder input with fallback
export function FolderInput({ onFolder }: FolderInputProps) {
  if (features.fileSystemAccess) {
    return (
      <Button onClick={handleDirectoryPicker}>
        Select Folder
      </Button>
    );
  }

  // Fallback for non-Chrome browsers
  return (
    <input
      type="file"
      webkitdirectory=""
      directory=""
      onChange={handleLegacyFolderInput}
    />
  );
}
```

---

## Testing Patterns

### Component Testing

```typescript
// Use testing-library's user-event for realistic interactions
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FileDropzone', () => {
  it('accepts dropped files', async () => {
    const handleFile = vi.fn();
    render(<FileDropzone onFile={handleFile} />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const dropzone = screen.getByRole('button', { name: /drop/i });

    await userEvent.upload(dropzone, file);

    expect(handleFile).toHaveBeenCalledWith(
      'content',
      expect.objectContaining({ name: 'test.txt' })
    );
  });
});
```

### Worker Testing

```typescript
// Test workers in isolation
describe('text-diff.worker', () => {
  let worker: Worker;

  beforeEach(() => {
    worker = new Worker(
      new URL('@/workers/text-diff.worker.ts', import.meta.url),
      { type: 'module' }
    );
  });

  afterEach(() => {
    worker.terminate();
  });

  it('computes line diff correctly', async () => {
    const result = await new Promise((resolve) => {
      worker.onmessage = (e) => resolve(e.data);
      worker.postMessage({
        type: 'compute',
        id: '1',
        payload: {
          left: 'line1\nline2',
          right: 'line1\nline3',
          options: {},
        },
      });
    });

    expect(result.type).toBe('result');
    expect(result.payload.lines).toHaveLength(2);
  });
});
```

---

## Security Patterns

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  worker-src 'self' blob:;
  img-src 'self' blob: data:;
  connect-src 'self';
  frame-ancestors 'none';
  form-action 'none';
  base-uri 'self';
">
```

### Input Sanitization

```typescript
// When rendering user content, escape HTML
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Never use dangerouslySetInnerHTML with user content
// Use textContent or escape first
```

---

**Document Version:** 1.0.0
