# DiffLocal Feature Backlog

**Version:** 1.0.0
**Last Updated:** January 25, 2026

---

## Backlog Organization

Features are organized by phase and priority:
- **P0**: Must have for phase completion
- **P1**: Should have, high value
- **P2**: Nice to have, lower priority

---

## Phase 1: Text Diff MVP

### P0: Core Infrastructure

#### FEAT-001: Project Setup
- **Description:** Initialize Vite + React + TypeScript project with Tailwind CSS
- **Acceptance Criteria:**
  - [ ] Vite 5 with React 18 configured
  - [ ] TypeScript strict mode enabled
  - [ ] Tailwind CSS with custom theme
  - [ ] ESLint + Prettier configured
  - [ ] Path aliases working (@/*)
  - [ ] Development server runs without errors
- **Dependencies:** None
- **Effort:** S

#### FEAT-002: Component Library Setup
- **Description:** Integrate shadcn/ui with Radix primitives
- **Acceptance Criteria:**
  - [ ] shadcn/ui CLI configured
  - [ ] Base components installed (Button, Input, Card, etc.)
  - [ ] Theme tokens configured (colors, spacing)
  - [ ] Dark mode CSS variables set up
- **Dependencies:** FEAT-001
- **Effort:** S

#### FEAT-003: Routing Setup
- **Description:** Configure React Router v6 with all page routes
- **Acceptance Criteria:**
  - [ ] Routes: /, /text, /image, /pdf, /folder, /excel, /about
  - [ ] Layout component with header/footer
  - [ ] 404 handling
  - [ ] Navigation component
- **Dependencies:** FEAT-001, FEAT-002
- **Effort:** S

#### FEAT-004: State Management
- **Description:** Set up Zustand store for application state
- **Acceptance Criteria:**
  - [ ] Zustand store configured
  - [ ] Diff state slice (left/right content, options, results)
  - [ ] Settings slice (theme, view mode preferences)
  - [ ] Persist settings to localStorage
- **Dependencies:** FEAT-001
- **Effort:** S

#### FEAT-005: Web Worker Infrastructure
- **Description:** Create reusable Web Worker communication pattern
- **Acceptance Criteria:**
  - [ ] Worker factory function
  - [ ] useWorker hook with loading/error/result states
  - [ ] Transferable object support for ArrayBuffers
  - [ ] Worker termination on unmount
  - [ ] TypeScript types for worker messages
- **Dependencies:** FEAT-001
- **Effort:** M

### P0: Text Diff Engine

#### FEAT-006: Text Diff Algorithm
- **Description:** Implement text comparison using jsdiff
- **Acceptance Criteria:**
  - [ ] Line-level diff (default)
  - [ ] Word-level diff option
  - [ ] Character-level diff option
  - [ ] Unified diff output format
  - [ ] Change statistics (added, removed, unchanged lines)
- **Dependencies:** FEAT-005
- **Effort:** M

#### FEAT-007: Diff Options
- **Description:** Implement diff configuration options
- **Acceptance Criteria:**
  - [ ] Ignore whitespace option
  - [ ] Ignore case option
  - [ ] Trim trailing whitespace option
  - [ ] Ignore blank lines option
  - [ ] Options persist in URL and localStorage
- **Dependencies:** FEAT-006
- **Effort:** S

#### FEAT-008: Syntax Highlighting
- **Description:** Add syntax highlighting for code files
- **Acceptance Criteria:**
  - [ ] Shiki integration with Web Worker
  - [ ] Support 15 languages: JavaScript, TypeScript, Python, Java, C++, Go, Rust, Ruby, PHP, Swift, Kotlin, HTML, CSS, JSON, YAML
  - [ ] Auto-detect language from content/extension
  - [ ] Manual language override
  - [ ] Highlighting preserved in diff view
- **Dependencies:** FEAT-006
- **Effort:** M

### P0: Diff Visualization

#### FEAT-009: Side-by-Side View
- **Description:** Two-panel diff view with synchronized scrolling
- **Acceptance Criteria:**
  - [ ] Left and right panels
  - [ ] Line numbers on both sides
  - [ ] Color-coded changes (green add, red remove, yellow modify)
  - [ ] Synchronized vertical scrolling
  - [ ] Line alignment for changes
  - [ ] Collapsible unchanged regions (> 5 lines)
- **Dependencies:** FEAT-006, FEAT-008
- **Effort:** L

#### FEAT-010: Unified View
- **Description:** Git-style unified diff view
- **Acceptance Criteria:**
  - [ ] Single-panel view
  - [ ] +/- prefixes for changes
  - [ ] Line numbers (old and new)
  - [ ] Hunk headers (@@ -X,Y +A,B @@)
  - [ ] Collapsible unchanged regions
- **Dependencies:** FEAT-006, FEAT-008
- **Effort:** M

#### FEAT-011: Inline View
- **Description:** Character-level inline diff within lines
- **Acceptance Criteria:**
  - [ ] Changed characters highlighted within lines
  - [ ] Works in both side-by-side and unified views
  - [ ] Toggle for word vs character granularity
- **Dependencies:** FEAT-009, FEAT-010
- **Effort:** M

#### FEAT-012: Virtual Scrolling
- **Description:** Handle large files with virtualized rendering
- **Acceptance Criteria:**
  - [ ] @tanstack/react-virtual integration
  - [ ] Smooth scrolling for 100K+ lines
  - [ ] Consistent line height calculation
  - [ ] Jump to line/change functionality
  - [ ] Performance: < 16ms frame time while scrolling
- **Dependencies:** FEAT-009, FEAT-010
- **Effort:** L

### P0: Input & Output

#### FEAT-013: File Input
- **Description:** Multiple methods to input files for comparison
- **Acceptance Criteria:**
  - [ ] Drag and drop zones for each panel
  - [ ] File picker buttons
  - [ ] Paste from clipboard (Ctrl+V)
  - [ ] Text area for direct input
  - [ ] File metadata display (name, size, type)
  - [ ] Clear/reset functionality
- **Dependencies:** FEAT-002, FEAT-003
- **Effort:** M

#### FEAT-014: URL Fragment Sharing
- **Description:** Share diffs via URL without server storage
- **Acceptance Criteria:**
  - [ ] LZ-String compression of content
  - [ ] Base64 encoding to URL fragment
  - [ ] Auto-load from URL on page load
  - [ ] Size limit warning (> 100KB compressed)
  - [ ] Copy URL button
  - [ ] Options included in URL
- **Dependencies:** FEAT-006, FEAT-007
- **Effort:** M

#### FEAT-015: Export Unified Diff
- **Description:** Export comparison as .diff file
- **Acceptance Criteria:**
  - [ ] Generate standard unified diff format
  - [ ] Download as .diff file
  - [ ] Copy to clipboard option
  - [ ] Include file names if available
- **Dependencies:** FEAT-006
- **Effort:** S

### P1: Polish

#### FEAT-016: Dark Mode
- **Description:** System-aware theme with manual toggle
- **Acceptance Criteria:**
  - [ ] Detect system preference
  - [ ] Manual toggle (light/dark/system)
  - [ ] Persist preference
  - [ ] Smooth transition animation
  - [ ] Accessible contrast ratios maintained
- **Dependencies:** FEAT-002
- **Effort:** S

#### FEAT-017: Keyboard Shortcuts
- **Description:** Keyboard navigation and actions
- **Acceptance Criteria:**
  - [ ] Next/previous change: j/k or n/p
  - [ ] Toggle view mode: v
  - [ ] Toggle options panel: o
  - [ ] Focus left/right panel: 1/2
  - [ ] Copy URL: Ctrl+Shift+C
  - [ ] Help modal: ?
  - [ ] Keyboard shortcut reference displayed
- **Dependencies:** FEAT-009, FEAT-010
- **Effort:** M

#### FEAT-018: Landing Page
- **Description:** Home page with feature overview and trust messaging
- **Acceptance Criteria:**
  - [ ] Clear value proposition headline
  - [ ] Feature cards for each comparison type
  - [ ] Privacy messaging with proof points
  - [ ] Quick start buttons to each tool
  - [ ] "Works offline" badge
  - [ ] "Open source" badge with GitHub link
- **Dependencies:** FEAT-003
- **Effort:** M

#### FEAT-019: CI/CD Pipeline
- **Description:** Automated testing and deployment
- **Acceptance Criteria:**
  - [ ] GitHub Actions workflow
  - [ ] Lint check on PR
  - [ ] Type check on PR
  - [ ] Unit tests on PR
  - [ ] Build verification
  - [ ] Auto-deploy to Vercel on main merge
  - [ ] Preview deployments for PRs
- **Dependencies:** FEAT-001
- **Effort:** M

### P2: Nice to Have (Phase 1)

#### FEAT-020: Diff Statistics Panel
- **Description:** Summary statistics for the comparison
- **Acceptance Criteria:**
  - [ ] Lines: added, removed, unchanged
  - [ ] Words: added, removed
  - [ ] Characters: added, removed
  - [ ] Similarity percentage
  - [ ] Collapsible panel
- **Dependencies:** FEAT-006
- **Effort:** S

#### FEAT-021: Line Wrapping Toggle
- **Description:** Option to wrap long lines or scroll horizontally
- **Acceptance Criteria:**
  - [ ] Toggle in options
  - [ ] Horizontal scroll when wrapping disabled
  - [ ] Preference persisted
- **Dependencies:** FEAT-009
- **Effort:** S

---

## Phase 2: Image & Performance

### P0: Image Comparison

#### FEAT-030: Image Diff Engine
- **Description:** Pixel-level image comparison using pixelmatch
- **Acceptance Criteria:**
  - [ ] pixelmatch integration in Web Worker
  - [ ] Support PNG, JPEG, WebP, GIF (first frame)
  - [ ] Handle different image sizes (scale to fit)
  - [ ] Diff image generation
  - [ ] Threshold configuration
- **Dependencies:** FEAT-005
- **Effort:** M

#### FEAT-031: Slider/Swipe View
- **Description:** Draggable slider revealing before/after
- **Acceptance Criteria:**
  - [ ] Vertical slider default
  - [ ] Horizontal slider option
  - [ ] Smooth dragging
  - [ ] Touch support
  - [ ] Keyboard control (arrow keys)
- **Dependencies:** FEAT-030
- **Effort:** M

#### FEAT-032: Fade/Onion Skin View
- **Description:** Opacity blending between images
- **Acceptance Criteria:**
  - [ ] Opacity slider (0-100%)
  - [ ] Keyboard: [ and ] to adjust
  - [ ] Auto-animate option
- **Dependencies:** FEAT-030
- **Effort:** S

#### FEAT-033: Difference Highlight View
- **Description:** Visual highlighting of pixel differences
- **Acceptance Criteria:**
  - [ ] Diff pixels highlighted in configurable color
  - [ ] Option to show only diff pixels
  - [ ] Option to overlay on original
  - [ ] Bounding box around diff regions
- **Dependencies:** FEAT-030
- **Effort:** M

#### FEAT-034: Image Statistics
- **Description:** Quantitative comparison metrics
- **Acceptance Criteria:**
  - [ ] Total pixels compared
  - [ ] Different pixels count and percentage
  - [ ] Dimensions comparison
  - [ ] File size comparison
- **Dependencies:** FEAT-030
- **Effort:** S

### P0: Performance

#### FEAT-040: Chunked Processing
- **Description:** Process large files in chunks to avoid UI freeze
- **Acceptance Criteria:**
  - [ ] Configurable chunk size
  - [ ] Yielding between chunks (requestIdleCallback)
  - [ ] Memory-efficient streaming where possible
  - [ ] Handles 50MB text files
- **Dependencies:** FEAT-005, FEAT-006
- **Effort:** L

#### FEAT-041: Progress Indicators
- **Description:** Visual feedback for long operations
- **Acceptance Criteria:**
  - [ ] Progress bar with percentage
  - [ ] Estimated time remaining (optional)
  - [ ] Current operation description
  - [ ] Cancel button
- **Dependencies:** FEAT-040
- **Effort:** M

#### FEAT-042: Operation Cancellation
- **Description:** Abort long-running comparisons
- **Acceptance Criteria:**
  - [ ] AbortController integration
  - [ ] Worker termination on cancel
  - [ ] Clean state reset
  - [ ] User confirmation for large operations
- **Dependencies:** FEAT-040, FEAT-041
- **Effort:** M

### P1: UX Enhancements

#### FEAT-050: Recent Comparisons
- **Description:** Store recent comparisons locally
- **Acceptance Criteria:**
  - [ ] IndexedDB storage
  - [ ] Last 20 comparisons
  - [ ] Metadata only (no full content for large files)
  - [ ] Quick re-open
  - [ ] Clear history option
- **Dependencies:** FEAT-006
- **Effort:** M

#### FEAT-051: Mobile Optimization
- **Description:** Touch-friendly interface for mobile devices
- **Acceptance Criteria:**
  - [ ] Responsive layout
  - [ ] Touch gestures for navigation
  - [ ] Swipe between panels
  - [ ] Pinch to zoom
  - [ ] Mobile-specific view modes
- **Dependencies:** FEAT-009, FEAT-031
- **Effort:** M

---

## Phase 3: PDF & Folder

### P0: PDF Comparison

#### FEAT-060: PDF Parsing
- **Description:** Extract text from PDFs using PDF.js
- **Acceptance Criteria:**
  - [ ] PDF.js Web Worker integration
  - [ ] Text extraction with page breaks
  - [ ] Handle multi-page documents
  - [ ] Progress for large PDFs
- **Dependencies:** FEAT-005
- **Effort:** L

#### FEAT-061: PDF Text Diff
- **Description:** Compare extracted PDF text
- **Acceptance Criteria:**
  - [ ] Reuse text diff engine
  - [ ] Page-aware comparison
  - [ ] Jump to page with changes
- **Dependencies:** FEAT-060, FEAT-006
- **Effort:** M

#### FEAT-062: PDF Page View
- **Description:** Side-by-side page rendering
- **Acceptance Criteria:**
  - [ ] Canvas-based page rendering
  - [ ] Page navigation
  - [ ] Zoom controls
  - [ ] Text overlay with highlights
- **Dependencies:** FEAT-060
- **Effort:** L

### P0: Folder Comparison

#### FEAT-070: Directory Input
- **Description:** Accept folder input for comparison
- **Acceptance Criteria:**
  - [ ] File System Access API (Chrome)
  - [ ] webkitdirectory fallback
  - [ ] Recursive directory reading
  - [ ] Ignore patterns (.git, node_modules)
- **Dependencies:** FEAT-013
- **Effort:** M

#### FEAT-071: Tree View
- **Description:** Hierarchical folder diff visualization
- **Acceptance Criteria:**
  - [ ] Expandable/collapsible tree
  - [ ] Icons for file types
  - [ ] Status indicators (added, removed, modified)
  - [ ] Filter by status
- **Dependencies:** FEAT-070
- **Effort:** L

#### FEAT-072: File Diff Integration
- **Description:** Click file in tree to see detailed diff
- **Acceptance Criteria:**
  - [ ] Click to open file diff panel
  - [ ] Keyboard navigation in tree
  - [ ] Quick preview on hover
- **Dependencies:** FEAT-071, FEAT-006
- **Effort:** M

### P0: PWA

#### FEAT-080: Service Worker
- **Description:** Implement service worker for offline caching
- **Acceptance Criteria:**
  - [ ] Workbox integration
  - [ ] Cache-first for static assets
  - [ ] Network-first for dynamic content (none currently)
  - [ ] Cache invalidation on update
- **Dependencies:** FEAT-019
- **Effort:** M

#### FEAT-081: Offline Support
- **Description:** Full functionality without network
- **Acceptance Criteria:**
  - [ ] All features work offline
  - [ ] Clear offline indicator
  - [ ] Graceful handling of URL sharing when offline
- **Dependencies:** FEAT-080
- **Effort:** M

#### FEAT-082: Install Prompt
- **Description:** PWA installation flow
- **Acceptance Criteria:**
  - [ ] Web App Manifest
  - [ ] Install prompt at appropriate time
  - [ ] Custom install button
  - [ ] Post-install experience
- **Dependencies:** FEAT-080
- **Effort:** S

---

## Phase 4: Excel & Advanced

### P0: Excel Comparison

#### FEAT-090: Excel Parsing
- **Description:** Parse Excel files using SheetJS
- **Acceptance Criteria:**
  - [ ] SheetJS Web Worker integration
  - [ ] Support .xlsx, .xls, .csv
  - [ ] Parse formulas and values
  - [ ] Handle multiple sheets
- **Dependencies:** FEAT-005
- **Effort:** M

#### FEAT-091: Cell Diff
- **Description:** Cell-by-cell comparison
- **Acceptance Criteria:**
  - [ ] Grid-based diff view
  - [ ] Color-coded cell changes
  - [ ] Value vs formula comparison mode
  - [ ] Navigate between changes
- **Dependencies:** FEAT-090
- **Effort:** L

#### FEAT-092: Row Alignment
- **Description:** Smart row matching for inserted/deleted rows
- **Acceptance Criteria:**
  - [ ] LCS-based row alignment
  - [ ] Handle inserted rows
  - [ ] Handle deleted rows
  - [ ] Row number mapping
- **Dependencies:** FEAT-091
- **Effort:** L

### P1: Advanced Features

#### FEAT-100: Three-Way Merge
- **Description:** Compare base version with two variants
- **Acceptance Criteria:**
  - [ ] Three-panel view
  - [ ] Conflict detection
  - [ ] Merge result generation
  - [ ] Works for text files
- **Dependencies:** FEAT-006, FEAT-009
- **Effort:** XL

#### FEAT-101: E2E Encrypted Sharing
- **Description:** Share larger diffs with encryption
- **Acceptance Criteria:**
  - [ ] Web Crypto API encryption
  - [ ] Key in URL fragment
  - [ ] Temporary server storage (optional hosted service)
  - [ ] Auto-expiry
- **Dependencies:** FEAT-014
- **Effort:** L

### P1: Self-Hosting

#### FEAT-110: Docker Image
- **Description:** Single-container deployment
- **Acceptance Criteria:**
  - [ ] Dockerfile with nginx
  - [ ] Multi-stage build
  - [ ] Configurable at runtime
  - [ ] Published to Docker Hub
- **Dependencies:** None
- **Effort:** M

#### FEAT-111: Self-Host Documentation
- **Description:** Guide for self-hosting
- **Acceptance Criteria:**
  - [ ] Docker Compose example
  - [ ] Kubernetes example
  - [ ] Nginx configuration
  - [ ] Security headers guide
- **Dependencies:** FEAT-110
- **Effort:** M

---

## Effort Key

| Size | Description | Rough Estimate |
|------|-------------|----------------|
| S | Small, straightforward | Few hours |
| M | Medium complexity | ~1 day |
| L | Large, complex | 2-3 days |
| XL | Very large, significant | 1 week+ |

---

## Feature Status Legend

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⏸️ Blocked
- ❌ Cancelled

---

**Document Version:** 1.0.0
**Next Review:** Weekly during active development
