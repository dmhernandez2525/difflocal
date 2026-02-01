import { ArrowLeft, Eye, FileText, Settings } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils/cn';

interface DemoHeaderProps {
  onExitDemo: () => void;
}

export function DemoHeader({ onExitDemo }: DemoHeaderProps) {
  const { activeScenario, diffResult } = useDemo();

  if (!activeScenario || !diffResult) return null;

  const { stats } = diffResult;

  return (
    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-4">
        <button
          onClick={onExitDemo}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Demo
        </button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{activeScenario.filename}</p>
            <p className="text-xs text-muted-foreground">{activeScenario.title}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Diff Stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">
              +{stats.added} added
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">
              -{stats.removed} removed
            </span>
          </span>
          <span className="text-muted-foreground">
            {stats.unchanged} unchanged
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Demo Badge */}
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Demo Mode</span>
        </div>
      </div>
    </div>
  );
}
