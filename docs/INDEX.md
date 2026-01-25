# DiffLocal Documentation Index

**Version:** 1.0.0
**Last Updated:** January 25, 2026

---

## Quick Links

| Document | Description |
|----------|-------------|
| [ROADMAP.md](./ROADMAP.md) | Development phases and milestones |
| [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) | Complete feature list with acceptance criteria |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Code style and patterns |
| [ARCHITECTURE_PATTERNS.md](./ARCHITECTURE_PATTERNS.md) | Technical architecture details |

---

## Software Design Documents (SDDs)

### Phase 1: Text Diff MVP

| SDD | Feature | Status |
|-----|---------|--------|
| [001-project-setup.md](./sdd/phase-1/001-project-setup.md) | Project initialization | 🔴 |
| [002-component-library.md](./sdd/phase-1/002-component-library.md) | shadcn/ui setup | 🔴 |
| [003-state-management.md](./sdd/phase-1/003-state-management.md) | Zustand store | 🔴 |
| [004-worker-infrastructure.md](./sdd/phase-1/004-worker-infrastructure.md) | Web Worker pattern | 🔴 |
| [005-text-diff-engine.md](./sdd/phase-1/005-text-diff-engine.md) | jsdiff integration | 🔴 |
| [006-syntax-highlighting.md](./sdd/phase-1/006-syntax-highlighting.md) | Shiki highlighting | 🔴 |
| [007-diff-visualization.md](./sdd/phase-1/007-diff-visualization.md) | Diff view components | 🔴 |
| [008-virtual-scrolling.md](./sdd/phase-1/008-virtual-scrolling.md) | Large file handling | 🔴 |
| [009-file-input.md](./sdd/phase-1/009-file-input.md) | File input methods | 🔴 |
| [010-url-sharing.md](./sdd/phase-1/010-url-sharing.md) | URL fragment sharing | 🔴 |

### Phase 2-4

SDDs will be created as phases are approached.

---

## Work Tracking

| Document | Description |
|----------|-------------|
| [WORK_STATUS.md](../roadmap/WORK_STATUS.md) | Current sprint status |
| [AGENT_LOGS/](../roadmap/AGENT_LOGS/) | Session logs |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React SPA (Main Thread)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
│  │ Router  │ │   UI    │ │ Zustand │ │  IndexedDB  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │
│                          │                               │
│              ┌───────────┴───────────┐                  │
│              │     Web Workers       │                  │
│  ┌───────────┴───────────────────────┴───────────┐     │
│  │  Text   │  Image  │   PDF   │  Excel  │ Folder │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Service Worker (PWA)                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                    Static Hosting
```

---

## Key Principles

1. **Privacy First** - All processing client-side, no server uploads
2. **Progressive Enhancement** - Core features work everywhere, advanced features where supported
3. **Performance** - Web Workers for heavy processing, virtual scrolling for large files
4. **Accessibility** - WCAG AA compliance, keyboard navigation, screen reader support
5. **Offline Capable** - PWA with full offline functionality

---

## Contributing

1. Check [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) for available tasks
2. Read [CODING_STANDARDS.md](./CODING_STANDARDS.md) before writing code
3. Create SDD if implementing new feature
4. Update [WORK_STATUS.md](../roadmap/WORK_STATUS.md) when starting/completing work

---

**Document Version:** 1.0.0
