import { DiffLine, DiffResult, DiffStats, DiffOptions, DEFAULT_DIFF_OPTIONS } from '@/types/diff';

/**
 * Sample code files for demonstrating text/code comparison
 */
export const DEMO_CODE_SAMPLES = {
  javascript: {
    original: `// User authentication module
function validateUser(email, password) {
  if (!email || !password) {
    return { valid: false, error: "Missing credentials" };
  }

  const user = findUserByEmail(email);
  if (!user) {
    return { valid: false, error: "User not found" };
  }

  if (user.password !== hashPassword(password)) {
    return { valid: false, error: "Invalid password" };
  }

  return { valid: true, user: user };
}

function createSession(user) {
  const token = generateToken(user.id);
  return { token, expiresIn: 3600 };
}`,
    modified: `// User authentication module v2
async function validateUser(email, password) {
  if (!email || !password) {
    throw new AuthenticationError("Missing credentials");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthenticationError("User not found");
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new AuthenticationError("Invalid password");
  }

  await logLoginAttempt(user.id, true);
  return { valid: true, user: sanitizeUser(user) };
}

async function createSession(user, options = {}) {
  const token = await generateSecureToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);
  const expiresIn = options.rememberMe ? 604800 : 3600;
  return { token, refreshToken, expiresIn };
}`,
    filename: 'auth.js',
  },
  typescript: {
    original: `interface Product {
  id: number;
  name: string;
  price: number;
}

function calculateTotal(items: Product[]): number {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

function formatPrice(price: number): string {
  return "$" + price.toFixed(2);
}`,
    modified: `interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface CartSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

function calculateTotal(items: Product[]): CartSummary {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discount = items.reduce(
    (sum, item) => sum + (item.discount ?? 0) * item.quantity,
    0
  );

  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  return { subtotal, discount, tax, total };
}

function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}`,
    filename: 'cart.ts',
  },
  python: {
    original: `# Data processing script
import json

def load_data(filename):
    f = open(filename, 'r')
    data = json.load(f)
    f.close()
    return data

def process_records(data):
    results = []
    for record in data:
        if record['status'] == 'active':
            results.append(record)
    return results

def main():
    data = load_data('input.json')
    processed = process_records(data)
    print(f"Processed {len(processed)} records")`,
    modified: `# Data processing script v2
import json
from pathlib import Path
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class ProcessingResult:
    records: List[Dict[str, Any]]
    total: int
    filtered: int

def load_data(filename: str | Path) -> Dict[str, Any]:
    """Load JSON data from file with proper error handling."""
    filepath = Path(filename)
    if not filepath.exists():
        raise FileNotFoundError(f"Data file not found: {filepath}")

    with filepath.open('r', encoding='utf-8') as f:
        return json.load(f)

def process_records(
    data: List[Dict[str, Any]],
    status_filter: str = 'active'
) -> ProcessingResult:
    """Filter records by status and return processing result."""
    filtered = [
        record for record in data
        if record.get('status') == status_filter
    ]
    return ProcessingResult(
        records=filtered,
        total=len(data),
        filtered=len(filtered)
    )

def main() -> None:
    data = load_data('input.json')
    result = process_records(data['records'])
    print(f"Processed {result.filtered}/{result.total} records")`,
    filename: 'process.py',
  },
  config: {
    original: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^17.0.2",
    "lodash": "^4.17.21"
  },
  "scripts": {
    "start": "node server.js",
    "build": "webpack"
  }
}`,
    modified: `{
  "name": "my-app",
  "version": "2.0.0",
  "description": "A modern web application",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@types/react": "^18.2.0"
  },
  "scripts": {
    "dev": "vite",
    "start": "vite preview",
    "build": "tsc && vite build",
    "test": "vitest"
  }
}`,
    filename: 'package.json',
  },
};

/**
 * Generate diff lines from two strings
 */
export function generateDiffLines(original: string, modified: string): DiffLine[] {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  const lines: DiffLine[] = [];

  // Simple line-by-line diff (LCS-based diff would be more accurate but this is for demo)
  let leftLine = 1;
  let rightLine = 1;
  let i = 0;
  let j = 0;

  while (i < originalLines.length || j < modifiedLines.length) {
    const origLine = originalLines[i];
    const modLine = modifiedLines[j];

    if (i >= originalLines.length) {
      // Only modified lines left
      lines.push({
        type: 'add',
        content: modLine,
        lineNumbers: { right: rightLine++ },
      });
      j++;
    } else if (j >= modifiedLines.length) {
      // Only original lines left
      lines.push({
        type: 'remove',
        content: origLine,
        lineNumbers: { left: leftLine++ },
      });
      i++;
    } else if (origLine === modLine) {
      // Lines match
      lines.push({
        type: 'unchanged',
        content: origLine,
        lineNumbers: { left: leftLine++, right: rightLine++ },
      });
      i++;
      j++;
    } else {
      // Lines differ - check if it's a modification or add/remove
      const origInMod = modifiedLines.slice(j).indexOf(origLine);
      const modInOrig = originalLines.slice(i).indexOf(modLine);

      if (origInMod === -1 && modInOrig === -1) {
        // Both lines are unique - treat as modification
        lines.push({
          type: 'remove',
          content: origLine,
          lineNumbers: { left: leftLine++ },
        });
        lines.push({
          type: 'add',
          content: modLine,
          lineNumbers: { right: rightLine++ },
        });
        i++;
        j++;
      } else if (origInMod !== -1 && (modInOrig === -1 || origInMod <= modInOrig)) {
        // Original line appears later in modified - add new lines
        lines.push({
          type: 'add',
          content: modLine,
          lineNumbers: { right: rightLine++ },
        });
        j++;
      } else {
        // Modified line appears later in original - remove original
        lines.push({
          type: 'remove',
          content: origLine,
          lineNumbers: { left: leftLine++ },
        });
        i++;
      }
    }
  }

  return lines;
}

/**
 * Calculate diff statistics from diff lines
 */
export function calculateDiffStats(
  lines: DiffLine[],
  originalLineCount: number,
  modifiedLineCount: number
): DiffStats {
  const stats = lines.reduce(
    (acc, line) => {
      if (line.type === 'add') acc.added++;
      else if (line.type === 'remove') acc.removed++;
      else acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 }
  );

  return {
    ...stats,
    totalLeft: originalLineCount,
    totalRight: modifiedLineCount,
  };
}

/**
 * Generate a complete diff result for demo purposes
 */
export function generateDemoResult(
  original: string,
  modified: string
): DiffResult {
  const lines = generateDiffLines(original, modified);
  const stats = calculateDiffStats(
    lines,
    original.split('\n').length,
    modified.split('\n').length
  );

  return { lines, stats };
}

/**
 * Demo scenarios that users can select
 */
export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  category: 'code' | 'config' | 'text';
  original: string;
  modified: string;
  filename: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'js-auth',
    title: 'JavaScript Refactoring',
    description: 'Authentication module updated with async/await and better error handling',
    category: 'code',
    ...DEMO_CODE_SAMPLES.javascript,
  },
  {
    id: 'ts-cart',
    title: 'TypeScript Enhancement',
    description: 'Shopping cart calculation with added types and features',
    category: 'code',
    ...DEMO_CODE_SAMPLES.typescript,
  },
  {
    id: 'py-processing',
    title: 'Python Modernization',
    description: 'Data processing script updated with type hints and dataclasses',
    category: 'code',
    ...DEMO_CODE_SAMPLES.python,
  },
  {
    id: 'config-package',
    title: 'Package.json Update',
    description: 'Dependency updates and build system migration',
    category: 'config',
    ...DEMO_CODE_SAMPLES.config,
  },
];

/**
 * Default diff options for demo mode
 */
export const DEMO_DIFF_OPTIONS: DiffOptions = {
  ...DEFAULT_DIFF_OPTIONS,
  granularity: 'line',
};
