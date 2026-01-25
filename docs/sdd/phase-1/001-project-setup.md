# SDD-001: Project Setup

**Feature:** FEAT-001 - Project Setup
**Phase:** 1
**Status:** Not Started
**Created:** January 25, 2026

---

## Overview

Initialize the DiffLocal project with Vite, React 18, TypeScript, and Tailwind CSS. This establishes the foundation for all subsequent development.

---

## Goals

1. Create a performant, modern React application
2. Enable strict TypeScript for type safety
3. Configure Tailwind CSS for styling
4. Set up path aliases for clean imports
5. Configure linting and formatting

---

## Technical Specification

### Project Initialization

```bash
npm create vite@latest difflocal -- --template react-ts
cd difflocal
npm install
```

### Dependencies

**Production:**
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-router-dom": "^6.22.0",
  "zustand": "^4.5.0",
  "lz-string": "^1.5.0",
  "diff": "^5.2.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0",
  "@tanstack/react-virtual": "^3.1.0",
  "lucide-react": "^0.330.0"
}
```

**Development:**
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/diff": "^5.0.0",
  "@types/lz-string": "^1.5.0",
  "typescript": "^5.3.0",
  "vite": "^5.1.0",
  "@vitejs/plugin-react": "^4.2.0",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "eslint": "^8.56.0",
  "eslint-plugin-react": "^7.33.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "@typescript-eslint/eslint-plugin": "^6.21.0",
  "@typescript-eslint/parser": "^6.21.0",
  "prettier": "^3.2.0",
  "prettier-plugin-tailwindcss": "^0.5.0",
  "vitest": "^1.3.0",
  "@testing-library/react": "^14.2.0",
  "@testing-library/user-event": "^14.5.0",
  "happy-dom": "^13.3.0"
}
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'ES2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'diff-vendor': ['diff', 'lz-string'],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
});
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        diff: {
          add: {
            DEFAULT: 'hsl(var(--diff-add-bg))',
            foreground: 'hsl(var(--diff-add-text))',
          },
          remove: {
            DEFAULT: 'hsl(var(--diff-remove-bg))',
            foreground: 'hsl(var(--diff-remove-text))',
          },
          modify: {
            DEFAULT: 'hsl(var(--diff-modify-bg))',
            foreground: 'hsl(var(--diff-modify-text))',
          },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

### ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' },
    ],
    'no-console': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## Directory Structure

```
difflocal/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   └── utils/
│   │       └── cn.ts
│   ├── store/
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   ├── workers/
│   ├── main.tsx
│   └── vite-env.d.ts
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Acceptance Criteria

- [ ] `npm run dev` starts development server without errors
- [ ] `npm run build` produces production build without errors
- [ ] `npm run lint` passes without errors
- [ ] `npm run typecheck` passes without errors
- [ ] Path aliases (@/*) resolve correctly
- [ ] Tailwind CSS classes apply correctly
- [ ] Dark mode CSS variables work
- [ ] Test runner executes sample test

---

## Test Plan

1. **Development Server**
   - Run `npm run dev`
   - Verify hot reload works
   - Verify no console errors

2. **Build**
   - Run `npm run build`
   - Verify output in `dist/`
   - Verify bundle size reasonable (< 200KB initial)

3. **TypeScript**
   - Create component with type error
   - Verify TypeScript catches error
   - Verify strict mode flags work

4. **Styling**
   - Add Tailwind class to component
   - Verify styles apply
   - Toggle dark mode, verify CSS variables

5. **Path Aliases**
   - Import using `@/lib/utils`
   - Verify resolves correctly in IDE
   - Verify works in build

---

## Implementation Notes

### cn() Utility

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Global CSS

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    /* Diff colors - accessible contrast */
    --diff-add-bg: 120 40% 94%;
    --diff-add-text: 120 50% 25%;
    --diff-remove-bg: 0 40% 94%;
    --diff-remove-text: 0 50% 30%;
    --diff-modify-bg: 45 50% 94%;
    --diff-modify-text: 45 60% 25%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;

    /* Diff colors - dark mode */
    --diff-add-bg: 120 30% 15%;
    --diff-add-text: 120 40% 70%;
    --diff-remove-bg: 0 30% 15%;
    --diff-remove-text: 0 40% 75%;
    --diff-modify-bg: 45 30% 15%;
    --diff-modify-text: 45 50% 70%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and merged to main
- [ ] Documentation updated
- [ ] No lint/type errors
