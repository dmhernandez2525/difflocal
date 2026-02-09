import { useState } from 'react';

export function TextDiffPage() {
  const [leftContent, setLeftContent] = useState('');
  const [rightContent, setRightContent] = useState('');

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">Text Comparison</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Compare text or code files. Paste content or drag and drop files.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left Panel */}
        <div className="flex flex-col">
          <label htmlFor="left-content" className="mb-2 text-sm font-medium">
            Original
          </label>
          <textarea
            id="left-content"
            value={leftContent}
            onChange={(e) => {
              setLeftContent(e.target.value);
            }}
            placeholder="Paste original text here or drag and drop a file..."
            className="min-h-[200px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:min-h-[400px] sm:p-4"
          />
        </div>

        {/* Right Panel */}
        <div className="flex flex-col">
          <label htmlFor="right-content" className="mb-2 text-sm font-medium">
            Modified
          </label>
          <textarea
            id="right-content"
            value={rightContent}
            onChange={(e) => {
              setRightContent(e.target.value);
            }}
            placeholder="Paste modified text here or drag and drop a file..."
            className="min-h-[200px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:min-h-[400px] sm:p-4"
          />
        </div>
      </div>

      {/* Placeholder for diff visualization */}
      {(leftContent || rightContent) && (
        <div className="mt-6 rounded-md border p-4">
          <p className="text-center text-muted-foreground">
            Diff visualization will appear here once the diff engine is implemented.
          </p>
        </div>
      )}
    </div>
  );
}
