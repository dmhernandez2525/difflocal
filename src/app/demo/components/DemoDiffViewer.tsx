import { useState, useEffect } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils/cn';
import { Columns, AlignJustify } from 'lucide-react';
import type { DiffLine } from '@/types/diff';

type ViewMode = 'split' | 'unified';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

export function DemoDiffViewer() {
  const { diffResult, activeScenario } = useDemo();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Default to unified on mobile
  useEffect(() => {
    if (isMobile) {
      setViewMode('unified');
    }
  }, [isMobile]);

  if (!diffResult || !activeScenario) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">View:</span>
          <div className="flex rounded-md border">
            <button
              onClick={() => {
                setViewMode('split');
              }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 text-xs transition-colors sm:px-3 sm:text-sm',
                viewMode === 'split' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              )}
            >
              <Columns className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Split
            </button>
            <button
              onClick={() => {
                setViewMode('unified');
              }}
              className={cn(
                'flex items-center gap-1.5 border-l px-2 py-1.5 text-xs transition-colors sm:px-3 sm:text-sm',
                viewMode === 'unified' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              )}
            >
              <AlignJustify className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Unified
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground sm:text-sm">
          {diffResult.lines.length} lines
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'split' ? (
          <SplitView lines={diffResult.lines} scenario={activeScenario} />
        ) : (
          <UnifiedView lines={diffResult.lines} />
        )}
      </div>
    </div>
  );
}

interface SplitViewProps {
  lines: DiffLine[];
  scenario: { original: string; modified: string };
}

function SplitView({ lines }: SplitViewProps) {
  // Group lines for split view - pair removed with added when they're adjacent
  const leftLines: (DiffLine | null)[] = [];
  const rightLines: (DiffLine | null)[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (line.type === 'unchanged') {
      leftLines.push(line);
      rightLines.push(line);
    } else if (line.type === 'remove') {
      // Check if next line is an add (modification)
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.type === 'add') {
        leftLines.push(line);
        rightLines.push(nextLine);
        i++; // Skip next line since we paired it
      } else {
        leftLines.push(line);
        rightLines.push(null);
      }
    } else {
      // line.type === 'add'
      leftLines.push(null);
      rightLines.push(line);
    }
  }

  return (
    <div className="grid min-w-[600px] grid-cols-2 divide-x sm:min-w-[800px]">
      {/* Left (Original) */}
      <div>
        <div className="sticky top-0 border-b bg-muted/50 px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm">
          Original
        </div>
        <div className="font-mono text-xs sm:text-sm">
          {leftLines.map((line, idx) => (
            <DiffLineComponent key={`left-${idx}`} line={line} side="left" />
          ))}
        </div>
      </div>

      {/* Right (Modified) */}
      <div>
        <div className="sticky top-0 border-b bg-muted/50 px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm">
          Modified
        </div>
        <div className="font-mono text-xs sm:text-sm">
          {rightLines.map((line, idx) => (
            <DiffLineComponent key={`right-${idx}`} line={line} side="right" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface UnifiedViewProps {
  lines: DiffLine[];
}

function UnifiedView({ lines }: UnifiedViewProps) {
  return (
    <div className="font-mono text-xs sm:text-sm">
      <div className="sticky top-0 border-b bg-muted/50 px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm">
        Unified Diff
      </div>
      {lines.map((line, idx) => (
        <div
          key={idx}
          className={cn(
            'flex leading-5 sm:leading-6',
            line.type === 'add' && 'bg-green-500/10',
            line.type === 'remove' && 'bg-red-500/10'
          )}
        >
          {/* Line numbers */}
          <div className="flex w-14 shrink-0 select-none border-r bg-muted/30 text-[10px] text-muted-foreground sm:w-20 sm:text-xs">
            <span className="w-7 px-1 py-0.5 text-right sm:w-10 sm:px-2">
              {line.lineNumbers.left ?? ''}
            </span>
            <span className="w-7 border-l px-1 py-0.5 text-right sm:w-10 sm:px-2">
              {line.lineNumbers.right ?? ''}
            </span>
          </div>

          {/* Change indicator */}
          <div className="w-5 shrink-0 select-none text-center sm:w-6">
            {line.type === 'add' && <span className="text-green-600 dark:text-green-400">+</span>}
            {line.type === 'remove' && <span className="text-red-600 dark:text-red-400">-</span>}
          </div>

          {/* Content */}
          <pre className="flex-1 whitespace-pre-wrap break-all px-1 py-0.5 sm:px-2">
            {line.content || ' '}
          </pre>
        </div>
      ))}
    </div>
  );
}

interface DiffLineComponentProps {
  line: DiffLine | null;
  side: 'left' | 'right';
}

function DiffLineComponent({ line, side }: DiffLineComponentProps) {
  if (!line) {
    return (
      <div className="flex h-5 bg-muted/30 sm:h-6">
        <div className="w-8 shrink-0 border-r bg-muted/50 sm:w-12" />
        <div className="flex-1" />
      </div>
    );
  }

  const lineNumber = side === 'left' ? line.lineNumbers.left : line.lineNumbers.right;

  return (
    <div
      className={cn(
        'flex leading-5 sm:leading-6',
        line.type === 'add' && 'bg-green-500/10',
        line.type === 'remove' && 'bg-red-500/10'
      )}
    >
      {/* Line number */}
      <div className="w-8 shrink-0 select-none border-r bg-muted/30 px-1 text-right text-[10px] text-muted-foreground sm:w-12 sm:px-2 sm:text-xs">
        {lineNumber ?? ''}
      </div>

      {/* Change indicator */}
      <div className="w-4 shrink-0 select-none text-center sm:w-6">
        {line.type === 'add' && <span className="text-green-600 dark:text-green-400">+</span>}
        {line.type === 'remove' && <span className="text-red-600 dark:text-red-400">-</span>}
      </div>

      {/* Content */}
      <pre className="flex-1 whitespace-pre-wrap break-all px-1 py-0.5 sm:px-2">
        {line.content || ' '}
      </pre>
    </div>
  );
}
