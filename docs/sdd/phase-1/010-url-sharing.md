# SDD-010: URL Fragment Sharing

**Feature:** FEAT-014 - URL Fragment Sharing
**Phase:** 1
**Status:** Not Started
**Created:** January 25, 2026

---

## Overview

Enable users to share diff comparisons via URL without any server-side storage. Content is compressed and encoded into the URL fragment (hash), which browsers never send to servers.

---

## Goals

1. Share small-to-medium diffs via URL
2. Zero server involvement - pure client-side
3. Handle size limits gracefully
4. Include diff options in shared URL
5. Backwards-compatible URL format

---

## Technical Specification

### URL Structure

```
https://difflocal.dev/text#v1.eJxLy0ktLlGyULA...

Parts:
- Origin: https://difflocal.dev
- Path: /text (determines diff type)
- Fragment: #v1.{compressed-data}
  - v1: Version identifier for format
  - Compressed data: LZ-String compressed JSON
```

### Data Format

```typescript
// Version 1 share format
interface ShareableStateV1 {
  v: 1;                    // Version
  l: string;               // Left content
  r: string;               // Right content
  o: {                     // Options (abbreviated for URL size)
    g: 'l' | 'w' | 'c';   // Granularity: line/word/character
    w: boolean;            // Ignore whitespace
    c: boolean;            // Ignore case
    t: boolean;            // Trim trailing whitespace
    b: boolean;            // Ignore blank lines
  };
  m?: {                    // Metadata (optional)
    ln?: string;           // Left filename
    rn?: string;           // Right filename
  };
}
```

### Encoding Implementation

```typescript
// src/lib/share/encode.ts
import LZString from 'lz-string';
import type { DiffOptions } from '@/types/diff';

interface ShareableContent {
  left: string;
  right: string;
  options: DiffOptions;
  metadata?: {
    leftName?: string;
    rightName?: string;
  };
}

interface ShareResult {
  url: string;
  compressed: boolean;
  originalSize: number;
  compressedSize: number;
}

const MAX_URL_LENGTH = 8000;  // Conservative limit for browser compatibility
const SHARE_VERSION = 1;

export function createShareUrl(content: ShareableContent): ShareResult | null {
  // Convert to compact format
  const payload: ShareableStateV1 = {
    v: SHARE_VERSION,
    l: content.left,
    r: content.right,
    o: {
      g: content.options.granularity[0] as 'l' | 'w' | 'c',
      w: content.options.ignoreWhitespace,
      c: content.options.ignoreCase,
      t: content.options.trimTrailingWhitespace,
      b: content.options.ignoreBlankLines,
    },
  };

  if (content.metadata?.leftName || content.metadata?.rightName) {
    payload.m = {
      ln: content.metadata.leftName,
      rn: content.metadata.rightName,
    };
  }

  const json = JSON.stringify(payload);
  const originalSize = json.length;

  // Compress using LZ-String
  const compressed = LZString.compressToEncodedURIComponent(json);
  const compressedSize = compressed.length;

  // Check if within limits
  const fragment = `v${SHARE_VERSION}.${compressed}`;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const fullUrl = `${baseUrl}#${fragment}`;

  if (fullUrl.length > MAX_URL_LENGTH) {
    return null;  // Too large to share
  }

  return {
    url: fullUrl,
    compressed: true,
    originalSize,
    compressedSize,
  };
}

export function estimateShareSize(content: ShareableContent): {
  canShare: boolean;
  estimatedSize: number;
  maxSize: number;
} {
  const json = JSON.stringify({
    v: 1,
    l: content.left,
    r: content.right,
    o: content.options,
  });

  // LZ-String typically achieves 50-80% compression on text
  // Use conservative estimate
  const estimatedCompressed = Math.ceil(json.length * 0.7);

  return {
    canShare: estimatedCompressed < MAX_URL_LENGTH,
    estimatedSize: estimatedCompressed,
    maxSize: MAX_URL_LENGTH,
  };
}
```

### Decoding Implementation

```typescript
// src/lib/share/decode.ts
import LZString from 'lz-string';
import type { DiffOptions } from '@/types/diff';

interface DecodedContent {
  left: string;
  right: string;
  options: DiffOptions;
  metadata?: {
    leftName?: string;
    rightName?: string;
  };
}

interface DecodeResult {
  success: true;
  content: DecodedContent;
} | {
  success: false;
  error: 'invalid_format' | 'decompression_failed' | 'version_unsupported';
}

export function decodeShareUrl(hash: string): DecodeResult {
  // Remove # if present
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;

  if (!fragment) {
    return { success: false, error: 'invalid_format' };
  }

  // Parse version and data
  const versionMatch = fragment.match(/^v(\d+)\./);
  if (!versionMatch) {
    // Try legacy format (no version prefix)
    return decodeLegacy(fragment);
  }

  const version = parseInt(versionMatch[1], 10);
  const compressed = fragment.slice(versionMatch[0].length);

  switch (version) {
    case 1:
      return decodeV1(compressed);
    default:
      return { success: false, error: 'version_unsupported' };
  }
}

function decodeV1(compressed: string): DecodeResult {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);

    if (!json) {
      return { success: false, error: 'decompression_failed' };
    }

    const payload = JSON.parse(json) as ShareableStateV1;

    // Validate required fields
    if (typeof payload.l !== 'string' || typeof payload.r !== 'string') {
      return { success: false, error: 'invalid_format' };
    }

    // Expand abbreviated options
    const granularityMap: Record<string, DiffOptions['granularity']> = {
      l: 'line',
      w: 'word',
      c: 'character',
    };

    const content: DecodedContent = {
      left: payload.l,
      right: payload.r,
      options: {
        granularity: granularityMap[payload.o?.g ?? 'l'] ?? 'line',
        ignoreWhitespace: payload.o?.w ?? false,
        ignoreCase: payload.o?.c ?? false,
        trimTrailingWhitespace: payload.o?.t ?? false,
        ignoreBlankLines: payload.o?.b ?? false,
      },
    };

    if (payload.m) {
      content.metadata = {
        leftName: payload.m.ln,
        rightName: payload.m.rn,
      };
    }

    return { success: true, content };
  } catch {
    return { success: false, error: 'invalid_format' };
  }
}

function decodeLegacy(compressed: string): DecodeResult {
  // Handle URLs from before versioning was added
  // Attempt direct decompression
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) {
      return { success: false, error: 'decompression_failed' };
    }

    const payload = JSON.parse(json);
    return {
      success: true,
      content: {
        left: payload.left ?? payload.l ?? '',
        right: payload.right ?? payload.r ?? '',
        options: {
          granularity: 'line',
          ignoreWhitespace: false,
          ignoreCase: false,
          trimTrailingWhitespace: false,
          ignoreBlankLines: false,
        },
      },
    };
  } catch {
    return { success: false, error: 'invalid_format' };
  }
}
```

### React Integration

```typescript
// src/hooks/useShareUrl.ts
import { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createShareUrl, estimateShareSize, decodeShareUrl } from '@/lib/share';
import type { DiffOptions } from '@/types/diff';

interface UseShareUrlReturn {
  // Load content from URL on mount
  loadedContent: DecodedContent | null;
  loadError: string | null;

  // Create shareable URL
  createUrl: (left: string, right: string, options: DiffOptions) => ShareResult | null;

  // Check if content can be shared
  canShare: (left: string, right: string) => boolean;

  // Copy URL to clipboard
  copyUrl: () => Promise<boolean>;

  // Current shareable URL (if any)
  shareUrl: string | null;
}

export function useShareUrl(): UseShareUrlReturn {
  const location = useLocation();
  const navigate = useNavigate();

  const [loadedContent, setLoadedContent] = useState<DecodedContent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Load from URL on mount
  useEffect(() => {
    if (location.hash) {
      const result = decodeShareUrl(location.hash);

      if (result.success) {
        setLoadedContent(result.content);
        setLoadError(null);
      } else {
        setLoadedContent(null);
        setLoadError(result.error);
      }
    }
  }, [location.hash]);

  const createUrl = useCallback(
    (left: string, right: string, options: DiffOptions) => {
      const result = createShareUrl({ left, right, options });

      if (result) {
        setShareUrl(result.url);
        // Update URL without navigation
        window.history.replaceState(null, '', result.url);
      }

      return result;
    },
    []
  );

  const canShare = useCallback(
    (left: string, right: string) => {
      return estimateShareSize({ left, right, options: {} as DiffOptions }).canShare;
    },
    []
  );

  const copyUrl = useCallback(async () => {
    if (!shareUrl) return false;

    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch {
      return false;
    }
  }, [shareUrl]);

  return {
    loadedContent,
    loadError,
    createUrl,
    canShare,
    copyUrl,
    shareUrl,
  };
}
```

### Share Button Component

```typescript
// src/components/shared/ShareButton.tsx
import { useState, useCallback } from 'react';
import { Share2, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useShareUrl } from '@/hooks/useShareUrl';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  left: string;
  right: string;
  options: DiffOptions;
  className?: string;
}

export function ShareButton({ left, right, options, className }: ShareButtonProps) {
  const { createUrl, canShare, copyUrl } = useShareUrl();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sharable = canShare(left, right);

  const handleShare = useCallback(async () => {
    if (!sharable) {
      setError('Content too large to share via URL');
      return;
    }

    const result = createUrl(left, right, options);

    if (!result) {
      setError('Failed to create share URL');
      return;
    }

    const success = await copyUrl();

    if (success) {
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError('Failed to copy to clipboard');
    }
  }, [left, right, options, sharable, createUrl, copyUrl]);

  return (
    <Tooltip
      content={
        error ?? (sharable
          ? 'Copy shareable URL'
          : 'Content too large to share via URL')
      }
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={!sharable || (!left && !right)}
        className={cn('gap-2', className)}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : !sharable ? (
          <>
            <AlertTriangle className="h-4 w-4" />
            Too Large
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share
          </>
        )}
      </Button>
    </Tooltip>
  );
}
```

---

## Size Limits & Handling

### URL Length Limits

| Browser | Practical Limit |
|---------|-----------------|
| Chrome | ~32KB |
| Firefox | ~65KB |
| Safari | ~80KB |
| Edge | ~32KB |
| IE11 | ~2KB |

Using 8KB as safe limit to ensure compatibility.

### Compression Ratios

Typical LZ-String compression on text:
- Code: 40-60% of original
- Prose: 50-70% of original
- JSON: 30-50% of original

### Size Warning UI

```typescript
// Show warning when approaching limit
function ShareSizeWarning({ left, right }: { left: string; right: string }) {
  const { estimatedSize, maxSize, canShare } = estimateShareSize({ left, right, options: {} as DiffOptions });
  const percentage = (estimatedSize / maxSize) * 100;

  if (canShare && percentage < 80) {
    return null;
  }

  return (
    <div className={cn(
      'text-sm px-3 py-2 rounded',
      canShare
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    )}>
      {canShare
        ? `Content is ${Math.round(percentage)}% of max shareable size`
        : 'Content too large to share via URL. Use copy/paste or file export instead.'
      }
    </div>
  );
}
```

---

## Security Considerations

### URL Fragment Privacy

URL fragments (everything after #) are:
- Never sent to the server in HTTP requests
- Not included in referrer headers
- Not logged by web servers

This ensures content remains private.

### Content Validation

When decoding:
1. Validate JSON structure
2. Sanitize content before rendering
3. Limit maximum decoded size
4. Handle malformed input gracefully

```typescript
const MAX_DECODED_SIZE = 10_000_000; // 10MB

function decodeWithValidation(compressed: string): DecodeResult {
  const result = decodeV1(compressed);

  if (result.success) {
    const totalSize = result.content.left.length + result.content.right.length;

    if (totalSize > MAX_DECODED_SIZE) {
      return { success: false, error: 'invalid_format' };
    }
  }

  return result;
}
```

---

## Acceptance Criteria

- [ ] URLs work for content up to 100KB combined (before compression)
- [ ] Options are preserved in URL
- [ ] Opening shared URL loads content correctly
- [ ] Share button copies URL to clipboard
- [ ] Size warning shown when approaching limit
- [ ] Graceful error when content too large
- [ ] Legacy URLs (if any) still work
- [ ] URL format is versioned for future compatibility

---

## Test Cases

```typescript
describe('URL sharing', () => {
  describe('encoding', () => {
    it('encodes small content', () => {
      const result = createShareUrl({
        left: 'hello',
        right: 'world',
        options: defaultOptions,
      });

      expect(result).not.toBeNull();
      expect(result!.url).toContain('#v1.');
    });

    it('returns null for oversized content', () => {
      const largeContent = 'a'.repeat(100_000);
      const result = createShareUrl({
        left: largeContent,
        right: largeContent,
        options: defaultOptions,
      });

      expect(result).toBeNull();
    });

    it('preserves options', () => {
      const options = {
        ...defaultOptions,
        ignoreWhitespace: true,
        ignoreCase: true,
      };

      const result = createShareUrl({
        left: 'test',
        right: 'test',
        options,
      });

      const decoded = decodeShareUrl(new URL(result!.url).hash);
      expect(decoded.success).toBe(true);
      expect((decoded as any).content.options.ignoreWhitespace).toBe(true);
      expect((decoded as any).content.options.ignoreCase).toBe(true);
    });
  });

  describe('decoding', () => {
    it('decodes valid URL', () => {
      const result = decodeShareUrl('#v1.N4IgDg...');
      // Use actual compressed value in test
    });

    it('handles invalid format', () => {
      const result = decodeShareUrl('#invalid');
      expect(result.success).toBe(false);
      expect((result as any).error).toBe('decompression_failed');
    });

    it('handles unsupported version', () => {
      const result = decodeShareUrl('#v99.test');
      expect(result.success).toBe(false);
      expect((result as any).error).toBe('version_unsupported');
    });
  });

  describe('round trip', () => {
    it('encodes and decodes correctly', () => {
      const original = {
        left: 'function hello() {\n  return "world";\n}',
        right: 'function hello() {\n  return "universe";\n}',
        options: defaultOptions,
      };

      const encoded = createShareUrl(original);
      const decoded = decodeShareUrl(new URL(encoded!.url).hash);

      expect(decoded.success).toBe(true);
      expect((decoded as any).content.left).toBe(original.left);
      expect((decoded as any).content.right).toBe(original.right);
    });
  });
});
```

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All test cases passing
- [ ] Works in Chrome, Firefox, Safari
- [ ] No security vulnerabilities
- [ ] Documentation updated
