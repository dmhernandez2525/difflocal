import { ArrowLeft, Eye, FileText, PanelLeftOpen } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';

interface DemoHeaderProps {
  onExitDemo: () => void;
  onToggleSidebar?: () => void;
}

export function DemoHeader({ onExitDemo, onToggleSidebar }: DemoHeaderProps) {
  const { activeScenario, diffResult } = useDemo();

  if (!activeScenario || !diffResult) return null;

  const { stats } = diffResult;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile sidebar toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
            aria-label="Toggle sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={onExitDemo}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:gap-2 sm:px-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Exit Demo</span>
        </button>

        <div className="hidden h-6 w-px bg-border sm:block" />

        <div className="flex items-center gap-2">
          <div className="hidden h-8 w-8 items-center justify-center rounded-md bg-primary/10 sm:flex">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{activeScenario.filename}</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {activeScenario.title}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Diff Stats */}
        <div className="flex items-center gap-2 text-xs sm:gap-4 sm:text-sm">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 sm:h-2.5 sm:w-2.5" />
            <span className="text-muted-foreground">+{stats.added}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 sm:h-2.5 sm:w-2.5" />
            <span className="text-muted-foreground">-{stats.removed}</span>
          </span>
          <span className="hidden text-muted-foreground sm:inline">
            {stats.unchanged} unchanged
          </span>
        </div>

        <div className="hidden h-6 w-px bg-border sm:block" />

        {/* Demo Badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 sm:gap-2 sm:px-3">
          <Eye className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
          <span className="text-xs font-medium text-primary sm:text-sm">Demo</span>
        </div>
      </div>
    </div>
  );
}
