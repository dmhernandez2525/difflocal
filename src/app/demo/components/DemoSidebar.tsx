import { useNavigate } from 'react-router-dom';
import { FileText, Settings2, Code, FileJson } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils/cn';
import type { DemoScenario } from '@/demo/demoData';

const categoryIcons = {
  code: Code,
  config: FileJson,
  text: FileText,
};

export function DemoSidebar() {
  const navigate = useNavigate();
  const { scenarios, activeScenario, selectScenario, options, updateOptions } = useDemo();

  const handleScenarioSelect = (scenario: DemoScenario) => {
    selectScenario(scenario.id);
    navigate(`/demo?scenario=${scenario.id}`, { replace: true });
  };

  const groupedScenarios = scenarios.reduce<Record<string, DemoScenario[]>>((acc, scenario) => {
    const category = scenario.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(scenario);
    return acc;
  }, {});

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-r bg-muted/20">
      {/* Scenarios Section */}
      <div className="p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Demo Scenarios
        </h3>

        <div className="space-y-4">
          {Object.entries(groupedScenarios).map(([category, categoryScenarios]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <div key={category}>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="capitalize">{category}</span>
                </div>
                <div className="space-y-1">
                  {categoryScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => {
                        handleScenarioSelect(scenario);
                      }}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                        activeScenario?.id === scenario.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      )}
                    >
                      <p className="font-medium">{scenario.title}</p>
                      <p
                        className={cn(
                          'mt-0.5 text-xs',
                          activeScenario?.id === scenario.id
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        )}
                      >
                        {scenario.filename}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Options Section */}
      <div className="border-t p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Settings2 className="h-3.5 w-3.5" />
          Diff Options
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm">Ignore whitespace</span>
            <input
              type="checkbox"
              checked={options.ignoreWhitespace}
              onChange={(e) => {
                updateOptions({ ignoreWhitespace: e.target.checked });
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm">Ignore case</span>
            <input
              type="checkbox"
              checked={options.ignoreCase}
              onChange={(e) => {
                updateOptions({ ignoreCase: e.target.checked });
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm">Trim trailing whitespace</span>
            <input
              type="checkbox"
              checked={options.trimTrailingWhitespace}
              onChange={(e) => {
                updateOptions({ trimTrailingWhitespace: e.target.checked });
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
          </label>

          <div>
            <label className="mb-1.5 block text-sm">Granularity</label>
            <select
              value={options.granularity}
              onChange={(e) => {
                updateOptions({
                  granularity: e.target.value as 'line' | 'word' | 'character',
                });
              }}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              <option value="line">Line</option>
              <option value="word">Word</option>
              <option value="character">Character</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="border-t p-4">
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            This is a demo showing DiffLocal&apos;s capabilities. In the real app, you can paste
            your own content or drag and drop files to compare.
          </p>
        </div>
      </div>
    </aside>
  );
}
