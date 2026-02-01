import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  DEMO_SCENARIOS,
  generateDemoResult,
  type DemoScenario,
  DEMO_DIFF_OPTIONS,
} from '@/demo/demoData';
import type { DiffResult, DiffOptions } from '@/types/diff';

interface DemoState {
  /** Whether demo mode is active */
  isDemo: boolean;
  /** Currently selected demo scenario */
  activeScenario: DemoScenario | null;
  /** Current diff result */
  diffResult: DiffResult | null;
  /** Current diff options */
  options: DiffOptions;
  /** List of available scenarios */
  scenarios: DemoScenario[];
}

interface DemoActions {
  /** Enter demo mode with a specific scenario */
  enterDemo: (scenarioId?: string) => void;
  /** Exit demo mode */
  exitDemo: () => void;
  /** Select a different demo scenario */
  selectScenario: (scenarioId: string) => void;
  /** Update diff options */
  updateOptions: (options: Partial<DiffOptions>) => void;
}

type DemoContextValue = DemoState & DemoActions;

const DemoContext = createContext<DemoContextValue | null>(null);

interface DemoProviderProps {
  children: ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [isDemo, setIsDemo] = useState(false);
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [options, setOptions] = useState<DiffOptions>(DEMO_DIFF_OPTIONS);

  const computeDiff = useCallback((scenario: DemoScenario) => {
    const result = generateDemoResult(scenario.original, scenario.modified);
    setDiffResult(result);
  }, []);

  const enterDemo = useCallback(
    (scenarioId?: string) => {
      const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId) ?? DEMO_SCENARIOS[0];
      if (scenario) {
        setActiveScenario(scenario);
        computeDiff(scenario);
        setIsDemo(true);
      }
    },
    [computeDiff]
  );

  const exitDemo = useCallback(() => {
    setIsDemo(false);
    setActiveScenario(null);
    setDiffResult(null);
  }, []);

  const selectScenario = useCallback(
    (scenarioId: string) => {
      const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
      if (scenario) {
        setActiveScenario(scenario);
        computeDiff(scenario);
      }
    },
    [computeDiff]
  );

  const updateOptions = useCallback((newOptions: Partial<DiffOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  const value: DemoContextValue = {
    isDemo,
    activeScenario,
    diffResult,
    options,
    scenarios: DEMO_SCENARIOS,
    enterDemo,
    exitDemo,
    selectScenario,
    updateOptions,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemoOptional() {
  return useContext(DemoContext);
}
