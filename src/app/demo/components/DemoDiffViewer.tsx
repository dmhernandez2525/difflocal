import { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils/cn';
import { Columns, AlignJustify, SplitSquareVertical } from 'lucide-react';
import { DiffLine } from '@/types/diff';

type ViewMode = 'split' | 'unified';

export function DemoDiffViewer() {
  const { diffResult, activeScenario } = useDemo();
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  if (!diffResult || !activeScenario) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                viewMode === 'split'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              <Columns className="h-4 w-4" />
              Split
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={cn(
                'flex items-center gap-1.5 border-l px-3 py-1.5 text-sm transition-colors',
                viewMode === 'unified'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              <AlignJustify className="h-4 w-4" />
              Unified
            </button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
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

function SplitView({ lines, scenario }: SplitViewProps) {
  // Group lines for split view - pair removed with added when they're adjacent
  const leftLines: (DiffLine | null)[] = [];
  const rightLines: (DiffLine | null)[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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
    } else if (line.type === 'add') {
      leftLines.push(null);
      rightLines.push(line);
    }
  }

  return (
    <div className="grid min-w-[800px] grid-cols-2 divide-x">
      {/* Left (Original) */}
      <div>
        <div className="sticky top-0 border-b bg-muted/50 px-4 py-2 text-sm font-medium">
          Original
        </div>
        <div className="font-mono text-sm">
          {leftLines.map((line, idx) => (
            <DiffLineComponent key={`left-${idx}`} line={line} side="left" />
          ))}
        </div>
      </div>

      {/* Right (Modified) */}
      <div>
        <div className="sticky top-0 border-b bg-muted/50 px-4 py-2 text-sm font-medium">
          Modified
        </div>
        <div className="font-mono text-sm">
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
    <div className="font-mono text-sm">
      <div className="sticky top-0 border-b bg-muted/50 px-4 py-2 text-sm font-medium">
        Unified Diff
      </div>
      {lines.map((line, idx) => (
        <div
          key={idx}
          className={cn(
            'flex leading-6',
            line.type === 'add' && 'bg-green-500/10',
            line.type === 'remove' && 'bg-red-500/10'
          )}
        >
          {/* Line numbers */}
          <div className="flex w-20 shrink-0 select-none border-r bg-muted/30 text-xs text-muted-foreground">
            <span className="w-10 px-2 py-0.5 text-right">
              {line.lineNumbers.left ?? ''}
            </span>
            <span className="w-10 border-l px-2 py-0.5 text-right">
              {line.lineNumbers.right ?? ''}
            </span>
          </div>

          {/* Change indicator */}
          <div className="w-6 shrink-0 select-none text-center">
            {line.type === 'add' && (
              <span className="text-green-600 dark:text-green-400">+</span>
            )}
            {line.type === 'remove' && (
              <span className="text-red-600 dark:text-red-400">-</span>
            )}
          </div>

          {/* Content */}
          <pre className="flex-1 whitespace-pre-wrap break-all px-2 py-0.5">
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
      <div className="flex h-6 bg-muted/30">
        <div className="w-12 shrink-0 border-r bg-muted/50" />
        <div className="flex-1" />
      </div>
    );
  }

  const lineNumber = side === 'left' ? line.lineNumbers.left : line.lineNumbers.right;

  return (
    <div
      className={cn(
        'flex leading-6',
        line.type === 'add' && 'bg-green-500/10',
        line.type === 'remove' && 'bg-red-500/10'
      )}
    >
      {/* Line number */}
      <div className="w-12 shrink-0 select-none border-r bg-muted/30 px-2 text-right text-xs text-muted-foreground">
        {lineNumber ?? ''}
      </div>

      {/* Change indicator */}
      <div className="w-6 shrink-0 select-none text-center">
        {line.type === 'add' && (
          <span className="text-green-600 dark:text-green-400">+</span>
        )}
        {line.type === 'remove' && (
          <span className="text-red-600 dark:text-red-400">-</span>
        )}
      </div>

      {/* Content */}
      <pre className="flex-1 whitespace-pre-wrap break-all px-2 py-0.5">
        {line.content || ' '}
      </pre>
    </div>
  );
}
