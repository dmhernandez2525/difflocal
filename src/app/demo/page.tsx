import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { DemoSidebar } from './components/DemoSidebar';
import { DemoDiffViewer } from './components/DemoDiffViewer';
import { DemoHeader } from './components/DemoHeader';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function DemoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDemo, enterDemo, activeScenario } = useDemo();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const scenarioId = searchParams.get('scenario');
    if (!isDemo) {
      enterDemo(scenarioId ?? undefined);
    } else if (scenarioId && activeScenario?.id !== scenarioId) {
      enterDemo(scenarioId);
    }
  }, [searchParams, isDemo, enterDemo, activeScenario?.id]);

  const handleExitDemo = () => {
    navigate('/');
  };

  if (!activeScenario) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-8rem)]">
      <DemoHeader
        onExitDemo={handleExitDemo}
        onToggleSidebar={() => {
          setSidebarOpen(!sidebarOpen);
        }}
      />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => {
              setSidebarOpen(false);
            }}
          />
        )}

        {/* Sidebar - slide-over on mobile, static on desktop */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:relative md:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col md:hidden">
            <div className="flex items-center justify-between border-b bg-background px-4 py-3">
              <span className="text-sm font-semibold">Scenarios</span>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                }}
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <DemoSidebar
              onSelectScenario={() => {
                setSidebarOpen(false);
              }}
            />
          </div>
          <div className="hidden h-full md:block">
            <DemoSidebar />
          </div>
        </div>

        <DemoDiffViewer />
      </div>
    </div>
  );
}
