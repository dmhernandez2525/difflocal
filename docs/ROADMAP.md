# DiffLocal Development Roadmap

**Version:** 1.0.0
**Last Updated:** January 25, 2026
**Status:** Phase 1 In Progress

---

## Overview

This roadmap outlines the phased development of DiffLocal, a privacy-first diff tool that processes all comparisons client-side. Priorities are informed by competitive research identifying gaps in the current market.

### Strategic Priorities

1. **Privacy as Core Value** - All processing client-side, verifiable by users
2. **Text Diff Excellence** - Nail the core use case before expanding
3. **Progressive Enhancement** - Each phase builds on the previous
4. **Ship Early, Iterate** - Phase 1 MVP targets 4-6 weeks

---

## Phase 1: Text Diff MVP

**Goal:** Launch a best-in-class text/code comparison tool with privacy-first architecture.

**Timeline:** Weeks 1-6

### Milestone 1.1: Core Infrastructure (Week 1-2)

| Feature | Description | SDD |
|---------|-------------|-----|
| Project Setup | Vite + React + TypeScript + Tailwind | `sdd/phase-1/001-project-setup.md` |
| Component Library | shadcn/ui integration | `sdd/phase-1/002-component-library.md` |
| Routing | React Router v6 setup | `sdd/phase-1/001-project-setup.md` |
| State Management | Zustand store setup | `sdd/phase-1/003-state-management.md` |
| Web Worker Infrastructure | Worker communication pattern | `sdd/phase-1/004-worker-infrastructure.md` |

### Milestone 1.2: Text Diff Engine (Week 2-3)

| Feature | Description | SDD |
|---------|-------------|-----|
| Diff Algorithm | jsdiff integration with options | `sdd/phase-1/005-text-diff-engine.md` |
| Syntax Highlighting | Shiki for 15 languages | `sdd/phase-1/006-syntax-highlighting.md` |
| Diff Options | Ignore whitespace, case, blank lines | `sdd/phase-1/005-text-diff-engine.md` |

### Milestone 1.3: Diff Visualization (Week 3-4)

| Feature | Description | SDD |
|---------|-------------|-----|
| Side-by-Side View | Synchronized scrolling | `sdd/phase-1/007-diff-visualization.md` |
| Unified View | Git-style unified diff | `sdd/phase-1/007-diff-visualization.md` |
| Inline View | Character-level inline changes | `sdd/phase-1/007-diff-visualization.md` |
| Virtual Scrolling | Handle large files | `sdd/phase-1/008-virtual-scrolling.md` |

### Milestone 1.4: Input & Output (Week 4-5)

| Feature | Description | SDD |
|---------|-------------|-----|
| File Input | Drag & drop, file picker, paste | `sdd/phase-1/009-file-input.md` |
| URL Sharing | Fragment encoding with LZ-String | `sdd/phase-1/010-url-sharing.md` |
| Export | Unified diff file export | `sdd/phase-1/011-export.md` |

### Milestone 1.5: Polish & Launch (Week 5-6)

| Feature | Description | SDD |
|---------|-------------|-----|
| Dark Mode | System preference + toggle | `sdd/phase-1/012-theming.md` |
| Keyboard Shortcuts | Navigation and actions | `sdd/phase-1/013-keyboard-shortcuts.md` |
| Landing Page | Privacy messaging, feature overview | `sdd/phase-1/014-landing-page.md` |
| CI/CD | GitHub Actions + Vercel deploy | `sdd/phase-1/015-ci-cd.md` |

### Phase 1 Exit Criteria

- [ ] Text comparison works for files up to 10MB
- [ ] 15 languages with syntax highlighting
- [ ] Side-by-side and unified views functional
- [ ] URL sharing works for content < 100KB
- [ ] Dark mode implemented
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- [ ] Zero server-side data transmission (verified)
- [ ] Deployed to production URL

---

## Phase 2: Image Diff & Performance

**Goal:** Add image comparison and optimize for large file handling.

**Timeline:** Weeks 7-10

### Milestone 2.1: Image Comparison (Week 7-8)

| Feature | Description | SDD |
|---------|-------------|-----|
| Image Diff Engine | pixelmatch integration | `sdd/phase-2/001-image-diff-engine.md` |
| Slider View | Drag slider between images | `sdd/phase-2/002-image-views.md` |
| Fade/Onion Skin | Opacity blending view | `sdd/phase-2/002-image-views.md` |
| Difference Highlight | Pixel difference visualization | `sdd/phase-2/002-image-views.md` |
| Image Stats | Pixel diff count, percentage | `sdd/phase-2/003-image-stats.md` |

### Milestone 2.2: Performance Optimization (Week 8-9)

| Feature | Description | SDD |
|---------|-------------|-----|
| Chunked Processing | Handle 50MB+ files | `sdd/phase-2/004-chunked-processing.md` |
| Progress Indicators | Visual feedback for long operations | `sdd/phase-2/005-progress-ui.md` |
| Memory Management | Aggressive cleanup, WeakRefs | `sdd/phase-2/006-memory-management.md` |
| Cancellation | Abort long-running operations | `sdd/phase-2/007-cancellation.md` |

### Milestone 2.3: UX Enhancements (Week 9-10)

| Feature | Description | SDD |
|---------|-------------|-----|
| Recent Comparisons | IndexedDB storage | `sdd/phase-2/008-recent-comparisons.md` |
| Keyboard Navigation | Full keyboard support | `sdd/phase-2/009-keyboard-nav.md` |
| Mobile Optimization | Touch gestures, responsive | `sdd/phase-2/010-mobile.md` |

### Phase 2 Exit Criteria

- [ ] Image comparison with 4 view modes
- [ ] Files up to 50MB processed with progress
- [ ] Recent comparisons persisted locally
- [ ] Mobile-friendly interface
- [ ] Performance: < 2s for 1MB text diff

---

## Phase 3: PDF & Folder Comparison

**Goal:** Expand to PDF and folder comparison, add PWA support.

**Timeline:** Weeks 11-16

### Milestone 3.1: PDF Comparison (Week 11-13)

| Feature | Description | SDD |
|---------|-------------|-----|
| PDF Parsing | PDF.js text extraction | `sdd/phase-3/001-pdf-parsing.md` |
| PDF Text Diff | Text-based comparison | `sdd/phase-3/002-pdf-text-diff.md` |
| Page Navigation | Side-by-side page view | `sdd/phase-3/003-pdf-navigation.md` |
| PDF Rendering | Canvas-based page display | `sdd/phase-3/004-pdf-rendering.md` |

### Milestone 3.2: Folder Comparison (Week 13-15)

| Feature | Description | SDD |
|---------|-------------|-----|
| Directory Input | File System Access API + fallback | `sdd/phase-3/005-directory-input.md` |
| Tree Visualization | Hierarchical diff view | `sdd/phase-3/006-tree-view.md` |
| File-Level Integration | Click to open file diff | `sdd/phase-3/007-file-integration.md` |
| Folder Stats | Added, removed, modified counts | `sdd/phase-3/008-folder-stats.md` |

### Milestone 3.3: PWA Implementation (Week 15-16)

| Feature | Description | SDD |
|---------|-------------|-----|
| Service Worker | Workbox caching strategy | `sdd/phase-3/009-service-worker.md` |
| Offline Support | Full offline functionality | `sdd/phase-3/010-offline.md` |
| Install Prompt | Add to home screen | `sdd/phase-3/011-install-prompt.md` |
| Update Flow | Background updates | `sdd/phase-3/012-update-flow.md` |

### Phase 3 Exit Criteria

- [ ] PDF text extraction and comparison working
- [ ] Folder comparison with tree view
- [ ] PWA installable and works offline
- [ ] All Phase 1-2 features work offline
- [ ] Service worker caching verified

---

## Phase 4: Excel & Advanced Features

**Goal:** Complete the feature set with Excel comparison and advanced features.

**Timeline:** Weeks 17-24

### Milestone 4.1: Excel Comparison (Week 17-20)

| Feature | Description | SDD |
|---------|-------------|-----|
| Excel Parsing | SheetJS integration | `sdd/phase-4/001-excel-parsing.md` |
| Cell Comparison | Cell-by-cell diff | `sdd/phase-4/002-cell-diff.md` |
| Row Alignment | LCS-based row matching | `sdd/phase-4/003-row-alignment.md` |
| Formula Support | Compare formulas vs values | `sdd/phase-4/004-formula-support.md` |
| Multi-Sheet | Sheet selector, cross-sheet diff | `sdd/phase-4/005-multi-sheet.md` |

### Milestone 4.2: Advanced Features (Week 20-22)

| Feature | Description | SDD |
|---------|-------------|-----|
| Three-Way Merge | Base + two versions | `sdd/phase-4/006-three-way-merge.md` |
| E2E Encrypted Sharing | Excalidraw model | `sdd/phase-4/007-encrypted-sharing.md` |
| Export Enhancements | PDF, HTML reports | `sdd/phase-4/008-export-enhanced.md` |

### Milestone 4.3: Self-Hosting & API (Week 22-24)

| Feature | Description | SDD |
|---------|-------------|-----|
| Docker Image | Single-container deployment | `sdd/phase-4/009-docker.md` |
| Self-Host Docs | Deployment guide | `sdd/phase-4/010-self-host-docs.md` |
| Embedding API | iframe/component embedding | `sdd/phase-4/011-embedding-api.md` |

### Phase 4 Exit Criteria

- [ ] Excel comparison with formula support
- [ ] Three-way merge functional
- [ ] Docker image published
- [ ] Self-hosting documentation complete
- [ ] All features work offline

---

## Future Considerations (Post-Phase 4)

These features are tracked but not scheduled:

- **Semantic Code Diff** - AST-based comparison using tree-sitter
- **Git Integration** - Local repo comparison via File System Access
- **VS Code Extension** - Integrate with editor
- **CLI Tool** - Command-line interface
- **Collaboration** - Comments, annotations (client-side)
- **OCR** - Scanned document comparison
- **Donation Integration** - GitHub Sponsors, Ko-fi
- **Analytics** - Privacy-respecting analytics (Plausible)

---

## Dependency Graph

```
Phase 1 (Text MVP)
├── Core Infrastructure [1.1]
│   └── Text Diff Engine [1.2]
│       └── Diff Visualization [1.3]
│           └── Input & Output [1.4]
│               └── Polish & Launch [1.5]

Phase 2 (Image + Performance)
├── Requires: Phase 1 Complete
├── Image Comparison [2.1]
│   └── Performance Optimization [2.2]
│       └── UX Enhancements [2.3]

Phase 3 (PDF + Folder + PWA)
├── Requires: Phase 2 Complete
├── PDF Comparison [3.1] (independent)
├── Folder Comparison [3.2] (independent)
└── PWA Implementation [3.3]
    └── Requires: 3.1 + 3.2 for full offline

Phase 4 (Excel + Advanced)
├── Requires: Phase 3 Complete
├── Excel Comparison [4.1] (independent)
├── Advanced Features [4.2]
│   └── Requires: 4.1
└── Self-Hosting [4.3]
    └── Requires: 4.2
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large file performance | Chunked processing, Web Workers, progress UI |
| Safari compatibility | Feature detection, graceful degradation |
| PDF.js complexity | Text-only extraction initially, defer visual diff |
| URL sharing limits | Clear size warnings, fallback to clipboard |
| Scope creep | Strict phase boundaries, defer non-MVP features |

---

## Success Metrics

### Phase 1 Launch
- Deploy to production
- Lighthouse > 90 all categories
- Zero data transmission to servers

### Growth Metrics (Post-Launch)
- GitHub stars (target: 500 in 3 months)
- Weekly active users (via privacy-respecting counter)
- Community contributions (issues, PRs)

---

**Document Version:** 1.0.0
**Next Review:** After Phase 1 completion
