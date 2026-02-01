import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { DemoSidebar } from './components/DemoSidebar';
import { DemoDiffViewer } from './components/DemoDiffViewer';
import { DemoHeader } from './components/DemoHeader';

export function DemoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDemo, enterDemo, activeScenario } = useDemo();

  useEffect(() => {
    const scenarioId = searchParams.get('scenario');
    if (!isDemo) {
      enterDemo(scenarioId || undefined);
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
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <DemoHeader onExitDemo={handleExitDemo} />
      <div className="flex flex-1 overflow-hidden">
        <DemoSidebar />
        <DemoDiffViewer />
      </div>
    </div>
  );
}
